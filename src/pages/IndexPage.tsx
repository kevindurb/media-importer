import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

const importFileRepository = new ImportFileRepository();

export const IndexPage = () => {
  const importFiles = importFileRepository.findAll();
  return (
    <Layout>
      <form method='POST' action='/refresh'>
        <input type='submit' value='Refresh' class='btn btn-secondary' />
      </form>
      <ul class='list-group'>
        {importFiles.map((file) => (
          <li class='list-group-item d-flex justify-content-between align-items-center'>
            <span safe>{file.path}</span>
            <span class='badge text-bg-secondary rounded-pill' safe>
              {file.mimeType}
            </span>
          </li>
        ))}
      </ul>
    </Layout>
  );
};
