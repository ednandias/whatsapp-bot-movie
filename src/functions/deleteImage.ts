import fs from 'node:fs/promises'
import path from 'node:path'

export async function deleteImage(filename: string) {
  try {
    const pathToFile = path.resolve(
      import.meta.dirname,
      '..',
      'assets',
      'temp',
      filename,
    )

    await fs.unlink(pathToFile)
  } catch (err) {
    console.log(err)
  }
}
