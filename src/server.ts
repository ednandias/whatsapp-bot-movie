import 'dotenv/config'
import type { Boom } from '@hapi/boom'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import Compose from './compose/index.js'
import { initSentry } from './services/sentry.js'
import { logger } from './utils/logger.js'

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  const sock = makeWASocket({
    auth: state,
  })

  const compose = new Compose(sock)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) qrcode.generate(qr, { small: true })

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom).output.statusCode !==
        DisconnectReason.loggedOut

      logger(
        'connection closed due to ',
        lastDisconnect?.error,
        ', reconnecting ',
        shouldReconnect,
      )

      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      logger('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const m of messages) {
      const userId = m.key.remoteJid!
      const userMessage = m.message?.conversation?.toLowerCase()?.trim() ?? ''

      if (m.key.fromMe) return

      await compose.action(userId, userMessage)
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

initSentry()
connectToWhatsApp()
