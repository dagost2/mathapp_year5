import { Skill, choicesFrom, grouped } from '../types'

const patterns: Skill = {
  id: 'patterns',
  strandId: 'algebra',
  title: 'Number patterns',
  blurb: 'Finding the rule and continuing a sequence',
  guide: {
    summary: 'A pattern follows a rule. Your job is to find the rule by looking at the GAP between the numbers.',
    steps: [
      'Work out the difference between the first two numbers.',
      'Check that same difference works for the next pair — if it does, the rule is add (or subtract) that amount.',
      'If the numbers grow quickly, try dividing instead — the rule might be multiply.',
      'Apply the rule to get the next number.'
    ],
    example: {
      question: 'What comes next?  4, 11, 18, 25, ___',
      working: ['11 − 4 = 7', '18 − 11 = 7 — the rule is add 7.', '25 + 7 = 32'],
      answer: '32'
    },
    watchOut: 'Always check the gap on at least two pairs before deciding the rule.'
  },
  generate(level, rng) {
    const multiplying = level === 3 && rng.bool()
    if (multiplying) {
      const start = rng.int(1, 4)
      const ratio = rng.int(2, 3)
      const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3]
      const answer = start * ratio ** 4
      return {
        id: `patterns-${rng.seed}`,
        skillId: 'patterns',
        level,
        prompt: `What is the next number in this pattern?\n\n${seq.join(',  ')},  ___`,
        answer: String(answer),
        inputMode: 'number',
        hints: [
          'The numbers are growing quickly — try dividing rather than subtracting.',
          `${seq[1]} ÷ ${seq[0]} = ${ratio}. Does that work for the next pair too?`,
          `The rule is multiply by ${ratio}.`
        ],
        worked: [
          `${seq[1]} ÷ ${seq[0]} = ${ratio}`,
          `${seq[2]} ÷ ${seq[1]} = ${ratio}, so the rule is × ${ratio}.`,
          `${seq[3]} × ${ratio} = ${answer}`
        ]
      }
    }
    const decreasing = level > 1 && rng.bool()
    const step = rng.int(level === 1 ? 2 : 3, level === 3 ? 25 : 12)
    const start = decreasing ? rng.int(step * 5, step * 12) : rng.int(1, 30)
    const seq = [0, 1, 2, 3].map(i => (decreasing ? start - step * i : start + step * i))
    const answer = decreasing ? start - step * 4 : start + step * 4
    return {
      id: `patterns-${rng.seed}`,
      skillId: 'patterns',
      level,
      prompt: `What is the next number in this pattern?\n\n${seq.map(grouped).join(',  ')},  ___`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        'Look at the gap between the first two numbers.',
        `${grouped(seq[1])} ${decreasing ? 'is' : 'is'} ${decreasing ? 'smaller' : 'bigger'} than ${grouped(seq[0])} — by how much?`,
        `The rule is ${decreasing ? 'subtract' : 'add'} ${step}.`
      ],
      worked: [
        `${grouped(seq[1])} ${decreasing ? '−' : '−'} ${grouped(seq[0])} gives a gap of ${step}.`,
        `Check the next pair: the gap is ${step} again.`,
        `So the rule is ${decreasing ? 'subtract' : 'add'} ${step}.`,
        `${grouped(seq[3])} ${decreasing ? '−' : '+'} ${step} = ${grouped(answer)}`
      ]
    }
  }
}

