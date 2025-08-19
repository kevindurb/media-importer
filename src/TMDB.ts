import { Environment } from './Environment';

const env = new Environment();

export class TMDB {
  private apiKey = env.getTMDBApiKey();

  private buildUrl(path: string) {
    return new URL(path, 'https://api.themoviedb.org/3');
  }

  searchMovie(query: string) {
    const url = this.buildUrl('/search/movie');
    url.searchParams.set('query', query);
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    }).then((res) => res.json());
  }
}
