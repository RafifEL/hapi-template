import dotenv from 'dotenv';
dotenv.config();
import Glue from '@hapi/glue';
import type {
  Lifecycle,
  Request,
  ResponseObject,
  ResponseToolkit,
  Server,
} from '@hapi/hapi';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { v4 } from 'uuid';
import manifest from './manifest';
moment.tz.setDefault('Asia/Jakarta');

let server: Server;

const init = async () => {
  server = await Glue.compose(manifest, {
    relativeTo: __dirname,
  });

  server.events.on('start', () => {
    console.log('Server running on', server.info.uri);
  });

  server.events.on('stop', () => {
    console.log('Server stopped running');
  });

  server.ext(
    'onRequest',
    (req: Request, h: ResponseToolkit): Lifecycle.ReturnValue => {
      req.info.id = v4(); // update request id
      return h.continue;
    }
  );

  server.events.on('response', (request: Request) => {
    const { method, path, response, route, info } = request;
    const { statusCode } = response as ResponseObject;
    const { settings } = route;
    const { id, received } = info;

    let status = statusCode.toString().split('')[0];
    if (status === '2') status = chalk.green(statusCode); // HTTP Status Code: 2xx
    if (status === '4') status = chalk.yellow(statusCode); // HTTP Status Code: 4xx
    if (status === '5') status = chalk.red(statusCode); // HTTP Status Code: 5xx
    const reqMethod = chalk.bgGreen(method.toUpperCase());
    const timestamp = '[' + moment().format('YYYY/MM/DD-HH:mm:ss') + ']';

    if (!['health', 'getMe'].includes(settings.id as string)) {
      const elapsed = new Date().getTime() - received;
      console.log(
        `${timestamp} - ${id} :: ${reqMethod} ${path} --> ${status} (${elapsed}ms)`
      );
    }
  });

  return server.start();
};

process.on('unhandledRejection', err => {
  console.log(err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

init();
