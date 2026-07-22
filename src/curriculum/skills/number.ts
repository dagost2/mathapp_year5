import { Skill, choicesFrom, fmt, grouped, gcd } from '../types'

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands']

const placeValue: Skill = {
  id: 'place-value',
  strandId: 'number',
  title: 'Place value',
  blurb: 'What each digit in a big number is worth',
  guide: {
    summary:
      'Every digit has a value that depends on WHERE it sits. Counting from the right, the places are ones, tens, hundreds, thousands, ten thousands, hundred thousands.',
    steps: [
      'Start at the right-hand digit and count the places leftwards: ones, tens, hundreds, thousands…',
      'Find which place your digit is sitting in.',
      'Multiply the digit by that place value.'
    ],
    example: {
      question: 'What is the value of the 6 in 46 208?',
      working: [
        'Counting from the right: 8 is ones, 0 is tens, 2 is hundreds, 6 is thousands.',
        'The 6 sits in the thousands place.',
        '6 × 1000 = 6000'
      ],
      answer: '6000'
    },
    watchOut: 'The value is not just the digit. The 6 in 46 208 is worth 6000, not 6.'
  },
  generate(level, rng) {
    const digits = level === 1 ? 4 : level === 2 ? 5 : 6
    const n = rng.int(Math.pow(10, digits - 1), Math.pow(10, digits) - 1)
    let pos = rng.int(0, digits - 1)
    let digit = Math.floor(n / Math.pow(10, pos)) % 10
    // A zero digit makes for a trick question rather than a teaching one.
    let guard = 0
    while (digit === 0 && guard++ < 10) {
      pos = rng.int(0, digits - 1)
      digit = Math.floor(n / Math.pow(10, pos)) % 10
    }
    const value = digit * Math.pow(10, pos)
    return {
      id: `place-value-${rng.seed}`,
      skillId: 'place-value',
      level,
      prompt: `What is the value of the digit ${digit} in ${grouped(n)}?`,
      answer: String(value),
      inputMode: 'choice',
      choices: choicesFrom(value, [digit, value * 10, value / 10, digit * 100], rng),
      hints: [
        'Count the places from the right: ones, tens, hundreds, thousands…',
        `Which place is the ${digit} sitting in?`,
        `The ${digit} is in the ${PLACE_NAMES[pos]} place, so it is worth ${digit} lots of ${grouped(Math.pow(10, pos))}.`
      ],
      worked: [
        `Counting from the right in ${grouped(n)}, the ${digit} sits in the ${PLACE_NAMES[pos]} place.`,
        `${digit} × ${grouped(Math.pow(10, pos))} = ${grouped(value)}`,
        `So the ${digit} is worth ${grouped(value)}.`
      ]
    }
  }
}

const rounding: Skill = {
  id: 'rounding',
  strandId: 'number',
  title: 'Rounding',
  blurb: 'Rounding to the nearest 10, 100 or 1000',
  guide: {
    summary: 'Rounding replaces a number with a nearby tidy number. You decide using the digit just to the RIGHT of the place you are rounding to.',
    steps: [
      'Underline the digit in the place you are rounding to.',
      'Look at the single digit immediately to its right.',
      'If that digit is 5 or more, round up. If it is 4 or less, keep the digit the same.',
      'Replace every digit to the right with zeros.'
    ],
    example: {
      question: 'Round 4 738 to the nearest hundred.',
      working: [
        'The hundreds digit is 7.',
        'The digit to its right is 3.',
        '3 is less than 5, so the 7 stays.',
        'Zeros after it: 4 700'
      ],
      answer: '4700'
    },
    watchOut: 'Only look at ONE digit to the right — not the whole rest of the number.'
  },
  generate(level, rng) {
    const place = level === 1 ? 10 : level === 2 ? 100 : 1000
    const placeName = place === 10 ? 'ten' : place === 100 ? 'hundred' : 'thousand'
    const n = rng.int(place * 2, place * 90)
    const answer = Math.round(n / place) * place
    const remainder = n % place
    const deciding = Math.floor(remainder / (place / 10)) % 10
    return {
      id: `rounding-${rng.seed}`,
      skillId: 'rounding',
      level,
      prompt: `Round ${grouped(n)} to the nearest ${placeName}.`,
      answer: String(answer),
      inputMode: 'choice',
      choices: choicesFrom(answer, [answer + place, answer - place, Math.floor(n / place) * place + place * 2], rng),
      hints: [
        `You are rounding to the nearest ${placeName}, so look at the ${placeName}s digit.`,
        'Now look at the one digit immediately to its right.',
        `That digit is ${deciding}. Is it 5 or more (round up), or 4 or less (stay)?`
      ],
      worked: [
        `Rounding ${grouped(n)} to the nearest ${placeName}.`,
        `The digit just to the right of the ${placeName}s place is ${deciding}.`,
        deciding >= 5 ? `${deciding} is 5 or more, so we round up.` : `${deciding} is 4 or less, so the digit stays the same.`,
        `Answer: ${grouped(answer)}`
      ]
    }
  }
}

