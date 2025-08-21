import { renderToStream } from '@kitajs/html/suspense';
import bun from 'bun';
import qs from 'qs';
import z from 'zod';
import { PrismaClient } from '../generated/prisma';
import { assets } from './assets';
import { Environment } from './Environment';
import { IndexPage } from './pages/IndexPage';
import { MatchPage } from './pages/MatchPage';
import { ImportFileToLibraryService } from './services/ImportFileToLibraryService';
import { LoadImportFilesService } from './services/LoadImportFilesService';

const prisma = new PrismaClient();
const env = new Environment();
const loadImportFilesService = new LoadImportFilesService();
const importFileToLibraryService = new ImportFileToLibraryService();

const optionalParseString = z
  .string()
  .optional()
  .transform((value) => (value ? Number.parseInt(value) : undefined));

const UpdateImportFileBody = z.object({
  tmdbMatchId: optionalParseString,
  isTVShow: z
    .string()
    .optional()
    .default('1')
    .transform((value) => value === '1'),
  season: optionalParseString,
  episode: optionalParseString,
});

bun.serve({
  port: env.getPort(),
  routes: {
    ...assets,
    '/health': new Response('OK'),
    '/': (req) =>
      new Response(
        renderToStream(
          <IndexPage query={new URL(req.url).searchParams.get('query') ?? undefined} />,
        ),
      ),
    '/refresh': {
      POST: async () => {
        await loadImportFilesService.loadFromImportsPath();
        return Response.redirect('/');
      },
    },
    '/import-files/:id': {
      GET: (req) =>
        new Response(
          renderToStream(
            <MatchPage
              id={Number.parseInt(req.params.id)}
              tmdbQuery={new URL(req.url).searchParams.get('tmdbQuery') ?? undefined}
            />,
          ),
        ),
      POST: async (req) => {
        const id = Number.parseInt(req.params.id);
        const data = UpdateImportFileBody.parse(qs.parse(await req.text()));
        await prisma.importFile.update({
          where: { id },
          data,
        });
        return Response.redirect(`/import-files/${id}`);
      },
    },
    '/import-files/:id/import': {
      POST: async (req) => {
        const id = Number.parseInt(req.params.id);
        const file = await prisma.importFile.findUnique({ where: { id } });
        if (file) {
          await importFileToLibraryService.importFile(file);
        }
        return Response.redirect('/');
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
