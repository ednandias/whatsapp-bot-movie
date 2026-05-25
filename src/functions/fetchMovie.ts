import { chooseMovie } from './chooseMovie.js'
import { api } from '../services/api.js'
import type { Result } from '../types/index.js'
import { catchErr } from '../utils/error.js'

export async function fetchMovie(categoryId: number) {
  try {
    const response = await api.get<Result>(
      `/discover/movie?include_adult=false&language=pt-BR&sort_by=popularity.desc&region=BR&with_original_language=en&release_date.gte=1990-01-01&vote_average.gte=5&with_genres=${categoryId}`,
    )

    const randomPage = Math.floor(Math.random() * response.data.total_pages) + 1

    const responseRandomPage = await api.get<Result>(
      `/discover/movie?include_adult=false&language=pt-BR&sort_by=popularity.desc&region=BR&with_original_language=en&release_date.gte=1990-01-01&vote_average.gte=5&with_genres=${categoryId}&page=${randomPage}`,
    )

    const movies = responseRandomPage.data.results

    const movie = await chooseMovie(movies)

    return movie
  } catch (err) {
    catchErr(err, { categoryId })
  }
}
