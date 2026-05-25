export function logger(...data: any[]) {
  if (process.env.LOGGER) {
    console.log(data)
  }
}