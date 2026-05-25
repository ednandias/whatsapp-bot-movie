import { redis } from '../services/redis.js'
import type { Sock } from '../types/index.js'
import { chooseCategory } from './functions/chooseCategory.js'
import { renderMovie } from './functions/renderMovie.js'
import { genres } from '../data/genres.js'

const STATE_TTL_SECONDS = 60 * 10

export type SerializableAction = {
  name: string
  isActive: boolean
  hasWorked: boolean
}

export type Action = SerializableAction & {
  input: {
    shouldBe: (msg: string) => boolean
    exec: (msg: string) => Promise<void>
    fallback: string
  }
}

export default class Compose {
  private readonly sock: Sock

  constructor(sock: Sock) {
    this.sock = sock
  }

  private buildActions(
    userId: string,
    savedState?: SerializableAction[],
  ): Action[] {
    const defaults = savedState ?? [
      { name: 'choose_category', isActive: true, hasWorked: false },
      { name: 'render_movie', isActive: false, hasWorked: false },
    ]

    return defaults.map((s) => {
      if (s.name === 'choose_category') {
        return {
          ...s,
          input: {
            shouldBe: (msg) => msg === '!filme',
            exec: () => chooseCategory(this.sock, userId),
            fallback: 'Digite *!filme* para que possamos prosseguir.',
          },
        }
      }

      return {
        ...s,
        input: {
          shouldBe: (msg) =>
            genres.findIndex((g) => String(g.seqId) === msg) !== -1,
          exec: (msg) => renderMovie(this.sock, userId, msg),
          fallback: 'Categoria inválida!',
        },
      }
    })
  }

  private stateKey(userId: string) {
    return `compose:state:${userId}`
  }

  private async getState(userId: string): Promise<Action[] | null> {
    const raw = await redis.get(this.stateKey(userId))
    if (!raw) return null

    const saved: SerializableAction[] = JSON.parse(raw)
    return this.buildActions(userId, saved)
  }

  private async setState(userId: string, actions: Action[]) {
    // Só persiste a parte serializável — as funções são reconstruídas em buildActions
    const serializable: SerializableAction[] = actions.map(
      ({ name, isActive, hasWorked }) => ({
        name,
        isActive,
        hasWorked,
      }),
    )

    await redis.set(
      this.stateKey(userId),
      JSON.stringify(serializable),
      'EX',
      STATE_TTL_SECONDS,
    )
  }

  private async deleteState(userId: string) {
    await redis.del(this.stateKey(userId))
  }

  private async nextAction(userId: string, actions: Action[], idx: number) {
    const action = actions[idx]
    const nxAction = actions[idx + 1]

    let updated = actions

    if (action) {
      updated = updated.with(idx, {
        ...action,
        isActive: false,
        hasWorked: true,
      })
    }

    if (nxAction) {
      updated = updated.with(idx + 1, { ...nxAction, isActive: true })
      await this.setState(userId, updated)
    } else {
      await this.deleteState(userId)
    }
  }

  async action(userId: string, userMessage: string) {
    let actions = await this.getState(userId)

    if (!actions) {
      actions = this.buildActions(userId)
      await this.setState(userId, actions)
    }

    for (const [index, action] of actions.entries()) {
      if (action.isActive && !action.hasWorked) {
        const { shouldBe, exec, fallback } = action.input

        if (shouldBe(userMessage)) {
          await exec(userMessage)
          await this.nextAction(userId, actions, index)
        } else {
          await this.sock.sendMessage(userId, { text: fallback })
        }
      }
    }
  }
}