const mentalAddSub: Skill = {
  id: 'mental-add-sub',
  strandId: 'number',
  title: 'Adding & subtracting',
  blurb: 'Mental strategies for + and − with bigger numbers',
  guide: {
    summary: 'Split numbers into friendly parts instead of doing everything at once.',
    steps: [
      'Split the second number into hundreds, tens and ones.',
      'Add (or subtract) one part at a time, keeping a running total.',
      'Or: round to a tidy number, then adjust at the end.'
    ],
    example: {
      question: '347 + 198',
      working: ['198 is nearly 200.', '347 + 200 = 547', 'We added 2 too many, so take 2 off.', '547 − 2 = 545'],
      answer: '545'
    },
    watchOut: 'If you round UP to make it easy, you must take the extra back OFF at the end.'
  },
  generate(level, rng) {
    const isAdd = rng.bool()
    const max = level === 1 ? 500 : level === 2 ? 2000 : 9000
    const a = rng.int(Math.floor(max / 3), max)
    const b = rng.int(20, Math.floor(max / 2))
    const answer = isAdd ? a + b : a - b
    const names = ['Mia', 'Zara', 'Ollie', 'Ruby', 'Noah', 'Ava']
    const name = rng.pick(names)
    const useWords = level > 1 && rng.bool()
    const prompt = useWords
      ? isAdd
        ? `${name} collected ${grouped(a)} stickers and then collected ${grouped(b)} more. How many does ${name} have now?`
        : `${name} had ${grouped(a)} stickers and gave away ${grouped(b)}. How many are left?`
      : `${grouped(a)} ${isAdd ? '+' : '−'} ${grouped(b)} = ?`
    return {
      id: `mental-add-sub-${rng.seed}`,
      skillId: 'mental-add-sub',
      level,
      prompt,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        isAdd ? 'Try adding the hundreds first, then the tens, then the ones.' : 'Try subtracting the hundreds first, then the tens, then the ones.',
        `Split ${grouped(b)} into its parts to make it easier.`,
        `Start from ${grouped(a)} and ${isAdd ? 'add' : 'take away'} one part at a time.`
      ],
      worked: [
        `${grouped(a)} ${isAdd ? '+' : '−'} ${grouped(b)}`,
        `Split ${grouped(b)} into ${splitParts(b).join(' + ')}.`,
        ...runningSteps(a, b, isAdd),
        `Answer: ${grouped(answer)}`
      ]
    }
  }
}

/** Breaks a number into place-value chunks, e.g. 198 -> [100, 90, 8]. */
function splitParts(n: number): number[] {
  const parts: number[] = []
  const s = String(n)
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i])
    if (d > 0) parts.push(d * Math.pow(10, s.length - 1 - i))
  }
  return parts
}

