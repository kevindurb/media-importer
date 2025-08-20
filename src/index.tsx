import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import { assets } from './assets';
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
    ...assets,
    '/health': new Response('OK'),
    '/': () => new Response(renderToStream(<IndexPage />)),
    '/refresh': {
      POST: async () => {
        await importFileRepository.loadFromImportsPath();
        return Response.redirect('/');
      },
    },
    '/import-files/:id/match': {
      GET: (req) => new Response(renderToStream(<MatchPage id={req.params.id} />)),
      POST: async (_req) => {
        return Response.redirect(`/`);
      },
    },
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
