import { Request } from '@hapi/hapi';
import type { Manifest } from '@hapi/glue';
import Boom from '@hapi/boom';
import hapiJwt from 'hapi-auth-jwt2';
const { env } = process;
import Route from './api/routes';
import JwtAuth from './plugins/jwtAuth';

const manifest: Manifest = {
  server: {
    port: env.PORT ? Number(env.PORT) : 3012,
    host: env.HOST || 'localhost',
    debug: env.NODE_ENV !== 'development' ? false : { request: ['*'] },
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
      },
      validate: {
        failAction: (req: Request, _, err?: Error) => {
          if (env.NODE_ENV === 'production') {
            console.error('ValidationError:', err?.message);
            throw Boom.badRequest('Invalid request payload input');
          } else {
            console.log(req.query, req.params, req.payload);
            // During development, log and respond with the full error.
            console.error(err);
            throw err;
          }
        },
      },
    },
    state: {
      strictHeader: false,
      ignoreErrors: true,
    },
  },
  register: {
    plugins: [
      {
        plugin: require('blipp'),
        options: { showAuth: true },
      },
      {
        plugin: require('@hapi/nes'),
        options: {},
      },
      { plugin: hapiJwt },
      {
        plugin: { ...JwtAuth },
      },
      {
        plugin: { ...Route },
      },
    ],
  },
};

export default manifest;
