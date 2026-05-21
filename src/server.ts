import 'dotenv/config'
import type { Boom } from '@hapi/boom'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import { sentences } from './data/sentences.js'
import { fetchMovie } from './functions/fetchMovie.js'
import { getImage } from './functions/getImage.js'
import { renderStars } from './functions/renderStars.js'

async function connectToWhatsApp() {
  let steps = {
    chooseCategory: {
      active: true,
      workedOut: false,
    },
    renderMovie: {
      active: false,
      workedOut: false,
    },
  }

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  const sock = makeWASocket({
    // can provide additional config here
    auth: state,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) qrcode.generate(qr, { small: true })

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom).output.statusCode !==
        DisconnectReason.loggedOut

      console.log(
        'connection closed due to ',
        lastDisconnect?.error,
        ', reconnecting ',
        shouldReconnect,
      )

      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      const userMessage = m.message?.conversation?.toLowerCase()
      const userId = m.key.remoteJid!

      if (m.key.fromMe) {
        return
      }

      console.log({ userMessage, steps })

      if (steps.chooseCategory.active && !steps.chooseCategory.workedOut) {
        if (userMessage === '!filme') {
          await sock.sendMessage(
            userId,
            {
              text: `*Digite o número da categoria correspondente:*\n1 - 🧛🏼‍♂️ Terror\n2 - 💥 Ação\n3 - 😂 Comédia\n4 - 🧸 Animação\n5 - 🐍 Aventura`,
            },
            { quoted: m },
          )

          steps = {
            chooseCategory: { active: false, workedOut: true },
            renderMovie: { active: true, workedOut: false },
          }
        } else {
          await sock.sendMessage(userId, {
            text: `Digite *!filme* para que possamos prosseguir.`,
          })
        }
      } else if (steps.renderMovie.active && !steps.renderMovie.workedOut) {
        if (['1', '2', '3', '4', '5'].includes(userMessage!)) {
          const horror = 27
          const action = 28
          const comedy = 35
          const animation = 16
          const adventure = 12

          let categoryId = null

          switch (userMessage) {
            case '1': {
              categoryId = horror
              break
            }

            case '2': {
              categoryId = action
              break
            }

            case '3': {
              categoryId = comedy
              break
            }

            case '4': {
              categoryId = animation
              break
            }

            case '5': {
              categoryId = adventure
              break
            }
          }

          const sentence =
            sentences[Math.floor(Math.random() * sentences.length - 1)] ??
            'Carregando...'

          await sock.sendMessage(userId, {
            text: `_${sentence}_`,
          })

          const movie = await fetchMovie(categoryId ?? action)

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
          } else {
            await sock.sendMessage(userId, {
              text: '❌ Houve um erro ao buscar filme, tente novamente em alguns minutos.',
            })
          }
        } else {
          await sock.sendMessage(userId, {
            text: 'Essa opção não é válida!',
          })
        }
      }
    }
  })

  // to storage creds (session info) when it updates
  sock.ev.on('creds.update', saveCreds)
}

// run in main file
connectToWhatsApp()
