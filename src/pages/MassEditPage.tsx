import type { Component } from '@kitajs/html';
import { PrismaClient } from '../../generated/prisma';
import { TMDBCard } from '../components/TMDBCard';
import { Layout } from '../layouts/Layout';
import { getMatchesForQuery } from '../services/matchFiles';
import { TMDB } from '../TMDB';
import { fromImportPath } from '../utils/files';

type Props = {
  fileIds: number[];
  tmdbQuery?: string;
};

const tmdb = new TMDB();
const prisma = new PrismaClient();

export const MassEditPage: Component<Props> = async ({ fileIds, tmdbQuery }) => {
  const tmdbConfig = await tmdb.getConfiguration();
  const files = await prisma.importFile.findMany({ where: { id: { in: fileIds } } });
  const [firstFile] = files;
  if (!firstFile) throw new Error('missing files');
  const matches = tmdbQuery ? await getMatchesForQuery(tmdbQuery, firstFile.isTVShow) : [];

  return (
    <Layout>
      <h1>Mass Edit</h1>
      <table class='table'>
        <thead>
          <tr>
            <th scope='col'>Path</th>
            <th scope='col'>Match</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr>
              <td>
                <span safe>{fromImportPath(file)}</span>
              </td>
              <td>
                <span
                  class={`badge text-bg-${file.tmdbMatchId ? 'success' : 'warning'} rounded-pill`}
                >
                  {file.tmdbMatchId ?? 'No Match Found'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Match Search</h2>
      <form method='GET' action={`/import-files/mass-edit`}>
        {files.map((file) => (
          <input type='hidden' name='fileIds' value={file.id.toString()} />
        ))}
        <div class='input-group mb-3'>
          <input
            required
            type='text'
            class='form-control'
            placeholder='Search'
            name='tmdbQuery'
            value={tmdbQuery}
          />
          <button class='btn btn-primary bi bi-search' type='submit'></button>
        </div>
      </form>
      <form method='POST' action={`/import-files/mass-edit`}>
        {files.map((file) => (
          <input type='hidden' name='fileIds' value={file.id.toString()} />
        ))}
        <div class='d-flex align-items-center gap-3'>
          <button type='submit' class='btn btn-primary'>
            Save
          </button>

          <div class='form-check form-switch'>
            <input
              class='form-check-input'
              type='checkbox'
              name='isTVShow'
              value='1'
              id='is-tv-show'
              checked={firstFile.isTVShow}
            />
            <label class='form-check-label' for='is-tv-show'>
              TV Show
            </label>
          </div>
        </div>

        <div class='row'>
          {matches.map((match) => (
            <div class='col-md-4 my-2'>
              <TMDBCard object={match} tmdbConfig={tmdbConfig} importFile={firstFile} />
            </div>
          ))}
        </div>
      </form>
    </Layout>
  );
};
