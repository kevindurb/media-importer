import type { Component } from '@kitajs/html';
import type * as CSS from 'csstype';
import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';
import { TMDB } from '../TMDB';

type Props = {
  id: string;
  tmdbQuery?: string;
};

const importFileRepository = new ImportFileRepository();
const tmdb = new TMDB();

const ellipsisOverflowStyle: CSS.Properties = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

export const MatchPage: Component<Props> = async ({ id, tmdbQuery }) => {
  const importFile = importFileRepository.findById(id);
  if (!importFile) throw new Error('Not Found');

  const tmdbConfig = await tmdb.getConfiguration();
  const matches = await importFile.getTMDBMatches(tmdbQuery);
  console.log(tmdbConfig);

  return (
    <Layout>
      <h1 safe>{importFile.fileName}</h1>
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
