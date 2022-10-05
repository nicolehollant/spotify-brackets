const changeIntoBye = (seed: number | null, participantsCount: number) => {
  return (seed as any) <= participantsCount ? seed : null
}

const getBracket = (participants: any[]) => {
  const participantsCount = participants.length
  const rounds = Math.ceil(Math.log(participantsCount) / Math.log(2))
  const bracketSize = Math.pow(2, rounds)
  const requiredByes = bracketSize - participantsCount

  console.log(`Number of participants: ${participantsCount}`)
  console.log(`Number of rounds: ${rounds}`)
  console.log(`Bracket size: ${bracketSize}`)
  console.log(`Required number of byes: ${requiredByes}`)

  if (participantsCount < 2) {
    return {
      rounds: 0,
      complete: true,
      matches: [],
    }
  }

  let matches: (number | null)[][] = [[1, 2]]

  for (let round = 1; round < rounds; round++) {
    const roundMatches = []
    const sum = Math.pow(2, round + 1) + 1

    for (let i = 0; i < matches.length; i++) {
      let home = changeIntoBye(matches[i][0], participantsCount)
      let away = changeIntoBye(sum - (matches[i][0] as any), participantsCount)
      roundMatches.push([home, away])
      home = changeIntoBye(sum - (matches[i][1] as any), participantsCount)
      away = changeIntoBye(matches[i][1], participantsCount)
      roundMatches.push([home, away])
    }
    matches = roundMatches
  }

  return {
    rounds,
    complete: false,
    matches,
  }
}

export const useBracket = (participants: any[]) => {
  const { matches, rounds, complete } = getBracket(participants)
  return {
    matches,
    rounds,
    complete,
  }
}
