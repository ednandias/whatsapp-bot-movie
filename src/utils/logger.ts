export function logger(...data: unknown[]) {
  if (process.env.LOGGER) {
    // eslint-disable-next-line no-console
    console.log(...data)
  }
}
