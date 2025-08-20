import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import qs from 'qs';
import z from 'zod';
import { assets } from './assets';
import { Environment } from './Environment';
import { IndexPage } from './pages/IndexPage';
import { MatchPage } from './pages/MatchPage';
import { ImportFileRepository } from './repositories/ImportFileRepository';

const importFileRepository = new ImportFileRepository();
importFileRepository.init();

const env = new Environment();

const UpdateMatchBody = z.object({
  tmdbMatchId: z.string().transform((value) => Number.parseInt(value)),
});

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
      GET: (req) =>
        new Response(
          renderToStream(
            <MatchPage
              id={req.params.id}
              tmdbQuery={new URL(req.url).searchParams.get('tmdbQuery') ?? undefined}
            />,
          ),
        ),
      POST: async (req) => {
        const body = UpdateMatchBody.parse(qs.parse(await req.text()));
        await importFileRepository.updateMatch(req.params.id, body.tmdbMatchId);
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
