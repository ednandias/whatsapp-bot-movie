import 'dotenv/config'
import type { Boom } from '@hapi/boom'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import Compose from './compose/index.js'

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  const sock = makeWASocket({
    // can provide additional config here
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

      // console.log(
      //   'connection closed due to ',
      //   lastDisconnect?.error,
      //   ', reconnecting ',
      //   shouldReconnect,
      // )

      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      // console.log('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      const userId = m.key.remoteJid!
      const userMessage = m.message?.conversation?.toLowerCase()?.trim() ?? ''

      if (m.key.fromMe) continue

      await compose.action(userId, userMessage)
    }
  })

  // to storage creds (session info) when it updates
  sock.ev.on('creds.update', saveCreds)
}

// run in main file
connectToWhatsApp()