function runningSteps(a: number, b: number, isAdd: boolean): string[] {
  let running = a
  return splitParts(b).map(part => {
    const before = running
    running = isAdd ? running + part : running - part
    return `${grouped(before)} ${isAdd ? '+' : '−'} ${grouped(part)} = ${grouped(running)}`
  })
}

const multiDigitMult: Skill = {
  id: 'multiplication',
  strandId: 'number',
  title: 'Multiplication',
  blurb: 'Multiplying bigger numbers by splitting them up',
  guide: {
    summary: 'Break one number into tens and ones, multiply each part, then add the results. This is the "area" or "split" method.',
    steps: [
      'Split the bigger number into tens and ones.',
      'Multiply each part separately.',
      'Add the two answers together.'
    ],
    example: {
      question: '34 × 6',
      working: ['Split 34 into 30 and 4.', '30 × 6 = 180', '4 × 6 = 24', '180 + 24 = 204'],
      answer: '204'
    },
    watchOut: 'Do not forget to add the two parts together at the end.'
  },
  generate(level, rng) {
    const a = level === 1 ? rng.int(12, 40) : level === 2 ? rng.int(20, 99) : rng.int(100, 400)
    const b = level === 3 ? rng.int(11, 25) : rng.int(3, 9)
    const answer = a * b
    const tens = Math.floor(a / 10) * 10
    const ones = a % 10
    return {
      id: `multiplication-${rng.seed}`,
      skillId: 'multiplication',
      level,
      prompt: `${a} × ${b} = ?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        `Split ${a} into ${tens} and ${ones}.`,
        `Work out ${tens} × ${b} first.`,
        `Then work out ${ones} × ${b} and add the two answers together.`
      ],
      worked: [
        `Split ${a} into ${tens} + ${ones}.`,
        `${tens} × ${b} = ${grouped(tens * b)}`,
        `${ones} × ${b} = ${ones * b}`,
        `${grouped(tens * b)} + ${ones * b} = ${grouped(answer)}`
      ]
    }
  }
}

const divisionRemainders: Skill = {
  id: 'division',
  strandId: 'number',
  title: 'Division & remainders',
  blurb: 'Sharing into equal groups, and what is left over',
  guide: {
    summary: 'Division asks "how many equal groups?" A remainder is what is left when the sharing does not come out evenly.',
    steps: [
      'Ask: how many times does the divisor fit in?',
      'Use multiplication facts you know to get close.',
      'Whatever is left over is the remainder.',
      'Read the question carefully — sometimes you need the remainder, sometimes you need to round UP.'
    ],
    example: {
      question: '38 pencils shared between 5 people. How many each, and how many left over?',
      working: ['5 × 7 = 35, which is close to 38.', '5 × 8 = 40, which is too big.', 'So 7 each.', '38 − 35 = 3 left over.'],
      answer: '7 each, remainder 3'
    },
    watchOut: 'If the question is about buses or boxes, you usually need to round UP so nobody is left behind.'
  },
  generate(level, rng) {
    const divisor = rng.int(3, level === 1 ? 6 : 12)
    const quotient = rng.int(level === 1 ? 3 : 8, level === 3 ? 60 : 20)
    const remainder = rng.int(1, divisor - 1)
    const total = divisor * quotient + remainder
    const askRemainder = rng.bool()
    const answer = askRemainder ? remainder : quotient
    return {
      id: `division-${rng.seed}`,
      skillId: 'division',
      level,
      prompt: askRemainder
        ? `${total} lollies are shared equally between ${divisor} children. How many lollies are left over?`
        : `${total} lollies are shared equally between ${divisor} children. How many does each child get?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        `How many times does ${divisor} fit into ${total}?`,
        `Try some multiples of ${divisor}: ${divisor * 2}, ${divisor * 5}, ${divisor * 10}…`,
        `${divisor} × ${quotient} = ${divisor * quotient}, which is just under ${total}.`
      ],
      worked: [
        `${total} ÷ ${divisor}`,
        `${divisor} × ${quotient} = ${divisor * quotient}`,
        `${total} − ${divisor * quotient} = ${remainder} left over.`,
        `So each child gets ${quotient} with ${remainder} left over.`,
        `The question asks for ${askRemainder ? 'the leftovers' : 'how many each'}, so the answer is ${answer}.`
      ]
    }
  }
}

