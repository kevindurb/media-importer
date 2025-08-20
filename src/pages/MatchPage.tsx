import type { Component } from '@kitajs/html';
import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

type Props = {
  id: string;
};

const importFileRepository = new ImportFileRepository();

export const MatchPage: Component<Props> = async ({ id }) => {
  const importFile = importFileRepository.findById(id);
  if (!importFile) throw new Error('Not Found');

  const matches = await importFile.getTMDBMatches();

  return (
    <Layout>
      <h1 safe>{importFile.fileName}</h1>
      <form method='POST' action={`/import-files/${importFile.id}/match`}>
        <button type='submit' class='btn btn-primary'>
          Update Match
        </button>
        <table class='table'>
          <thead>
            <tr>
              <th scope='col'>ID</th>
              <th scope='col'>Title</th>
              <th scope='col'>Release Date</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr>
                <td>{match.id}</td>
                <td safe>{match.title}</td>
                <td safe>{match.release_date}</td>
                <td>
                  <input
                    class='form-check-input'
                    type='radio'
                    name='tmdbMatchId'
                    value={match.id.toString()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    </Layout>
  );
};
