import { Skill, choicesFrom, fmt } from '../types'

const perimeter: Skill = {
  id: 'perimeter',
  strandId: 'measurement',
  title: 'Perimeter',
  blurb: 'The distance all the way around a shape',
  guide: {
    summary: 'Perimeter is the total distance around the OUTSIDE of a shape. Imagine walking around the edge — how far did you walk?',
    steps: [
      'Write down the length of every side.',
      'Add them all together.',
      'For a rectangle there is a shortcut: (length + width) × 2.',
      'Answer in the same units as the sides (cm, m…).'
    ],
    example: {
      question: 'A rectangle is 7 cm long and 3 cm wide. What is its perimeter?',
      working: ['The four sides are 7, 3, 7 and 3.', '7 + 3 = 10', '10 × 2 = 20 cm'],
      answer: '20 cm'
    },
    watchOut: 'A rectangle has FOUR sides. It is easy to add only the two you can see labelled.'
  },
  generate(level, rng) {
    const w = rng.int(2, level === 1 ? 9 : 20)
    const h = rng.int(2, level === 1 ? 9 : 20)
    const answer = (w + h) * 2
    return {
      id: `perimeter-${rng.seed}`,
      skillId: 'perimeter',
      level,
      prompt: `This rectangle is ${w} cm wide and ${h} cm tall. What is its perimeter?`,
      visual: { kind: 'grid', rows: h, cols: w, unit: 'cm' },
      answer: String(answer),
      unit: 'cm',
      inputMode: 'number',
      hints: [
        'Perimeter means the distance all the way around the outside.',
        `The four sides are ${w}, ${h}, ${w} and ${h}.`,
        `Shortcut: (${w} + ${h}) × 2.`
      ],
      worked: [
        `A rectangle has four sides: ${w}, ${h}, ${w}, ${h}.`,
        `${w} + ${h} = ${w + h}`,
        `${w + h} × 2 = ${answer}`,
        `The perimeter is ${answer} cm.`
      ]
    }
  }
}

const area: Skill = {
  id: 'area',
  strandId: 'measurement',
  title: 'Area',
  blurb: 'How much surface a shape covers',
  guide: {
    summary: 'Area is the amount of space INSIDE a shape, measured in squares. For a rectangle: length × width.',
    steps: [
      'Find the length and the width.',
      'Multiply them together.',
      'The units are square units: cm², m².'
    ],
    example: {
      question: 'A rectangle is 6 cm by 4 cm. What is its area?',
      working: ['6 × 4 = 24', 'Units are square centimetres.'],
      answer: '24 cm²'
    },
    watchOut: 'Perimeter is ADD (around the edge). Area is MULTIPLY (inside). Do not mix them up.'
  },
  generate(level, rng) {
    const w = rng.int(2, level === 1 ? 8 : level === 2 ? 12 : 20)
    const h = rng.int(2, level === 1 ? 8 : level === 2 ? 12 : 20)
    const answer = w * h
    return {
      id: `area-${rng.seed}`,
      skillId: 'area',
      level,
      prompt: `What is the area of this rectangle? It is ${w} cm wide and ${h} cm tall.`,
      visual: { kind: 'grid', rows: h, cols: w, unit: 'cm' },
      answer: String(answer),
      unit: 'cm²',
      inputMode: 'number',
      hints: [
        'Area is the number of squares that fit inside.',
        'You can count them, but multiplying is faster.',
        `Multiply the width by the height: ${w} × ${h}.`
      ],
      worked: [
        `Area of a rectangle = width × height.`,
        `${w} × ${h} = ${answer}`,
        `The area is ${answer} cm².`
      ]
    }
  }
}

const volume: Skill = {
  id: 'volume',
  strandId: 'measurement',
  title: 'Volume',
  blurb: 'How many cubes fit inside a box',
  guide: {
    summary: 'Volume is the space inside a 3D object, measured in cubes. For a rectangular box: length × width × height.',
    steps: [
      'Find how many cubes fit along the bottom layer (length × width).',
      'Count how many layers high it is.',
      'Multiply the layer by the number of layers.'
    ],
    example: {
      question: 'A box is 4 cubes long, 3 wide and 2 high.',
      working: ['Bottom layer: 4 × 3 = 12 cubes.', 'There are 2 layers.', '12 × 2 = 24 cubes'],
      answer: '24 cm³'
    },
    watchOut: 'Volume uses THREE measurements multiplied together, area only uses two.'
  },
  generate(level, rng) {
    const l = rng.int(2, level === 1 ? 5 : 9)
    const w = rng.int(2, level === 1 ? 4 : 8)
    const h = rng.int(2, level === 1 ? 3 : 6)
    const answer = l * w * h
    return {
      id: `volume-${rng.seed}`,
      skillId: 'volume',
      level,
      prompt: `A box is ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume?`,
      visual: { kind: 'grid', rows: w, cols: l, unit: 'cm' },
      answer: String(answer),
      unit: 'cm³',
      inputMode: 'number',
      hints: [
        'Start with just the bottom layer of cubes.',
        `Bottom layer: ${l} × ${w} = ${l * w} cubes.`,
        `Now multiply by the number of layers (${h}).`
      ],
      worked: [
        `Bottom layer: ${l} × ${w} = ${l * w} cubes.`,
        `There are ${h} layers.`,
        `${l * w} × ${h} = ${answer}`,
        `The volume is ${answer} cm³.`
      ]
    }
  }
}

