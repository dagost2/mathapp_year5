import { Skill, choicesFrom, fmt } from '../types'

const CATEGORY_SETS = [
  { title: 'Favourite sport', labels: ['Netball', 'Soccer', 'Cricket', 'Tennis'] },
  { title: 'Books read this term', labels: ['Mia', 'Zara', 'Ruby', 'Ava'] },
  { title: 'Pets owned', labels: ['Dogs', 'Cats', 'Birds', 'Fish'] },
  { title: 'Fruit sold', labels: ['Apples', 'Bananas', 'Pears', 'Plums'] }
]

const readingData: Skill = {
  id: 'reading-data',
  strandId: 'stats',
  title: 'Reading graphs',
  blurb: 'Getting information out of a column graph',
  guide: {
    summary: 'A column graph shows amounts as bars. The taller the bar, the bigger the number. Always read the scale first.',
    steps: [
      'Read the title so you know what the graph is about.',
      'Check the scale on the side — does it go up in 1s, 2s, 5s or 10s?',
      'Find the bar you need and trace across to the scale.',
      'For "how many more", find both values and subtract.'
    ],
    example: {
      question: 'How many more people chose soccer (12) than tennis (5)?',
      working: ['Soccer = 12', 'Tennis = 5', '12 − 5 = 7'],
      answer: '7'
    },
    watchOut: 'The scale may not go up in 1s. If each gridline is 5, a bar reaching the 3rd line means 15, not 3.'
  },
  generate(level, rng) {
    const set = rng.pick(CATEGORY_SETS)
    const scale = level === 1 ? 1 : rng.pick([2, 5])
    const data = set.labels.map(label => ({ label, value: rng.int(1, 10) * scale }))
    // A tied top bar would make "which has the MOST?" have two right answers,
    // only one of which is accepted. Push one leader clear of the pack, keeping
    // it a whole number of scale units so it still lands on a gridline.
    const highest = Math.max(...data.map(d => d.value))
    const leaders = data.filter(d => d.value === highest)
    if (leaders.length > 1) rng.pick(leaders).value += scale
    const sorted = [...data].sort((a, b) => b.value - a.value)
    const mode = rng.pick(level === 1 ? (['most'] as const) : (['most', 'difference', 'total'] as const))

    if (mode === 'most') {
      return {
        id: `reading-data-${rng.seed}`,
        skillId: 'reading-data',
        level,
        prompt: `Look at the graph. Which category has the MOST?`,
        visual: { kind: 'barChart', title: set.title, data },
        answer: sorted[0].label,
        inputMode: 'choice',
        choices: rng.shuffle(set.labels),
        hints: ['The tallest bar is the biggest amount.', 'Find the bar that reaches highest.', `Check the values against the scale on the left.`],
        worked: [
          `Read each bar against the scale:`,
          data.map(d => `${d.label}: ${d.value}`).join(',  '),
          `The largest is ${sorted[0].label} with ${sorted[0].value}.`
        ]
      }
    }

    if (mode === 'total') {
      const total = data.reduce((s, d) => s + d.value, 0)
      return {
        id: `reading-data-${rng.seed}`,
        skillId: 'reading-data',
        level,
        prompt: `Look at the graph. What is the TOTAL of all four columns?`,
        visual: { kind: 'barChart', title: set.title, data },
        answer: String(total),
        inputMode: 'number',
        hints: [
          'Read the value of each bar first and write them down.',
          `Check the scale — each gridline is worth ${scale}.`,
          'Then add all four numbers together.'
        ],
        worked: [
          `Read each bar: ${data.map(d => `${d.label} = ${d.value}`).join(',  ')}`,
          `${data.map(d => d.value).join(' + ')} = ${total}`,
          `The total is ${total}.`
        ]
      }
    }

    const [hi, lo] = [sorted[0], sorted[sorted.length - 1]]
    const answer = hi.value - lo.value
    return {
      id: `reading-data-${rng.seed}`,
      skillId: 'reading-data',
      level,
      prompt: `Look at the graph. How many more ${hi.label} than ${lo.label}?`,
      visual: { kind: 'barChart', title: set.title, data },
      answer: String(answer),
      inputMode: 'number',
      hints: [
        'Find both bars and read their values against the scale.',
        `${hi.label} = ${hi.value} and ${lo.label} = ${lo.value}.`,
        '"How many more" means subtract the smaller from the bigger.'
      ],
      worked: [
        `${hi.label} = ${hi.value}`,
        `${lo.label} = ${lo.value}`,
        `${hi.value} − ${lo.value} = ${answer}`
      ]
    }
  }
}

