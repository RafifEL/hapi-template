import Boom from '@hapi/boom';
import {
  Request,
  ResponseObject,
  ResponseToolkit,
  ServerRoute,
  ValidationObject,
} from '@hapi/hapi';
import Bcrypt from 'bcrypt';
import Joi from 'joi';
import JWT from 'jsonwebtoken';
import { DB } from '../../db/models';
import { STRING } from '../../utils/constants';
// import Alert from '../../utils/slack';
import Redis from '../../utils/redis';
import { UserAttributes } from 'src/db/models/user';

const { REDIS_KEY } = STRING;
interface LoginRequest extends Request {
  payload: {
    username: string;
    password: string;
  };
}

export interface UserInfo {
  id?: number;
}

const generateToken = async (user: UserAttributes): Promise<string> => {
  const secret = (process.env.JWT_SECRET || STRING.SECRET.JWT) as JWT.Secret;
  const session = {
    userId: user.id,
    email: user.email,
    username: user.username,
    roles: user.details?.roles,
  };
  const token = JWT.sign({ session }, secret, {
    algorithm: STRING.ALGORITHM.HS256 as 'HS256', // default
    expiresIn: process.env.JWT_VALIDITY || STRING.HOUR[8],
  });

  const redis = await Redis.getInstance();
  await redis.setKeyWithExpiry(
    REDIS_KEY.AUTH.TOKEN,
    `${user.id}`,
    token,
    8 * 3600
  );
  return token;
};

const AuthRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/auth/login',
    handler: async (
      request: LoginRequest,
      h: ResponseToolkit
    ): Promise<ResponseObject | Boom.Boom> => {
      const { username, password } = request.payload;

      try {
        const user = await DB.Model.User.findOne({
          where: { username },
        });

        if (!user) return Boom.notFound('User Not Found');

        const passwordMatch: boolean = await Bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) return Boom.forbidden('Password not match');

        const token = await generateToken(user);

        const redis = await Redis.getInstance();
        await redis.setKeyWithExpiry(
          REDIS_KEY.AUTH.USER,
          `${user.id}`,
          JSON.stringify(user.toJSON()),
          8 * 3600
        );

        return h.response({ token });
      } catch (e) {
        console.error(e);
        return h.response('OK');
      }
    },
    options: {
      id: 'login',
      auth: false,
      description: 'login',
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
        }),
      } as ValidationObject,
    },
  },
  {
    method: 'POST',
    path: '/auth/logout',
    options: {
      description: 'logout',
    },
    handler: async (
      request: Request,
      h: ResponseToolkit
    ): Promise<ResponseObject> => {
      const userId = request.auth.credentials.userId as string;
      const redis = await Redis.getInstance();
      await redis.delKey(REDIS_KEY.AUTH.TOKEN, userId);
      await redis.delKey(REDIS_KEY.AUTH.USER, userId);

      return h.response('Bye').code(200);
    },
  },
  {
    method: 'GET',
    path: '/auth/me',
    options: {
      id: 'getMe',
    },
    handler: async (
      request: Request,
      h: ResponseToolkit
    ): Promise<ResponseObject> => {
      return h.response(request.auth.credentials).code(200);
    },
  },
];

export default AuthRoutes;