const factorsMultiples: Skill = {
  id: 'factors-multiples',
  strandId: 'number',
  title: 'Factors & multiples',
  blurb: 'Numbers that divide in, and numbers in the times table',
  guide: {
    summary:
      'A FACTOR divides into a number exactly (factors of 12: 1, 2, 3, 4, 6, 12). A MULTIPLE is what you get when you count in that number (multiples of 4: 4, 8, 12, 16…).',
    steps: [
      'For factors: test 1, 2, 3, 4… and see which divide in with nothing left over.',
      'Factors come in pairs — 12 = 3 × 4, so 3 and 4 are both factors.',
      'For multiples: count up in that number.'
    ],
    example: {
      question: 'Which of these is a factor of 18?  4,  5,  6,  8',
      working: ['18 ÷ 4 = 4 remainder 2 — no.', '18 ÷ 5 = 3 remainder 3 — no.', '18 ÷ 6 = 3 exactly — yes!'],
      answer: '6'
    },
    watchOut: 'Factors are SMALLER than the number (or equal). Multiples are BIGGER than the number (or equal). Easy to mix up.'
  },
  generate(level, rng) {
    const askFactor = rng.bool()
    if (askFactor) {
      const n = rng.pick(level === 1 ? [12, 16, 18, 20, 24] : level === 2 ? [24, 30, 36, 40, 42] : [48, 56, 60, 72, 84])
      const factors: number[] = []
      for (let i = 2; i < n; i++) if (n % i === 0) factors.push(i)
      const correct = rng.pick(factors)
      const nonFactors: number[] = []
      for (let i = 2; i < n && nonFactors.length < 6; i++) if (n % i !== 0) nonFactors.push(i)
      return {
        id: `factors-multiples-${rng.seed}`,
        skillId: 'factors-multiples',
        level,
        prompt: `Which of these numbers is a factor of ${n}?`,
        answer: String(correct),
        inputMode: 'choice',
        choices: choicesFrom(correct, rng.shuffle(nonFactors), rng),
        hints: [
          `A factor divides into ${n} with nothing left over.`,
          `Try dividing ${n} by each option.`,
          `Which one gives a whole number with no remainder?`
        ],
        worked: [
          `A factor of ${n} divides into it exactly.`,
          `${n} ÷ ${correct} = ${n / correct} with no remainder.`,
          `So ${correct} is a factor of ${n}.`
        ]
      }
    }
    const base = rng.int(3, level === 1 ? 6 : 12)
    const which = rng.int(level === 1 ? 3 : 6, level === 3 ? 15 : 10)
    const answer = base * which
    return {
      id: `factors-multiples-${rng.seed}`,
      skillId: 'factors-multiples',
      level,
      prompt: `What is the ${ordinal(which)} multiple of ${base}?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        `Multiples of ${base} are what you get counting in ${base}s.`,
        `The 1st multiple is ${base}, the 2nd is ${base * 2}, and so on.`,
        `So the ${ordinal(which)} multiple is ${base} × ${which}.`
      ],
      worked: [`The ${ordinal(which)} multiple of ${base} means ${base} × ${which}.`, `${base} × ${which} = ${answer}`]
    }
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const equivalentFractions: Skill = {
  id: 'equivalent-fractions',
  strandId: 'number',
  title: 'Equivalent fractions',
  blurb: 'Different fractions that are worth the same',
  guide: {
    summary: 'Two fractions are equivalent if they cover the same amount. You get one from the other by multiplying (or dividing) the top and bottom by the SAME number.',
    steps: [
      'Pick a number to multiply by.',
      'Multiply the numerator (top) by it.',
      'Multiply the denominator (bottom) by the SAME number.',
      'To simplify, divide top and bottom by a common factor instead.'
    ],
    example: {
      question: 'Write a fraction equivalent to 2/3.',
      working: ['Multiply top and bottom by 4.', '2 × 4 = 8', '3 × 4 = 12', 'So 2/3 = 8/12'],
      answer: '8/12'
    },
    watchOut: 'Whatever you do to the top you MUST do to the bottom. Multiplying only the top changes the value.'
  },
  generate(level, rng) {
    const den = rng.pick(level === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8])
    const num = rng.int(1, den - 1)
    const mult = rng.int(2, level === 3 ? 6 : 4)
    const answer = `${num * mult}/${den * mult}`
    const distractors = [
      `${num * mult}/${den}`,
      `${num}/${den * mult}`,
      `${num + mult}/${den + mult}`,
      `${num * (mult + 1)}/${den * mult}`
    ]
    return {
      id: `equivalent-fractions-${rng.seed}`,
      skillId: 'equivalent-fractions',
      level,
      prompt: `Which fraction is equivalent to ${num}/${den}?`,
      visual: { kind: 'fractionBar', parts: den, shaded: num, label: `${num}/${den}` },
      answer,
      inputMode: 'choice',
      choices: choicesFrom(answer, distractors, rng),
      hints: [
        'Equivalent fractions cover the same amount of the bar.',
        'Whatever you multiply the top by, multiply the bottom by the same number.',
        `Try multiplying both parts of ${num}/${den} by ${mult}.`
      ],
      worked: [
        `Start with ${num}/${den}.`,
        `Multiply the top and the bottom by ${mult}.`,
        `${num} × ${mult} = ${num * mult}`,
        `${den} × ${mult} = ${den * mult}`,
        `So ${num}/${den} = ${answer}.`
      ]
    }
  }
}

const addFractions: Skill = {
  id: 'add-fractions',
  strandId: 'number',
  title: 'Adding fractions',
  blurb: 'Adding and subtracting fractions',
  guide: {
    summary: 'You can only add fractions when the bottom numbers (denominators) match. If they do, add the tops and keep the bottom the same.',
    steps: [
      'Check whether the denominators are the same.',
      'If not, change one fraction into an equivalent one so they match.',
      'Add (or subtract) the numerators only.',
      'Keep the denominator the same, then simplify if you can.'
    ],
    example: {
      question: '1/2 + 1/4',
      working: ['The bottoms are different.', '1/2 is the same as 2/4.', '2/4 + 1/4 = 3/4'],
      answer: '3/4'
    },
    watchOut: 'Never add the bottom numbers. 1/4 + 1/4 = 2/4, not 2/8.'
  },
  generate(level, rng) {
    const sameDen = level === 1 || (level === 2 && rng.bool())
    if (sameDen) {
      const den = rng.pick([4, 5, 6, 8, 10])
      const a = rng.int(1, den - 2)
      const b = rng.int(1, den - a - 1)
      const raw = `${a + b}/${den}`
      const g = gcd(a + b, den)
      const simplified = g > 1 ? `${(a + b) / g}/${den / g}` : raw
      return {
        id: `add-fractions-${rng.seed}`,
        skillId: 'add-fractions',
        level,
        prompt: `${a}/${den} + ${b}/${den} = ?`,
        visual: { kind: 'fractionBarPair', a: [a, den], b: [b, den] },
        answer: raw,
        inputMode: 'choice',
        choices: choicesFrom(raw, [`${a + b}/${den * 2}`, `${a * b}/${den}`, simplified === raw ? `${a + b + 1}/${den}` : simplified], rng),
        hints: [
          'The bottom numbers are already the same — good.',
          'Just add the top numbers together.',
          `${a} + ${b} = ${a + b}. The bottom stays as ${den}.`
        ],
        worked: [
          `The denominators are both ${den}, so we can add straight away.`,
          `Add the numerators: ${a} + ${b} = ${a + b}.`,
          `Keep the denominator: ${raw}.`
        ]
      }
    }
    // Related denominators: one is a multiple of the other.
    const smallDen = rng.pick([2, 3, 4])
    const factor = rng.int(2, 3)
    const bigDen = smallDen * factor
    const a = 1
    const b = rng.int(1, bigDen - factor - 1)
    const converted = a * factor
    const total = converted + b
    const answer = `${total}/${bigDen}`
    return {
      id: `add-fractions-${rng.seed}`,
      skillId: 'add-fractions',
      level,
      prompt: `${a}/${smallDen} + ${b}/${bigDen} = ?`,
      visual: { kind: 'fractionBarPair', a: [a, smallDen], b: [b, bigDen] },
      answer,
      inputMode: 'choice',
      choices: choicesFrom(answer, [`${a + b}/${bigDen}`, `${a + b}/${smallDen + bigDen}`, `${total}/${smallDen}`], rng),
      hints: [
        'The bottom numbers are different, so they need to match first.',
        `Can you turn ${a}/${smallDen} into something over ${bigDen}?`,
        `Multiply the top and bottom of ${a}/${smallDen} by ${factor}.`
      ],
      worked: [
        `The denominators ${smallDen} and ${bigDen} are different.`,
        `${bigDen} ÷ ${smallDen} = ${factor}, so multiply ${a}/${smallDen} top and bottom by ${factor}.`,
        `${a}/${smallDen} = ${converted}/${bigDen}`,
        `${converted}/${bigDen} + ${b}/${bigDen} = ${answer}`
      ]
    }
  }
}

const fractionOfQuantity: Skill = {
  id: 'fraction-of',
  strandId: 'number',
  title: 'Fraction of an amount',
  blurb: 'Working out things like 3/4 of 20',
  guide: {
    summary: 'To find a fraction of an amount: divide by the bottom number, then multiply by the top number.',
    steps: [
      'Divide the amount by the DENOMINATOR (bottom) — this gives you one part.',
      'Multiply that answer by the NUMERATOR (top) — this gives you the number of parts you want.'
    ],
    example: {
      question: 'What is 3/4 of 20?',
      working: ['Divide by the bottom: 20 ÷ 4 = 5 (that is 1/4).', 'Multiply by the top: 5 × 3 = 15'],
      answer: '15'
    },
    watchOut: 'Divide first, then multiply. Doing it the other way round still works, but the numbers get bigger and messier.'
  },
  generate(level, rng) {
    const den = rng.pick(level === 1 ? [2, 3, 4] : level === 2 ? [3, 4, 5, 6] : [4, 5, 6, 8])
    const num = rng.int(1, den - 1)
    const unit = rng.int(level === 1 ? 2 : 4, level === 3 ? 15 : 10)
    const total = unit * den
    const answer = unit * num
    return {
      id: `fraction-of-${rng.seed}`,
      skillId: 'fraction-of',
      level,
      prompt: `What is ${num}/${den} of ${total}?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        `First find 1/${den} of ${total} by dividing.`,
        `${total} ÷ ${den} = ${unit}`,
        `Now you need ${num} of those parts: ${unit} × ${num}.`
      ],
      worked: [
        `Divide by the bottom number: ${total} ÷ ${den} = ${unit}.`,
        `That is 1/${den} of ${total}.`,
        `Multiply by the top number: ${unit} × ${num} = ${answer}.`
      ]
    }
  }
}

