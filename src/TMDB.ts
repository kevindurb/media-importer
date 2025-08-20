import { Environment } from './Environment';

const env = new Environment();

type ListResponse<Item> = {
  results: Item[];
};

type MovieListObject = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
};

export class TMDB {
  private apiKey = env.getTMDBApiKey();

  private buildUrl(path: string) {
    return new URL(`/3${path}`, 'https://api.themoviedb.org');
  }

  private async fetch<ResponseBody>(url: URL): Promise<ResponseBody> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      if (!response.ok) throw response;
      const body = await response.json();
      return body as ResponseBody;
    } catch (error) {
      throw new Error(`TMDB Error: ${error}`);
    }
  }

  searchMovie(query: string) {
    const url = this.buildUrl('/search/movie');
    url.searchParams.set('query', query);
    return this.fetch<ListResponse<MovieListObject>>(url);
  }
}
