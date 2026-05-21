import fs from 'node:fs/promises'
import path from 'node:path'

export async function getImage(filename: string) {
  try {
    const pathToFile = path.resolve(
      import.meta.dirname,
      '..',
      'assets',
      'temp',
      filename,
    )

    const image = await fs.readFile(pathToFile)

    return image
  } catch (err) {
    console.log(err)
  }
}
