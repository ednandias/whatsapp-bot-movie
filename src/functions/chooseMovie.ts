import { format } from 'date-fns'
import type { Movie } from '../types/index.js'
import { fetchPoster } from './fetchPoster.js'
import { getWatchProviders } from './getWatchProviders.js'

export async function chooseMovie(movies: Movie[]) {
  const randomIndex = Math.floor(Math.random() * movies.length)

  const movie = movies[randomIndex]

  if (movie?.id) {
    const { id, title, overview, release_date, poster_path, vote_average } =
      movie

    const filename = await fetchPoster(poster_path, title)

    const providers = await getWatchProviders(id, 'BR')

    return {
      id,
      title,
      overview,
      release_date: format(release_date, 'yyyy'),
      filename: filename ?? null,
      vote_average: Math.floor(vote_average),
      providers: providers ? { ...providers } : null,
    }
  }

  return null
}