const decimals: Skill = {
  id: 'decimals',
  strandId: 'number',
  title: 'Decimals',
  blurb: 'Comparing, ordering, adding and subtracting decimals',
  guide: {
    summary: 'After the decimal point the places are tenths, then hundredths. 0.7 means 7 tenths; 0.07 means 7 hundredths.',
    steps: [
      'To compare: line the numbers up at the decimal point.',
      'Fill any gaps with zeros so both have the same number of decimal places.',
      'Compare the tenths first, then the hundredths.',
      'To add or subtract: keep the decimal points lined up underneath each other.'
    ],
    example: {
      question: 'Which is bigger, 0.4 or 0.35?',
      working: ['Write 0.4 as 0.40.', 'Compare 0.40 and 0.35.', '4 tenths beats 3 tenths.'],
      answer: '0.4'
    },
    watchOut: 'A longer decimal is NOT automatically bigger. 0.4 is bigger than 0.35, even though 35 looks bigger than 4.'
  },
  generate(level, rng) {
    const compare = level === 1 || (level === 2 && rng.bool())
    if (compare) {
      const values = new Set<number>()
      while (values.size < 4) {
        const v = rng.int(1, 99) / (rng.bool() ? 10 : 100)
        values.add(Number(v.toFixed(2)))
      }
      const list = rng.shuffle([...values])
      const answer = fmt(Math.max(...list))
      return {
        id: `decimals-${rng.seed}`,
        skillId: 'decimals',
        level,
        prompt: `Which of these decimals is the LARGEST?`,
        answer,
        inputMode: 'choice',
        choices: rng.shuffle(list.map(fmt)),
        hints: [
          'Give every number the same number of decimal places by adding a zero on the end where needed.',
          'Compare the tenths digit first (the one straight after the point).',
          'Only if the tenths are equal do you look at the hundredths.'
        ],
        worked: [
          'Write them all with two decimal places:',
          list.map(v => v.toFixed(2)).join(',  '),
          'Now compare the tenths, then the hundredths.',
          `The largest is ${answer}.`
        ]
      }
    }
    const a = rng.int(10, 900) / 10
    const b = rng.int(10, 400) / 10
    const isAdd = rng.bool()
    const answer = fmt(Number((isAdd ? a + b : a - b).toFixed(2)))
    return {
      id: `decimals-${rng.seed}`,
      skillId: 'decimals',
      level,
      prompt: `${fmt(a)} ${isAdd ? '+' : '−'} ${fmt(b)} = ?`,
      answer,
      inputMode: 'number',
      hints: [
        'Line the decimal points up underneath each other.',
        'Deal with the whole numbers first, then the tenths.',
        `Whole parts: ${Math.floor(a)} ${isAdd ? '+' : '−'} ${Math.floor(b)}.`
      ],
      worked: [
        `Line up the decimal points: ${fmt(a)} ${isAdd ? '+' : '−'} ${fmt(b)}`,
        `Tenths: ${Math.round((a * 10) % 10)} ${isAdd ? '+' : '−'} ${Math.round((b * 10) % 10)} tenths.`,
        `Whole numbers: ${Math.floor(a)} ${isAdd ? '+' : '−'} ${Math.floor(b)}.`,
        `Answer: ${answer}`
      ]
    }
  }
}

