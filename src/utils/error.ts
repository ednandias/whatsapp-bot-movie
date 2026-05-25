import { Sentry } from '../services/sentry.js'
import { logger } from './logger.js'

export function catchErr(err: unknown, params?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    Sentry.captureException(err, { extra: { ...params } })
  } else {
    logger(err)
  }
}
