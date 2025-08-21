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
  poster_path: string;
  backdrop_path: string;
};

type MovieObject = MovieListObject & {
  imdb_id: string;
};

type TVListObject = {
  id: number;
  name: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
};

type TVObject = TVListObject & {
  number_of_episodes: number;
  number_of_seasons: number;
};

type TVSeasonObject = {
  id: number;
  name: string;
  episodes: {
    id: number;
    name: string;
  }[];
};

type Configuration = {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
  };
};

const withCache = async <Id, ResultType>(
  cache: Map<Id, ResultType>,
  id: Id,
  cb: () => ResultType | Promise<ResultType>,
) => {
  const cached = cache.get(id);
  if (cached) return cached;
  const result = await cb();
  if (result) cache.set(id, result);
  return result;
};

export class TMDB {
  private apiKey = env.getTMDBApiKey();

  private movieDetailsCache: Map<number, MovieObject | undefined> = new Map();
  private tvDetailsCache: Map<number, TVObject | undefined> = new Map();
  private tvSeasonDetailsCache: Map<string, TVSeasonObject | undefined> = new Map();
  private movieSearchCache: Map<string, ListResponse<MovieListObject> | undefined> = new Map();
  private tvSearchCache: Map<string, ListResponse<TVListObject> | undefined> = new Map();

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

  getConfiguration() {
    return this.fetch<Configuration>(this.buildUrl('/configuration'));
  }

  searchMovie(query: string) {
    return withCache(this.movieSearchCache, query, () => {
      const url = this.buildUrl('/search/movie');
      url.searchParams.set('query', query);
      return this.fetch<ListResponse<MovieListObject>>(url);
    });
  }

  searchTV(query: string) {
    return withCache(this.tvSearchCache, query, () => {
      const url = this.buildUrl('/search/tv');
      url.searchParams.set('query', query);
      return this.fetch<ListResponse<TVListObject>>(url);
    });
  }

  async getMovieDetails(id: number) {
    return withCache(this.movieDetailsCache, id, () => {
      const url = this.buildUrl(`/movie/${id}`);
      return this.fetch<MovieObject>(url);
    });
  }

  async getTVDetails(id: number) {
    return withCache(this.tvDetailsCache, id, () => {
      const url = this.buildUrl(`/tv/${id}`);
      return this.fetch<TVObject>(url);
    });
  }

  async getTVSeasonDetails(id: number, season: number) {
    return withCache(this.tvSeasonDetailsCache, `${id}-${season}`, () => {
      const url = this.buildUrl(`/tv/${id}/season/${season}`);
      return this.fetch<TVSeasonObject>(url);
    });
  }
}