const average: Skill = {
  id: 'average',
  strandId: 'stats',
  title: 'Average (mean)',
  blurb: 'Finding the middle value of a set of numbers',
  guide: {
    summary: 'The mean (average) is what everyone would get if the total were shared out equally. Add them all up, then divide by how many there are.',
    steps: [
      'Add all the numbers together to get the total.',
      'Count how many numbers there are.',
      'Divide the total by that count.'
    ],
    example: {
      question: 'Find the mean of 4, 8, 6, 2.',
      working: ['4 + 8 + 6 + 2 = 20', 'There are 4 numbers.', '20 ÷ 4 = 5'],
      answer: '5'
    },
    watchOut: 'Divide by HOW MANY numbers there are, not by the biggest number.'
  },
  generate(level, rng) {
    const count = level === 1 ? 3 : level === 2 ? 4 : 5
    const mean = rng.int(3, level === 3 ? 20 : 12)
    // Build values that sum exactly to mean × count so the answer stays whole.
    const values: number[] = []
    let remaining = mean * count
    for (let i = 0; i < count - 1; i++) {
      const maxTake = Math.min(remaining - (count - 1 - i), mean * 2)
      const v = rng.int(1, Math.max(1, maxTake))
      values.push(v)
      remaining -= v
    }
    values.push(remaining)
    const shuffled = rng.shuffle(values)
    const total = shuffled.reduce((s, v) => s + v, 0)
    const answer = total / count
    return {
      id: `average-${rng.seed}`,
      skillId: 'average',
      level,
      prompt: `Find the mean (average) of these numbers:\n\n${shuffled.join(',  ')}`,
      answer: fmt(answer),
      inputMode: 'number',
      hints: [
        'First add all the numbers together.',
        `${shuffled.join(' + ')} = ${total}`,
        `Now divide by how many numbers there are (${count}).`
      ],
      worked: [
        `Add them all: ${shuffled.join(' + ')} = ${total}`,
        `There are ${count} numbers.`,
        `${total} ÷ ${count} = ${fmt(answer)}`
      ]
    }
  }
}

const chance: Skill = {
  id: 'chance',
  strandId: 'stats',
  title: 'Chance',
  blurb: 'How likely something is to happen',
  guide: {
    summary:
      'Chance describes how likely an event is: impossible, unlikely, even chance, likely, or certain. It can be written as a fraction.',
    steps: [
      'Count how many outcomes give you what you want.',
      'Count how many outcomes there are in total.',
      'Write it as a fraction: wanted ÷ total.',
      'Half means even chance. 0 means impossible. 1 means certain.'
    ],
    example: {
      question: 'A bag has 3 red and 5 blue marbles. What is the chance of picking red?',
      working: ['Red marbles: 3.', 'Total marbles: 3 + 5 = 8.', 'Chance = 3/8.'],
      answer: '3/8'
    },
    watchOut: 'The bottom of the fraction is the TOTAL number of things, not the number of the other colour.'
  },
  generate(level, rng) {
    const red = rng.int(1, level === 1 ? 4 : 8)
    const blue = rng.int(1, level === 1 ? 4 : 8)
    const total = red + blue
    const askWord = level === 1
    if (askWord) {
      const answer = red === blue ? 'Even chance' : red > blue ? 'Likely' : 'Unlikely'
      return {
        id: `chance-${rng.seed}`,
        skillId: 'chance',
        level,
        prompt: `A bag holds ${red} red marbles and ${blue} blue marbles. How likely is it that you pick a RED marble?`,
        visual: {
          kind: 'spinner',
          segments: [
            ...Array.from({ length: red }, () => ({ label: 'R', color: '#DC2626' })),
            ...Array.from({ length: blue }, () => ({ label: 'B', color: '#2563EB' }))
          ]
        },
        answer,
        inputMode: 'choice',
        choices: rng.shuffle(['Likely', 'Unlikely', 'Even chance', 'Certain']),
        hints: [
          'Compare how many red marbles there are with how many blue.',
          `There are ${red} red and ${blue} blue.`,
          red === blue ? 'They are the same, so it could go either way.' : `There are ${red > blue ? 'more' : 'fewer'} red than blue.`
        ],
        worked: [
          `Red: ${red}, Blue: ${blue}, Total: ${total}`,
          red === blue
            ? 'Equal numbers means an even chance.'
            : red > blue
              ? 'More red than blue, so picking red is likely.'
              : 'Fewer red than blue, so picking red is unlikely.',
          `Answer: ${answer}`
        ]
      }
    }
    const answer = `${red}/${total}`
    return {
      id: `chance-${rng.seed}`,
      skillId: 'chance',
      level,
      prompt: `A bag holds ${red} red marbles and ${blue} blue marbles. What is the chance of picking a RED marble?`,
      visual: {
        kind: 'spinner',
        segments: [
          ...Array.from({ length: red }, () => ({ label: 'R', color: '#DC2626' })),
          ...Array.from({ length: blue }, () => ({ label: 'B', color: '#2563EB' }))
        ]
      },
      answer,
      inputMode: 'choice',
      choices: choicesFrom(answer, [`${red}/${blue}`, `${blue}/${total}`, `${total}/${red}`], rng),
      hints: [
        'The top of the fraction is how many you WANT.',
        'The bottom is the TOTAL number of marbles.',
        `There are ${red} red out of ${total} altogether.`
      ],
      worked: [
        `Red marbles (what we want): ${red}`,
        `Total marbles: ${red} + ${blue} = ${total}`,
        `Chance = ${red}/${total}`
      ]
    }
  }
}

export const statsSkills: Skill[] = [readingData, average, chance]
