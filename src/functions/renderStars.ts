export function renderStars(n: number) {
  let stars = ''

  for (let c = 1; c <= n; c++) {
    stars += '⭐️'
  }

  stars += `(${n}) de 10`

  return stars
}