const UNITS = [
  { from: 'mm', to: 'cm', factor: 10, kind: 'length' },
  { from: 'cm', to: 'm', factor: 100, kind: 'length' },
  { from: 'm', to: 'km', factor: 1000, kind: 'length' },
  { from: 'g', to: 'kg', factor: 1000, kind: 'mass' },
  { from: 'mL', to: 'L', factor: 1000, kind: 'capacity' }
]

const unitConversion: Skill = {
  id: 'unit-conversion',
  strandId: 'measurement',
  title: 'Converting units',
  blurb: 'Swapping between mm, cm, m, km, g, kg, mL and L',
  guide: {
    summary: 'Going from a SMALL unit to a BIG unit, divide. Going from BIG to SMALL, multiply.',
    steps: [
      'Remember the key facts: 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km, 1000 g = 1 kg, 1000 mL = 1 L.',
      'Decide which direction you are going.',
      'Small → big: divide. Big → small: multiply.',
      'Sanity check: more small units than big units, always.'
    ],
    example: {
      question: 'How many centimetres in 3.5 metres?',
      working: ['Metres are bigger than centimetres, so multiply.', '100 cm = 1 m', '3.5 × 100 = 350 cm'],
      answer: '350 cm'
    },
    watchOut: 'If your answer got smaller when converting to a smaller unit, you divided when you should have multiplied.'
  },
  generate(level, rng) {
    const u = rng.pick(UNITS)
    const toSmall = rng.bool()
    if (toSmall) {
      const bigVal = level === 1 ? rng.int(2, 9) : rng.int(2, 40) / (level === 3 ? 10 : 1)
      const answer = bigVal * u.factor
      return {
        id: `unit-conversion-${rng.seed}`,
        skillId: 'unit-conversion',
        level,
        prompt: `Convert ${fmt(bigVal)} ${u.to} into ${u.from}.`,
        answer: fmt(answer),
        unit: u.from,
        inputMode: 'number',
        hints: [
          `Remember: 1 ${u.to} = ${u.factor} ${u.from}.`,
          `You are going from a bigger unit to a smaller unit, so multiply.`,
          `${fmt(bigVal)} × ${u.factor}`
        ],
        worked: [
          `1 ${u.to} = ${u.factor} ${u.from}`,
          `Bigger unit to smaller unit means multiply.`,
          `${fmt(bigVal)} × ${u.factor} = ${fmt(answer)}`,
          `Answer: ${fmt(answer)} ${u.from}`
        ]
      }
    }
    const smallVal = u.factor * rng.int(1, 9) + (level === 1 ? 0 : u.factor / 2)
    const answer = smallVal / u.factor
    return {
      id: `unit-conversion-${rng.seed}`,
      skillId: 'unit-conversion',
      level,
      prompt: `Convert ${fmt(smallVal)} ${u.from} into ${u.to}.`,
      answer: fmt(answer),
      unit: u.to,
      inputMode: 'number',
      hints: [
        `Remember: ${u.factor} ${u.from} = 1 ${u.to}.`,
        `You are going from a smaller unit to a bigger unit, so divide.`,
        `${fmt(smallVal)} ÷ ${u.factor}`
      ],
      worked: [
        `${u.factor} ${u.from} = 1 ${u.to}`,
        `Smaller unit to bigger unit means divide.`,
        `${fmt(smallVal)} ÷ ${u.factor} = ${fmt(answer)}`,
        `Answer: ${fmt(answer)} ${u.to}`
      ]
    }
  }
}

