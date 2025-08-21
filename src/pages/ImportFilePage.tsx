import type { Component } from '@kitajs/html';
import { PrismaClient } from '../../generated/prisma';
import { TMDBCard } from '../components/TMDBCard';
import { Layout } from '../layouts/Layout';
import { TMDBMatchService } from '../services/TMDBMatchService';
import { TMDB } from '../TMDB';
import { fromImportPath } from '../utils/files';

type Props = {
  id: number;
  tmdbQuery?: string;
};

const tmdb = new TMDB();
const prisma = new PrismaClient();
const tmdbMatchService = new TMDBMatchService();

export const ImportFilePage: Component<Props> = async ({ id, tmdbQuery }) => {
  const importFile = await prisma.importFile.findUnique({ where: { id } });
  if (!importFile) throw new Error('Not Found');

  const tmdbConfig = await tmdb.getConfiguration();
  const matches = await tmdbMatchService.getMatchesForFile(importFile, tmdbQuery);
  const currentMatch = await (importFile.tmdbMatchId &&
    (importFile.isTVShow
      ? tmdb.getTVDetails(importFile.tmdbMatchId)
      : tmdb.getMovieDetails(importFile.tmdbMatchId)));

  const currentMatchName = currentMatch
    ? 'title' in currentMatch
      ? currentMatch.title
      : currentMatch.name
    : 'No Match';

  return (
    <Layout>
      <a href='/'>Back</a>
      <div class='d-flex justify-content-between'>
        <h1 safe>{fromImportPath(importFile)}</h1>
        <form method='POST' action={`/import-files/${importFile.id}/import`}>
          <button class='btn btn-primary' type='submit'>
            Import
          </button>
        </form>
      </div>
      <div class='row'>
        <div class='col'>
          {currentMatch ? (
            <div class='ratio' style='--bs-aspect-ratio: 150%;'>
              <img
                src={`${tmdbConfig.images.secure_base_url}/w500${currentMatch.poster_path}`}
                class='rounded'
                alt={currentMatchName}
              />
            </div>
          ) : (
            <div
              class='ratio placeholder rounded d-flex align-items-center justify-content-center'
              style='--bs-aspect-ratio: 150%;'
            />
          )}
        </div>
        <div class='col'>
          <h2 safe>{currentMatchName}</h2>
          <h5 safe>{importFile.importPath}</h5>
        </div>
      </div>

      <h2>Match Search</h2>
      <form method='GET' action={`/import-files/${importFile.id}`}>
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
      <form method='POST' action={`/import-files/${importFile.id}`}>
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
              checked={importFile.isTVShow}
            />
            <label class='form-check-label' for='is-tv-show'>
              TV Show
            </label>
          </div>

          {importFile.isTVShow ? (
            <div class='input-group'>
              <span class='input-group-text'>S</span>
              <input
                type='text'
                class='form-control'
                placeholder='Season'
                name='season'
                value={`${importFile.season ?? ''}`}
              />
              <span class='input-group-text'>E</span>
              <input
                type='text'
                class='form-control'
                placeholder='Episode'
                name='episode'
                value={`${importFile.episode ?? ''}`}
              />
            </div>
          ) : (
            <div class='input-group'>
              <span class='input-group-text'>Part</span>
              <input
                type='text'
                class='form-control'
                placeholder='Part'
                name='part'
                value={`${importFile.part ?? ''}`}
              />
            </div>
          )}
        </div>

        <div class='row'>
          {matches.map((match) => (
            <div class='col-md-4 my-2'>
              <TMDBCard object={match} tmdbConfig={tmdbConfig} importFile={importFile} />
            </div>
          ))}
        </div>
      </form>
    </Layout>
  );
};
