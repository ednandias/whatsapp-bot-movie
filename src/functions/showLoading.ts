import { sentences } from '../data/sentences.js'
import type { Sock } from '../types/index.js'

export async function showLoading(sock: Sock, userId: string) {
  const sentence =
    sentences[Math.floor(Math.random() * sentences.length - 1)] ??
    'Carregando...'

  await sock.sendMessage(userId, {
    text: `_${sentence}_`,
  })
}
