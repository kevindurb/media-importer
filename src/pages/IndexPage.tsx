import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

const importFileRepository = new ImportFileRepository();

export const IndexPage = () => {
  const importFiles = importFileRepository.findAll();
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
                <span class='badge text-bg-secondary rounded-pill' safe>
                  {file.mimeType}
                </span>
              </td>
              <td>
                <span class='badge text-bg-warning rounded-pill'>No Match Found</span>
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
