import type { Component } from '@kitajs/html';
import { PrismaClient } from '../../generated/prisma';
import { Layout } from '../layouts/Layout';
import { mimeTypeForFile } from '../utils/files';

const prisma = new PrismaClient();

type Props = {
  query?: string;
};

export const IndexPage: Component<Props> = async ({ query }) => {
  const importFiles = await (query
    ? prisma.importFile.findMany({
        where: {
          path: {
            contains: query,
          },
        },
        orderBy: {
          path: 'asc',
        },
      })
    : prisma.importFile.findMany({
        orderBy: {
          path: 'asc',
        },
      }));

  return (
    <Layout>
      <h1>Media Importer</h1>
      <form method='GET' action='/'>
        <div class='input-group mb-3'>
          <input required type='text' class='form-control' placeholder='Search' name='query' />
          <button class='btn btn-primary bi bi-search' type='submit'></button>
        </div>
      </form>
      <form method='POST' action='/refresh'>
        <button type='submit' class='btn btn-secondary bi bi-arrow-clockwise' />
      </form>
      <table class='table'>
        <thead>
          <tr>
            <th scope='col'>Path</th>
            <th scope='col'>Type</th>
            <th scope='col'>Match</th>
            <th scope='col'></th>
          </tr>
        </thead>
        <tbody>
          {importFiles.map((file) => (
            <tr>
              <td>
                <a href={`/import-files/${file.id}/match`} safe>
                  {file.path}
                </a>
              </td>
              <td>
                <span class='badge text-bg-secondary rounded-pill'>
                  {file.isTVShow ? 'TV Show' : 'Movie'}
                </span>
                <span class='badge text-bg-secondary rounded-pill' safe>
                  {mimeTypeForFile(file)}
                </span>
              </td>
              <td>
                <a
                  href={`/import-files/${file.id}/match`}
                  class='badge text-bg-warning rounded-pill'
                >
                  {file.tmdbMatchId ?? 'No Match Found'}
                </a>
              </td>
              <td>
                <button type='submit' class='btn btn-secondary bi bi-save' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};
