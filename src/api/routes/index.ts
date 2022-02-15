import { ResponseToolkit, ServerRoute, Server } from '@hapi/hapi';
import fs from 'fs';

const allRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/health',
    handler: (_, h: ResponseToolkit) => h.response('snek snek').code(200),
    options: {
      id: 'health',
      auth: false,
      description: 'Check service status',
    },
  },
];

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && !file.split('.').includes('map'))
  .forEach(file => {
    const routes: ServerRoute[] = require(`./${file}`).default;
    if (routes && routes.length) {
      allRoutes.push(...routes);
    }
  });

const Route = {
  register: (server: Server) => server.route(allRoutes),
  name: 'API Routes',
};

export default Route;
