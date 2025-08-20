import { PrismaClient } from '../../generated/prisma';
import { Layout } from '../layouts/Layout';
import { mimeTypeForFile } from '../utils/files';

const prisma = new PrismaClient();

export const IndexPage = async () => {
  const importFiles = await prisma.importFile.findMany();
  return (
    <Layout>
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
              <td safe>{file.path}</td>
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
