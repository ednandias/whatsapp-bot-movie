import { genres } from '../../data/genres.js'
import { buildMovieContent } from '../../functions/buildMovieContent.js'
import { deleteImage } from '../../functions/deleteImage.js'
import { fetchMovie } from '../../functions/fetchMovie.js'
import { getImage } from '../../functions/getImage.js'
import { showLoading } from '../../functions/showLoading.js'
import type { Sock } from '../../types/index.js'
import { logger } from '../../utils/logger.js'

export async function renderMovie(
  sock: Sock,
  userId: string,
  userMessage: string,
) {
  const selectedGenre =
    genres.find((genre) => String(genre.seqId) === userMessage)?.id ??
    genres[0]!.id

  logger({ userId, userMessage, selectedGenre })

  await showLoading(sock, userId)

  const movie = await fetchMovie(selectedGenre)

  if (!movie?.id) {
    await sock.sendMessage(userId, {
      text: '❌ Erro ao buscar filme, tente novamente.',
    })

    return
  }

  try {
    const image = movie.filename ? await getImage(movie?.filename) : null
    const content = buildMovieContent(movie)

    logger({ movie })

    if (image) {
      await sock.sendMessage(userId, {
        image,
        caption: content,
      })
    } else {
      await sock.sendMessage(userId, { text: content })
    }
  } finally {
    if (movie.filename) await deleteImage(movie?.filename)
  }
}