const missingNumber: Skill = {
  id: 'missing-number',
  strandId: 'algebra',
  title: 'Missing numbers',
  blurb: 'Solving number sentences with a gap in them',
  guide: {
    summary: 'To find a missing number, do the OPPOSITE operation. Addition and subtraction undo each other; so do multiplication and division.',
    steps: [
      'Look at what is being done to the missing number.',
      'Do the opposite to the other side.',
      'Check your answer by putting it back into the original sentence.'
    ],
    example: {
      question: '? + 27 = 61',
      working: ['27 is being added, so subtract it.', '61 − 27 = 34', 'Check: 34 + 27 = 61 ✓'],
      answer: '34'
    },
    watchOut: 'Always check by substituting your answer back in. It takes five seconds and catches most mistakes.'
  },
  generate(level, rng) {
    const op = rng.pick(level === 1 ? ['+', '−'] : level === 2 ? ['+', '−', '×'] : ['+', '−', '×', '÷'])
    const missingFirst = rng.bool()
    let a: number, b: number, result: number, answer: number, sentence: string, inverse: string

    switch (op) {
      case '×': {
        a = rng.int(3, 12)
        b = rng.int(3, level === 3 ? 20 : 12)
        result = a * b
        answer = missingFirst ? a : b
        sentence = missingFirst ? `? × ${b} = ${result}` : `${a} × ? = ${result}`
        inverse = `${result} ÷ ${missingFirst ? b : a} = ${answer}`
        break
      }
      case '÷': {
        b = rng.int(2, 12)
        answer = rng.int(3, 15)
        result = answer
        a = b * answer
        sentence = missingFirst ? `? ÷ ${b} = ${answer}` : `${a} ÷ ? = ${answer}`
        answer = missingFirst ? a : b
        inverse = missingFirst ? `${result} × ${b} = ${answer}` : `${a} ÷ ${result} = ${answer}`
        break
      }
      case '−': {
        answer = rng.int(20, level === 3 ? 400 : 90)
        // Cap the subtrahend so the result never goes negative — Year 5 has not
        // met negative numbers in this context.
        b = rng.int(10, Math.max(10, Math.min(60, answer - 5)))
        result = answer - b
        sentence = `? − ${b} = ${result}`
        inverse = `${result} + ${b} = ${answer}`
        break
      }
      default: {
        a = rng.int(15, level === 3 ? 400 : 80)
        b = rng.int(15, level === 3 ? 400 : 80)
        result = a + b
        answer = missingFirst ? a : b
        sentence = missingFirst ? `? + ${b} = ${result}` : `${a} + ? = ${result}`
        inverse = `${result} − ${missingFirst ? b : a} = ${answer}`
      }
    }

    const oppositeName =
      op === '+' ? 'subtract' : op === '−' ? 'add' : op === '×' ? 'divide' : 'multiply or divide'

    return {
      id: `missing-number-${rng.seed}`,
      skillId: 'missing-number',
      level,
      prompt: `What number goes in the gap?\n\n${sentence}`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        `The sentence uses ${op}. What is the opposite operation?`,
        `To undo ${op}, you ${oppositeName}.`,
        `Try: ${inverse.split('=')[0].trim()}`
      ],
      worked: [
        `The sentence is ${sentence}.`,
        `To find the missing number, do the opposite: ${inverse}`,
        `So the missing number is ${answer}.`,
        `Check: put ${answer} back in — ${sentence.replace('?', String(answer))} ✓`
      ]
    }
  }
}

