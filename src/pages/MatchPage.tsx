import type { Component } from '@kitajs/html';
import type * as CSS from 'csstype';
import { PrismaClient } from '../../generated/prisma';
import { Layout } from '../layouts/Layout';
import { TMDBMatchService } from '../services/TMDBMatchService';
import { TMDB } from '../TMDB';
import { fileName } from '../utils/files';

type Props = {
  id: number;
  tmdbQuery?: string;
};

const tmdb = new TMDB();
const prisma = new PrismaClient();
const tmdbMatchService = new TMDBMatchService();

const ellipsisOverflowStyle: CSS.Properties = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

export const MatchPage: Component<Props> = async ({ id, tmdbQuery }) => {
  const importFile = await prisma.importFile.findUnique({ where: { id } });
  if (!importFile) throw new Error('Not Found');

  const tmdbConfig = await tmdb.getConfiguration();
  const matches = await tmdbMatchService.getMatchesForFile(importFile, tmdbQuery);

  return (
    <Layout>
      <h1 safe>{fileName(importFile)}</h1>
      <form method='GET' action={`/import-files/${importFile.id}/match`}>
        <div class='input-group mb-3'>
          <input required type='text' class='form-control' placeholder='Search' name='tmdbQuery' />
          <button class='btn btn-primary bi bi-search' type='submit'></button>
        </div>
      </form>
      <form method='POST' action={`/import-files/${importFile.id}/match`}>
        <button type='submit' class='btn btn-primary'>
          Update Match
        </button>

        <div class='row'>
          {matches.map((match) => (
            <div class='col-md-4 my-2'>
              <div class='card'>
                <div class='ratio' style='--bs-aspect-ratio: 150%;'>
                  <img
                    src={`${tmdbConfig.images.secure_base_url}/w500${match.poster_path}`}
                    class='card-img-top'
                    alt={'title' in match ? match.title : match.name}
                  />
                </div>
                <div class='card-img-overlay'>
                  <input
                    class='form-check-input'
                    type='radio'
                    name='tmdbMatchId'
                    value={match.id.toString()}
                    checked={match.id === importFile.tmdbMatchId}
                  />
                </div>
                <div class='card-body'>
                  <h5
                    class='card-title overflow-hidden'
                    style={ellipsisOverflowStyle}
                    safe
                  >{`${match.id}: ${'title' in match ? match.title : match.name}`}</h5>
                  <h6 class='card-subtitle mb-2 text-body-secondary' safe>
                    {match.release_date}
                  </h6>
                  <p class='card-text overflow-hidden' style={ellipsisOverflowStyle} safe>
                    {match.overview}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </Layout>
  );
};
