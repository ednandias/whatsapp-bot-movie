import fs from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'

export async function fetchPoster(posterPath: string, title: string) {
  try {
    const url = `https://image.tmdb.org/t/p/w342/${posterPath}`

    const response = await fetch(url)

    const arrBuf = await response.arrayBuffer()

    const slug = slugify(title, { trim: true, lower: true })

    const filename = `${slug}.jpg`

    const pathToSave = path.resolve(import.meta.dirname, '..', 'assets', 'temp')

    await fs.writeFile(`${pathToSave}/${filename}`, Buffer.from(arrBuf))

    return filename
  } catch (err) {
    console.log(err)
  }
}
