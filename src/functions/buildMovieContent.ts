import { renderStars } from './renderStars.js'

interface IMovie {
  id: number
  title: string
  overview: string
  release_date: string
  filename: string | null
  vote_average: number
  providers: {
    flatrate: string
    rent: string
    buy: string
  } | null
}

export function buildMovieContent(movie: IMovie) {
  const movieProviders = movie.providers
    ? `💰️ ${movie.providers.flatrate}\n\n🏠️ ${movie.providers.rent}\n\n💰️ ${movie.providers.buy}`
    : '❌🇧🇷 Filme não disponível no Brasil.'

  const stars = renderStars(movie.vote_average)

  const content = `*${movie.title} (${movie.release_date})*\n\n${movie.overview}\n\n${stars}\n\n${movieProviders}\n\n_Todos os dados fornecidos por *The Movie Database (TMDB)*_.`

  return content
}
