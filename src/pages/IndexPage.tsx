import { Layout } from '../layouts/Layout';
import { ImportFileRepository } from '../repositories/ImportFileRepository';

const importFileRepository = new ImportFileRepository();

export const IndexPage = () => {
  const importFiles = importFileRepository.findAll();
  return (
    <Layout>
      <form method='POST' action='/refresh'>
        <input type='submit' value='Refresh' class='btn' />
      </form>
      <ul class='list-group'>
        {importFiles.map((file) => (
          <li class='list-group-item' safe>
            {file.path}
          </li>
        ))}
      </ul>
    </Layout>
  );
};
