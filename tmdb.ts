interface MovieInfo {}

export class TMDB {
  constructor(private apiKey: string) {}

  async search(query: string): Promise<MovieInfo[]> {
    return [];
  }
}
