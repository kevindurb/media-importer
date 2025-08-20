import type { Component } from '@kitajs/html';
import type * as CSS from 'csstype';
import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';
import { TMDB } from '../TMDB';

type Props = {
  id: string;
};

const importFileRepository = new ImportFileRepository();
const tmdb = new TMDB();

const ellipsisOverflowStyle: CSS.Properties = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

export const MatchPage: Component<Props> = async ({ id }) => {
  const importFile = importFileRepository.findById(id);
  if (!importFile) throw new Error('Not Found');

  const tmdbConfig = await tmdb.getConfiguration();
  const matches = await importFile.getTMDBMatches();

  return (
    <Layout>
      <h1 safe>{importFile.fileName}</h1>
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
                    alt={match.title}
                  />
                </div>
                <div class='card-img-overlay'>
                  <input
                    class='form-check-input'
                    type='radio'
                    name='tmdbMatchId'
                    value={match.id.toString()}
                  />
                </div>
                <div class='card-body'>
                  <h5
                    class='card-title overflow-hidden'
                    style={ellipsisOverflowStyle}
                    safe
                  >{`${match.id}: ${match.title}`}</h5>
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
