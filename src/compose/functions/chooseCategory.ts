import { genres } from '../../data/genres.js'
import type { Sock } from '../../types/index.js'

export async function chooseCategory(sock: Sock, userId: string) {
  const genresList = genres.reduce((acc, item) => {
    acc += `\n${item.seqId} - ${item.name}`

    return acc
  }, '')

  await sock.sendMessage(userId, {
    text: `*Digite o número da categoria correspondente:*${genresList}`,
  })
}