const percentages: Skill = {
  id: 'percentages',
  strandId: 'number',
  title: 'Percentages',
  blurb: 'Finding 10%, 25%, 50% and more of an amount',
  guide: {
    summary: 'Per cent means "out of 100". 50% is a half, 25% is a quarter, 10% is one tenth.',
    steps: [
      'Learn the easy ones: 50% = ÷2, 25% = ÷4, 10% = ÷10, 20% = ÷10 then ×2.',
      'Build harder ones from easy ones: 30% = 10% × 3.',
      '75% = 50% + 25%.'
    ],
    example: {
      question: 'What is 30% of 60?',
      working: ['10% of 60 = 6.', '30% is three lots of 10%.', '6 × 3 = 18'],
      answer: '18'
    },
    watchOut: 'Finding 10% means dividing by 10, not by 100.'
  },
  generate(level, rng) {
    const pct = rng.pick(level === 1 ? [50, 10, 25] : level === 2 ? [10, 20, 25, 50, 75] : [15, 30, 40, 60, 75, 80])
    const base = rng.int(2, level === 3 ? 30 : 12) * 20
    const answer = (base * pct) / 100
    const tenPct = base / 10
    return {
      id: `percentages-${rng.seed}`,
      skillId: 'percentages',
      level,
      prompt: `What is ${pct}% of ${base}?`,
      answer: fmt(answer),
      inputMode: 'number',
      hints: [
        'Start by finding 10% — just divide by 10.',
        `10% of ${base} = ${fmt(tenPct)}.`,
        pct % 10 === 0
          ? `${pct}% is ${pct / 10} lots of 10%, so multiply ${fmt(tenPct)} by ${pct / 10}.`
          : `${pct}% = ${Math.floor(pct / 10) * 10}% + ${pct % 10}%. Build it up from 10% and 5%.`
      ],
      worked: [
        `10% of ${base} = ${base} ÷ 10 = ${fmt(tenPct)}`,
        pct % 10 === 0
          ? `${pct}% = ${pct / 10} × 10% = ${fmt(tenPct)} × ${pct / 10} = ${fmt(answer)}`
          : `5% of ${base} = ${fmt(tenPct / 2)}, so ${pct}% = ${fmt(answer)}`,
        `Answer: ${fmt(answer)}`
      ]
    }
  }
}