const wordProblems: Skill = {
  id: 'word-problems',
  strandId: 'algebra',
  title: 'Multi-step problems',
  blurb: 'Word problems that take two or three steps',
  guide: {
    summary: 'Long problems are just several small problems in a row. Break them into steps and write down each answer as you go.',
    steps: [
      'Read it twice. What is the question actually asking for?',
      'Underline the numbers and what they mean.',
      'Decide the FIRST thing you can work out, and do only that.',
      'Use that answer for the next step.',
      'Check your answer makes sense in real life.'
    ],
    example: {
      question: 'A packet has 6 rows of 8 stickers. Mia uses 15. How many are left?',
      working: ['Step 1: how many to start? 6 × 8 = 48.', 'Step 2: take away the ones used. 48 − 15 = 33.'],
      answer: '33'
    },
    watchOut: 'Do not try to do it all in one go. One step at a time, writing each answer down.'
  },
  generate(level, rng) {
    const rows = rng.int(3, level === 1 ? 6 : 12)
    const per = rng.int(4, level === 1 ? 8 : 12)
    const start = rows * per
    const used = rng.int(5, Math.max(6, Math.floor(start / 2)))
    const name = rng.pick(['Mia', 'Zara', 'Ruby', 'Ava', 'Ollie'])
    const item = rng.pick(['stickers', 'marbles', 'cards', 'beads'])
    const answer = start - used
    return {
      id: `word-problems-${rng.seed}`,
      skillId: 'word-problems',
      level,
      prompt: `${name} has ${rows} packets of ${item} with ${per} in each packet. She gives away ${used} ${item}. How many ${item} does she have left?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        'This takes two steps. What can you work out first?',
        `Step 1: how many ${item} does she start with? ${rows} packets of ${per}.`,
        `Step 2: take the ${used} she gave away off your Step 1 answer.`
      ],
      worked: [
        `Step 1: ${rows} × ${per} = ${start} ${item} to start with.`,
        `Step 2: ${start} − ${used} = ${answer}`,
        `She has ${answer} ${item} left.`
      ]
    }
  }
}

const equivalence: Skill = {
  id: 'equivalence',
  strandId: 'algebra',
  title: 'Balancing sentences',
  blurb: 'Making both sides of the = sign equal',
  guide: {
    summary: 'The equals sign means "the same as", not "the answer is". Both sides must balance like a see-saw.',
    steps: [
      'Work out the side you CAN calculate completely.',
      'That total is what the other side must also equal.',
      'Work backwards to find the missing number.'
    ],
    example: {
      question: '5 × 4 = 10 + ?',
      working: ['Left side: 5 × 4 = 20.', 'So the right side must be 20 too.', '10 + ? = 20, so ? = 10.'],
      answer: '10'
    },
    watchOut: 'The answer does not always go straight after the = sign. Sometimes there is more to do on that side.'
  },
  generate(level, rng) {
    const a = rng.int(3, 12)
    const b = rng.int(3, 12)
    const total = a * b
    const known = rng.int(2, Math.max(3, total - 2))
    const answer = total - known
    return {
      id: `equivalence-${rng.seed}`,
      skillId: 'equivalence',
      level,
      prompt: `What number goes in the gap to balance both sides?\n\n${a} × ${b} = ${known} + ?`,
      answer: String(answer),
      inputMode: 'number',
      hints: [
        'Work out the side you can do completely first.',
        `${a} × ${b} = ${total}.`,
        `So the other side must also make ${total}. What plus ${known} gives ${total}?`
      ],
      worked: [
        `Left side: ${a} × ${b} = ${total}`,
        `Both sides must be equal, so the right side is also ${total}.`,
        `${known} + ? = ${total}`,
        `${total} − ${known} = ${answer}`
      ]
    }
  }
}

const roundingCheck: Skill = {
  id: 'estimating',
  strandId: 'algebra',
  title: 'Estimating',
  blurb: 'Getting a quick sensible answer to check your work',
  guide: {
    summary: 'Estimating means rounding the numbers to something easy, then calculating. It tells you roughly what the real answer should be.',
    steps: [
      'Round each number to the nearest 10, 100 or 1000 — whatever makes it easy.',
      'Do the calculation with the easy numbers.',
      'Compare with your real answer: if they are miles apart, you made a mistake.'
    ],
    example: {
      question: 'Estimate 412 + 289.',
      working: ['412 rounds to 400.', '289 rounds to 300.', '400 + 300 = 700'],
      answer: 'about 700'
    },
    watchOut: 'An estimate is meant to be quick. Do not do the exact sum and then round it.'
  },
  generate(level, rng) {
    const a = rng.int(level === 1 ? 25 : 210, level === 1 ? 95 : 890)
    const b = rng.int(level === 1 ? 25 : 210, level === 1 ? 95 : 890)
    const place = level === 1 ? 10 : 100
    const ra = Math.round(a / place) * place
    const rb = Math.round(b / place) * place
    const answer = ra + rb
    return {
      id: `estimating-${rng.seed}`,
      skillId: 'estimating',
      level,
      prompt: `Estimate ${a} + ${b} by rounding each number to the nearest ${place === 10 ? 'ten' : 'hundred'}.`,
      answer: String(answer),
      inputMode: 'choice',
      choices: choicesFrom(answer, [answer + place, answer - place, answer + place * 2], rng),
      hints: [
        `Round ${a} to the nearest ${place === 10 ? 'ten' : 'hundred'} first.`,
        `${a} rounds to ${ra}, and ${b} rounds to ${rb}.`,
        `Now add the two easy numbers together.`
      ],
      worked: [`${a} rounds to ${ra}.`, `${b} rounds to ${rb}.`, `${ra} + ${rb} = ${answer}`]
    }
  }
}

export const algebraSkills: Skill[] = [patterns, missingNumber, wordProblems, equivalence, roundingCheck]
