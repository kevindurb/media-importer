import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import { refresh } from './commands/refresh';
import { Environment } from './Environment';
import { IndexPage } from './pages/IndexPage';
import { ImportFileRepository } from './repositories/ImportFileRepository';

const importFileRepository = new ImportFileRepository();
importFileRepository.init();

const env = new Environment();

bun.serve({
  port: env.getPort(),
  routes: {
    '/health': new Response('OK'),
    '/': () => new Response(renderToStream(<IndexPage />)),
    '/refresh': {
      POST: async () => {
        await refresh();
        return Response.redirect('/');
      },
    },
    '/bootstrap.css': new Response(
      await bun.file('./node_modules/bootstrap/dist/css/bootstrap.min.css').bytes(),
      {
        headers: {
          'Content-Type': 'text/css',
        },
      },
    ),
  },
  error(error) {
    console.error(error);
    return new Response(`Internal Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
});

console.log(`listening on http://localhost:${env.getPort()}`);
