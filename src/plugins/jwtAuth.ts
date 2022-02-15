import type { Plugin, Server } from '@hapi/hapi';
import { JwtPayload } from 'jsonwebtoken';
import Redis from '../utils/redis';
import { STRING } from '../utils/constants';
import { Role } from 'src/db/models/user';
const { env } = process;
const { REDIS_KEY } = STRING;

interface DecodedPayload extends JwtPayload {
  session: {
    userId: number;
    email: string;
    username: string;
    roles: Role[];
  };
}

const Auth: Plugin<any> = {
  register: function (server: Server): void {
    server.auth.strategy('jwt', 'jwt', {
      key: env.JWT_SECRET || 'secret',
      verifyOptions: { algorithms: ['HS256'] },
      validate: async (decoded: DecodedPayload) => {
        const { userId, roles } = decoded.session;
        const redis = await Redis.getInstance();

        if (!userId) {
          return { isValid: false };
        }

        try {
          const token = await redis.getKey(REDIS_KEY.AUTH.TOKEN, userId + '');
          if (!token) {
            return { isValid: false };
          }

          return {
            isValid: true,
            credentials: { ...decoded.session, scope: roles },
          };
        } catch (e) {
          console.log(e);
          return { isValid: false };
        }
      },
    });
    server.auth.default('jwt');
  },
  name: 'Jwt-Auth',
};

export default Auth;
