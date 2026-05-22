import { chooseCategory } from './functions/chooseCategory.js'
import { renderMovie } from './functions/renderMovie.js'
import type { Sock } from '../types/index.js'
import { genres } from '../data/genres.js'

export type Action = {
  name: string
  isActive: boolean
  hasWorked: boolean
  input: {
    shouldBe: (msg: string) => boolean
    exec: () => Promise<void>
    fallback: string
  }
}

export default class Compose {
  private readonly sock: Sock
  private state: Map<string, Action[]> = new Map()

  constructor(sock: Sock) {
    this.sock = sock
  }

  private setActions(userId: string, userMessage: string): Action[] {
    const defaultOptions = {
      isActive: false,
      hasWorked: false,
    }

    return [
      {
        ...defaultOptions,
        name: 'choose_category',
        isActive: true,
        input: {
          shouldBe: (msg: string) => msg === '!filme',
          exec: () => chooseCategory(this.sock, userId),
          fallback: `Digite *!filme* para que possamos prosseguir.`,
        },
      },
      {
        ...defaultOptions,
        name: 'render_movie',
        input: {
          shouldBe: (msg: string) =>
            genres.findIndex((genre) => String(genre.seqId) === msg) !== -1
              ? true
              : false,
          exec: () => renderMovie(this.sock, userId, userMessage),
          fallback: `Categoria inválida!`,
        },
      },
    ]
  }

  private nextAction(userId: string, idx: number) {
    let actions = this.state.get(userId)

    if (actions && actions?.length > 0) {
      const action = actions[idx]
      const nxAction = actions[idx + 1]

      if (action) {
        actions = actions.with(idx, {
          ...action,
          isActive: false,
          hasWorked: true,
        })
      }

      if (nxAction) {
        actions = actions.with(idx + 1, {
          ...nxAction,
          isActive: true,
        })

        this.state.set(userId, actions)
      }

      // dentro de nextAction, quando não há próxima ação
      if (!nxAction) {
        this.state.delete(userId) // permite recomeçar o fluxo
      }
    }
  }

  async action(userId: string, userMessage: string) {
    if (!this.state.has(userId)) {
      this.state.set(userId, this.setActions(userId, userMessage))
    }

    const actions = this.state.get(userId)
    if (!actions) return

    for (const [index, action] of actions.entries()) {
      if (action.isActive && !action.hasWorked) {
        const { shouldBe, exec, fallback } = action.input

        if (shouldBe(userMessage)) {
          await exec()
          this.nextAction(userId, index)
        } else {
          this.sock.sendMessage(userId, {
            text: fallback,
          })
        }
      }
    }
  }
}
