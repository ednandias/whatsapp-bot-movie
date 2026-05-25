import { api } from '../services/api.js'
import type { WatchProvider } from '../types/index.js'
import { catchErr } from '../utils/error.js'

export async function getWatchProviders(movieId: number, region: string) {
  try {
    const response = await api.get<WatchProvider>(
      `/movie/${movieId}/watch/providers`,
    )

    const providers = response.data.results[region]

    if (
      providers?.buy ||
      providers?.flatrate ||
      providers?.rent ||
      providers?.ads
    ) {
      const { buy, flatrate, rent, ads } = providers

      const buyFormatted = buy?.reduce((acc, value, idx, arr) => {
        const isLast = idx + 1 === arr.length

        if (value.provider_name) {
          acc += `* ${value.provider_name}${!isLast ? `\n` : ''}`
        }

        return acc
      }, 'Disponível para comprar em:\n')

      const flatrateFormatted = [...(flatrate ?? []), ...(ads ?? [])]?.reduce(
        (acc, value, idx, arr) => {
          const isLast = idx + 1 === arr.length

          if (value.provider_name) {
            acc += `* ${value.provider_name}${!isLast ? `\n` : ''}`
          }

          return acc
        },
        'Disponível nas plataformas:\n',
      )

      const rentFormatted = rent?.reduce((acc, value, idx, arr) => {
        const isLast = idx + 1 === arr.length

        if (value.provider_name) {
          acc += `* ${value.provider_name}${!isLast ? `\n` : ''}`
        }

        return acc
      }, 'Disponível para alugar em:\n')

      return {
        flatrate:
          flatrateFormatted ?? '*Não disponível em nenhuma plataforma*.',
        rent: rentFormatted ?? '*Não disponível para aluguel*.',
        buy: buyFormatted ?? '*Não disponível para compra*.',
      }
    } else {
      return null
    }
  } catch (err) {
    catchErr(err, { movieId, region })
  }
}
