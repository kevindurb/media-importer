import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import { refresh } from './commands/refresh';
import { Environment } from './Environment';
import { IndexPage } from './pages/IndexPage';
import { MatchPage } from './pages/MatchPage';
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
    '/import-files/:id/match': {
      GET: (req) => new Response(renderToStream(<MatchPage id={req.params.id} />)),
      POST: async (req) => {
        return Response.redirect(`/`);
      },
    },
    '/bootstrap.css': new Response(
      await bun.file('./node_modules/bootstrap/dist/css/bootstrap.min.css').bytes(),
      { headers: { 'Content-Type': 'text/css' } },
    ),
    '/bootstrap-icons.css': new Response(
      await bun.file('./node_modules/bootstrap-icons/font/bootstrap-icons.min.css').bytes(),
      { headers: { 'Content-Type': 'text/css' } },
    ),
    '/fonts/bootstrap-icons.woff2': new Response(
      await bun.file('./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2').bytes(),
      { headers: { 'Content-Type': 'font/woff2' } },
    ),
    '/fonts/bootstrap-icons.woff': new Response(
      await bun.file('./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff').bytes(),
      { headers: { 'Content-Type': 'font/woff' } },
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