const money: Skill = {
  id: 'money',
  strandId: 'number',
  title: 'Money problems',
  blurb: 'Shopping totals, change and best value',
  guide: {
    summary: 'Money is just decimals with a dollar sign. Two decimal places = cents.',
    steps: [
      'Work out what the question is really asking: a total, or change?',
      'For a total, multiply then add.',
      'For change, subtract the total from what was handed over.',
      'Write the answer with two decimal places.'
    ],
    example: {
      question: '3 drinks at $2.50 each. How much change from $10?',
      working: ['3 × $2.50 = $7.50', '$10.00 − $7.50 = $2.50'],
      answer: '$2.50'
    },
    watchOut: '$4.5 should be written $4.50 — money always uses two decimal places.'
  },
  generate(level, rng) {
    const price = rng.int(level === 1 ? 5 : 15, level === 3 ? 800 : 250) / 100 + rng.int(1, 4)
    const priceR = Number(price.toFixed(2))
    const qty = rng.int(2, level === 1 ? 4 : 7)
    const total = Number((priceR * qty).toFixed(2))
    // Always hand over strictly more than the total, so change is never $0.
    const paid = (Math.floor(total / 10) + 1) * 10
    const askChange = level > 1 && rng.bool()
    const answer = askChange ? Number((paid - total).toFixed(2)) : total
    return {
      id: `money-${rng.seed}`,
      skillId: 'money',
      level,
      prompt: askChange
        ? `A drink costs $${priceR.toFixed(2)}. Ruby buys ${qty} of them and pays with $${paid}. How much change does she get?`
        : `A drink costs $${priceR.toFixed(2)}. How much do ${qty} drinks cost altogether?`,
      answer: answer.toFixed(2),
      unit: '$',
      inputMode: 'number',
      hints: [
        `First find the total cost: $${priceR.toFixed(2)} × ${qty}.`,
        `Split it up: $${Math.floor(priceR)} × ${qty}, then the cents × ${qty}.`,
        askChange ? `Then take the total away from $${paid}.` : 'Add the dollars and the cents back together.'
      ],
      worked: [
        `$${priceR.toFixed(2)} × ${qty} = $${total.toFixed(2)}`,
        ...(askChange ? [`$${paid}.00 − $${total.toFixed(2)} = $${answer.toFixed(2)}`] : []),
        `Answer: $${answer.toFixed(2)}`
      ]
    }
  }
}

export const numberSkills: Skill[] = [
  placeValue,
  rounding,
  mentalAddSub,
  multiDigitMult,
  divisionRemainders,
  factorsMultiples,
  equivalentFractions,
  addFractions,
  fractionOfQuantity,
  decimals,
  percentages,
  money
]
