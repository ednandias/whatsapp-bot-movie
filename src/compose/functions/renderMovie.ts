import { genres } from '../../data/genres.js'
import { removeImage } from '../../functions/deleteImage.js'
import { fetchMovie } from '../../functions/fetchMovie.js'
import { getImage } from '../../functions/getImage.js'
import { renderStars } from '../../functions/renderStars.js'
import { showLoading } from '../../functions/showLoading.js'
import type { Sock } from '../../types/index.js'

export async function renderMovie(
  sock: Sock,
  userId: string,
  userMessage: string,
) {
  const selectedGenre =
    genres.find((genre) => String(genre.seqId) === userMessage)?.id ??
    genres[0]!.id

  await showLoading(sock, userId)

  const movie = await fetchMovie(selectedGenre)

  if (movie?.id) {
    const movieProviders = movie.providers
      ? `💰️ ${movie.providers.flatrate}\n\n🏠️ ${movie.providers.rent}\n\n💰️ ${movie.providers.buy}`
      : '❌🇧🇷 Filme não disponível no Brasil.'

    const stars = renderStars(movie.vote_average)

    const movieContent = `*${movie.title} (${movie.release_date})*\n\n${movie.overview}\n\n${stars}\n\n${movieProviders}\n\n_Todos os dados fornecidos por *The Movie Database (TMDB)*_.`

    const image = await getImage(movie?.filename ?? '')

    if (image) {
      await sock.sendMessage(userId, {
        image,
        caption: movieContent,
      })
    } else {
      await sock.sendMessage(userId, { text: movieContent })
    }

    await removeImage(movie?.filename ?? '')
  } else {
    await sock.sendMessage(userId, {
      text: '❌ Houve um erro ao buscar filme, tente novamente em alguns minutos.',
    })
  }
}
