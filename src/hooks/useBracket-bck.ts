export const shuffleArr = <T = any>(arr: T[]) => {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

type BracketEntry<T> = { value: T; seed: number }

const useBracket = <T = any>(bracket: BracketEntry<T>[], initialSeeding?: BracketEntry<T>[]) => {
  if (initialSeeding) {
    bracket = bracket.sort((a, b) => a.seed - b.seed)
  }
  const initialMatchups: BracketEntry<T>[][] = []
  const output: { matchup: (T | null)[]; winner: T }[] = []
  const powersOfTwo = Array.from({ length: 10 }).map((_, i) => [i, Math.pow(2, i)])
  const [numRounds, closestPowerOfTwo] = powersOfTwo
    .filter((a) => bracket.length <= a[1])
    .sort((a, b) => bracket.length - b[1] - (bracket.length - a[1]))[0]
  const numByes = closestPowerOfTwo - bracket.length

  for (let i = 0; i < numByes; i++) {
    output.push({ matchup: [bracket[i].value, null], winner: bracket[i].value })
  }

  // SEED: 1
  // INDX: 0

  // SEED: 1 2
  // INDX: 0 1

  // SEED: 1 4   3 2
  // INDX: 0 1   2 3

  // SEED: 1 8   5 4   3 6   7 2
  // INDX: 0 1   2 3   4 5   6 7
  // for(let i = 0; i < Math.pow(2, 3); i++) {

  // }

  const _bracket: BracketEntry<T>[] = bracket.slice(numByes)
  const halfwayPoint = Math.floor(_bracket.length / 2)
  const topHalf = []
  const bottomHalf = []

  for (let i = 0; i < halfwayPoint; i++) {
    if (i % 2 === 0) {
      topHalf.push([_bracket[i], _bracket[_bracket.length - (i + 1)]])
    } else {
      bottomHalf.unshift([_bracket[i], _bracket[_bracket.length - (i + 1)]])
    }
  }
  initialMatchups.push(...topHalf, ...bottomHalf)

  return {
    bracket,
    initialMatchups,
    closestPowerOfTwo,
    numByes,
    numRounds,
    output,
  }
}

export default useBracket