function timeStr(totalMins: number): string {
  const h24 = Math.floor(totalMins / 60) % 24
  const m = totalMins % 60
  const suffix = h24 < 12 ? 'am' : 'pm'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

const time: Skill = {
  id: 'time',
  strandId: 'measurement',
  title: 'Time & duration',
  blurb: 'Reading clocks and working out how long things take',
  guide: {
    summary: 'To find how long something lasted, count on from the start time to the finish time — in easy jumps.',
    steps: [
      'Jump from the start time up to the next whole hour.',
      'Jump in whole hours as far as you can.',
      'Jump the last few minutes to the finish time.',
      'Add up all your jumps.'
    ],
    example: {
      question: 'A film starts at 2:40 pm and ends at 4:15 pm. How long is it?',
      working: ['2:40 → 3:00 is 20 minutes.', '3:00 → 4:00 is 1 hour.', '4:00 → 4:15 is 15 minutes.', '20 + 60 + 15 = 95 minutes = 1 hour 35 minutes.'],
      answer: '1 h 35 min'
    },
    watchOut: 'There are 60 minutes in an hour, not 100. 1.5 hours is 90 minutes.'
  },
  generate(level, rng) {
    const startMins = rng.int(8, 18) * 60 + rng.int(0, 11) * 5
    const durationMins = level === 1 ? rng.int(3, 12) * 5 : rng.int(5, level === 3 ? 40 : 24) * 5
    const endMins = startMins + durationMins
    const askEnd = rng.bool()
    if (askEnd) {
      return {
        id: `time-${rng.seed}`,
        skillId: 'time',
        level,
        prompt: `A lesson starts at ${timeStr(startMins)} and lasts ${durationMins} minutes. What time does it finish?`,
        visual: { kind: 'clock', hour: Math.floor(startMins / 60) % 12, minute: startMins % 60 },
        answer: timeStr(endMins),
        inputMode: 'choice',
        choices: choicesFrom(timeStr(endMins), [timeStr(endMins + 60), timeStr(endMins - 60), timeStr(endMins + 5)], rng),
        hints: [
          'Jump forward in easy chunks rather than all at once.',
          `First jump from ${timeStr(startMins)} to the next whole hour.`,
          'Then add whole hours, then the last few minutes.'
        ],
        worked: [
          `Start: ${timeStr(startMins)}, adding ${durationMins} minutes.`,
          `${durationMins} minutes is ${Math.floor(durationMins / 60)} hour(s) and ${durationMins % 60} minutes.`,
          `Add the hours first, then the minutes.`,
          `Finish time: ${timeStr(endMins)}`
        ]
      }
    }
    return {
      id: `time-${rng.seed}`,
      skillId: 'time',
      level,
      prompt: `A lesson starts at ${timeStr(startMins)} and finishes at ${timeStr(endMins)}. How many minutes long is it?`,
      answer: String(durationMins),
      unit: 'min',
      inputMode: 'number',
      hints: [
        'Count on from the start time in easy jumps.',
        `From ${timeStr(startMins)} to the next whole hour is ${60 - (startMins % 60) === 60 ? 0 : 60 - (startMins % 60)} minutes.`,
        'Then count whole hours (60 minutes each), then the last few minutes.'
      ],
      worked: [
        `From ${timeStr(startMins)} to ${timeStr(endMins)}.`,
        `Count on in jumps: to the next hour, then whole hours, then the remaining minutes.`,
        `Total: ${durationMins} minutes (${Math.floor(durationMins / 60)} h ${durationMins % 60} min).`
      ]
    }
  }
}

const angles: Skill = {
  id: 'angles',
  strandId: 'measurement',
  title: 'Angles',
  blurb: 'Naming angles and finding missing ones',
  guide: {
    summary: 'Angles are measured in degrees. A right angle is 90°, a straight line is 180°, and a full turn is 360°.',
    steps: [
      'Acute: less than 90° (small and sharp).',
      'Right: exactly 90° (square corner).',
      'Obtuse: between 90° and 180° (wide).',
      'Reflex: more than 180°.',
      'Angles on a straight line add to 180°.'
    ],
    example: {
      question: 'Two angles sit on a straight line. One is 115°. What is the other?',
      working: ['Angles on a straight line add to 180°.', '180 − 115 = 65°'],
      answer: '65°'
    },
    watchOut: 'Compare against a right angle (the corner of a page) to decide if an angle is acute or obtuse.'
  },
  generate(level, rng) {
    const nameIt = level === 1 || (level === 2 && rng.bool())
    if (nameIt) {
      const degrees = rng.pick([25, 40, 55, 70, 90, 110, 125, 145, 160])
      const answer = degrees < 90 ? 'Acute' : degrees === 90 ? 'Right angle' : 'Obtuse'
      return {
        id: `angles-${rng.seed}`,
        skillId: 'angles',
        level,
        prompt: `What type of angle is this?`,
        visual: { kind: 'angle', degrees },
        answer,
        inputMode: 'choice',
        choices: rng.shuffle(['Acute', 'Right angle', 'Obtuse', 'Reflex']),
        hints: [
          'Compare it with a square corner (90°).',
          'Smaller than a square corner = acute. Bigger = obtuse.',
          `This angle looks ${degrees < 90 ? 'smaller' : degrees === 90 ? 'exactly like' : 'bigger'} than a right angle.`
        ],
        worked: [
          `This angle measures ${degrees}°.`,
          degrees < 90
            ? '90° is a right angle, and this is less than that, so it is acute.'
            : degrees === 90
              ? 'Exactly 90° is a right angle.'
              : 'It is more than 90° but less than 180°, so it is obtuse.',
          `Answer: ${answer}`
        ]
      }
    }
    const known = rng.int(20, 160)
    const answer = 180 - known
    return {
      id: `angles-${rng.seed}`,
      skillId: 'angles',
      level,
      prompt: `Two angles sit together on a straight line. One of them is ${known}°. What is the other one?`,
      visual: { kind: 'angle', degrees: known },
      answer: String(answer),
      unit: '°',
      inputMode: 'number',
      hints: [
        'Angles on a straight line always add up to the same total.',
        'That total is 180°.',
        `So work out 180 − ${known}.`
      ],
      worked: [`Angles on a straight line add to 180°.`, `180 − ${known} = ${answer}`, `The other angle is ${answer}°.`]
    }
  }
}

export const measurementSkills: Skill[] = [perimeter, area, volume, unitConversion, time, angles]
