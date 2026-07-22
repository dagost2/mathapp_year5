import { Skill, choicesFrom } from '../types'

const SHAPES_2D = [
  { name: 'Triangle', sides: 3, corners: 3 },
  { name: 'Quadrilateral', sides: 4, corners: 4 },
  { name: 'Pentagon', sides: 5, corners: 5 },
  { name: 'Hexagon', sides: 6, corners: 6 },
  { name: 'Heptagon', sides: 7, corners: 7 },
  { name: 'Octagon', sides: 8, corners: 8 }
]

const SOLIDS = [
  { name: 'Cube', faces: 6, edges: 12, vertices: 8 },
  { name: 'Rectangular prism', faces: 6, edges: 12, vertices: 8 },
  { name: 'Triangular prism', faces: 5, edges: 9, vertices: 6 },
  { name: 'Square pyramid', faces: 5, edges: 8, vertices: 5 },
  { name: 'Triangular pyramid', faces: 4, edges: 6, vertices: 4 }
]

const shapes2d: Skill = {
  id: 'shapes-2d',
  strandId: 'space',
  title: '2D shapes',
  blurb: 'Naming shapes by their number of sides',
  guide: {
    summary: 'Flat shapes are named by how many sides they have. The names come from Greek number words.',
    steps: [
      'Count the sides carefully — go around once and mark your starting point.',
      '3 = triangle, 4 = quadrilateral, 5 = pentagon, 6 = hexagon, 7 = heptagon, 8 = octagon.',
      'The number of corners always matches the number of sides.'
    ],
    example: {
      question: 'What is a shape with 6 sides called?',
      working: ['6 sides.', 'Hex means six.'],
      answer: 'Hexagon'
    },
    watchOut: 'Pentagon (5) and hexagon (6) are the two most commonly muddled up.'
  },
  generate(level, rng) {
    const shape = rng.pick(level === 1 ? SHAPES_2D.slice(0, 4) : SHAPES_2D)
    const askName = rng.bool()
    if (askName) {
      return {
        id: `shapes-2d-${rng.seed}`,
        skillId: 'shapes-2d',
        level,
        prompt: `What is the name of this shape?`,
        visual: { kind: 'shape', sides: shape.sides },
        answer: shape.name,
        inputMode: 'choice',
        choices: choicesFrom(shape.name, rng.shuffle(SHAPES_2D.filter(s => s.name !== shape.name).map(s => s.name)), rng),
        hints: [
          'Count the sides one at a time, going around the shape.',
          'Mark where you started so you do not count twice.',
          `This shape has ${shape.sides} sides.`
        ],
        worked: [
          `Count the sides: this shape has ${shape.sides}.`,
          `A shape with ${shape.sides} sides is called a ${shape.name.toLowerCase()}.`
        ]
      }
    }
    return {
      id: `shapes-2d-${rng.seed}`,
      skillId: 'shapes-2d',
      level,
      prompt: `How many sides does a ${shape.name.toLowerCase()} have?`,
      visual: { kind: 'shape', sides: shape.sides },
      answer: String(shape.sides),
      inputMode: 'number',
      hints: [
        'The name of the shape tells you the number of sides.',
        'Count the sides in the picture.',
        `Go around the shape once, counting each straight edge.`
      ],
      worked: [`A ${shape.name.toLowerCase()} has ${shape.sides} sides.`, `It also has ${shape.corners} corners.`]
    }
  }
}

const shapes3d: Skill = {
  id: 'shapes-3d',
  strandId: 'space',
  title: '3D objects',
  blurb: 'Faces, edges and vertices of solid shapes',
  guide: {
    summary:
      'A FACE is a flat surface. An EDGE is where two faces meet (a line). A VERTEX is a corner point where edges meet.',
    steps: [
      'Faces: count the flat surfaces, including the ones you cannot see.',
      'Edges: count the lines where two faces meet.',
      'Vertices: count the pointy corners.',
      'Remember the hidden back of the object.'
    ],
    example: {
      question: 'How many faces does a cube have?',
      working: ['Top and bottom = 2.', 'Four sides = 4.', '2 + 4 = 6'],
      answer: '6'
    },
    watchOut: 'Do not forget the faces you cannot see in the drawing — the back and the bottom.'
  },
  generate(level, rng) {
    const solid = rng.pick(level === 1 ? SOLIDS.slice(0, 3) : SOLIDS)
    const part = rng.pick(level === 1 ? (['faces'] as const) : (['faces', 'edges', 'vertices'] as const))
    const answer = solid[part]
    return {
      id: `shapes-3d-${rng.seed}`,
      skillId: 'shapes-3d',
      level,
      prompt: `How many ${part} does a ${solid.name.toLowerCase()} have?`,
      answer: String(answer),
      inputMode: 'choice',
      choices: choicesFrom(answer, [answer + 1, answer - 1, answer + 2, answer - 2], rng),
      hints: [
        part === 'faces'
          ? 'Faces are the flat surfaces — count the hidden ones too.'
          : part === 'edges'
            ? 'Edges are the lines where two flat faces meet.'
            : 'Vertices are the pointy corners.',
        'Picture the shape and turn it around in your head.',
        `A ${solid.name.toLowerCase()} has ${solid.faces} faces, ${solid.edges} edges and ${solid.vertices} vertices.`
      ],
      worked: [
        `A ${solid.name.toLowerCase()} has:`,
        `${solid.faces} faces, ${solid.edges} edges, ${solid.vertices} vertices.`,
        `So the answer is ${answer}.`
      ]
    }
  }
}

const symmetry: Skill = {
  id: 'symmetry',
  strandId: 'space',
  title: 'Symmetry',
  blurb: 'Lines of symmetry in shapes',
  guide: {
    summary: 'A line of symmetry is a fold line: if you folded the shape along it, both halves would match exactly.',
    steps: [
      'Imagine folding the shape in half.',
      'Do the two halves land exactly on top of each other?',
      'If yes, that fold line is a line of symmetry.',
      'Try folding vertically, horizontally, and diagonally.'
    ],
    example: {
      question: 'How many lines of symmetry does a square have?',
      working: ['Fold top to bottom ✓', 'Fold left to right ✓', 'Fold along both diagonals ✓✓', 'That is 4.'],
      answer: '4'
    },
    watchOut: 'A regular shape has as many lines of symmetry as it has sides. A rectangle (not regular) has only 2.'
  },
  generate(level, rng) {
    const options = [
      { name: 'square', lines: 4 },
      { name: 'rectangle', lines: 2 },
      { name: 'equilateral triangle', lines: 3 },
      { name: 'regular pentagon', lines: 5 },
      { name: 'regular hexagon', lines: 6 }
    ]
    const pool = level === 1 ? options.slice(0, 3) : options.slice(0, 5)
    const shape = rng.pick(pool)
    const answer = String(shape.lines)
    return {
      id: `symmetry-${rng.seed}`,
      skillId: 'symmetry',
      level,
      prompt: `How many lines of symmetry does a ${shape.name} have?`,
      visual: { kind: 'shape', sides: shape.name === 'rectangle' ? 4 : shape.lines, label: shape.name },
      answer,
      inputMode: 'number',
      hints: [
        'Imagine folding the shape so both halves match exactly.',
        'Try folding it up and down, side to side, and corner to corner.',
        shape.name === 'rectangle'
          ? 'Careful — a rectangle does NOT have diagonal symmetry.'
          : 'A regular shape has one line of symmetry for each side.'
      ],
      worked: [
        `Fold a ${shape.name} in every way that makes the halves match.`,
        shape.name === 'rectangle'
          ? 'Only the vertical and horizontal folds work — the diagonals do not match up.'
          : `A ${shape.name} is regular, so it has one line of symmetry per side.`,
        `Answer: ${answer}`
      ]
    }
  }
}

const coordinates: Skill = {
  id: 'coordinates',
  strandId: 'space',
  title: 'Coordinates',
  blurb: 'Finding points on a grid using (x, y)',
  guide: {
    summary: 'A coordinate pair (x, y) tells you where a point is. The FIRST number is across, the SECOND is up.',
    steps: [
      'Start at the origin, the corner where both lines meet (0, 0).',
      'Move ACROSS by the first number.',
      'Move UP by the second number.',
      'Remember: "along the corridor, then up the stairs".'
    ],
    example: {
      question: 'What are the coordinates of a point 3 across and 2 up?',
      working: ['Across = 3, so x = 3.', 'Up = 2, so y = 2.'],
      answer: '(3, 2)'
    },
    watchOut: 'Never do up first. (3, 2) and (2, 3) are different points.'
  },
  generate(level, rng) {
    const size = level === 1 ? 5 : level === 2 ? 8 : 10
    const x = rng.int(1, size - 1)
    const y = rng.int(1, size - 1)
    const answer = `(${x}, ${y})`
    return {
      id: `coordinates-${rng.seed}`,
      skillId: 'coordinates',
      level,
      prompt: `What are the coordinates of point A?`,
      visual: { kind: 'coordGrid', size, points: [{ x, y, label: 'A' }] },
      answer,
      inputMode: 'choice',
      choices: choicesFrom(answer, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y + 1})`, `(${x - 1}, ${y})`], rng),
      hints: [
        'Along the corridor first, then up the stairs.',
        'Count across from the bottom-left corner to find the first number.',
        'Then count upwards to find the second number.'
      ],
      worked: [
        `Start at the origin (0, 0) in the bottom-left corner.`,
        `Count across: ${x}.`,
        `Count up: ${y}.`,
        `So point A is at ${answer}.`
      ]
    }
  }
}

const transformations: Skill = {
  id: 'transformations',
  strandId: 'space',
  title: 'Flips, slides & turns',
  blurb: 'Translations, reflections and rotations',
  guide: {
    summary:
      'A TRANSLATION slides a shape (no turning). A REFLECTION flips it like a mirror. A ROTATION turns it around a point.',
    steps: [
      'Slide = translation. The shape looks exactly the same, just in a new spot.',
      'Flip = reflection. The shape is mirrored — like looking at it in water.',
      'Turn = rotation. The shape is spun around a point.',
      'Ask: did it change direction, or just move?'
    ],
    example: {
      question: 'A shape is moved 4 squares right without turning. What is this called?',
      working: ['It did not flip or turn.', 'It only slid across.'],
      answer: 'Translation'
    },
    watchOut: 'A reflection swaps left and right. A translation never changes which way the shape faces.'
  },
  generate(level, rng) {
    const cases = [
      { desc: `moved ${rng.int(2, 6)} squares to the right without turning`, answer: 'Translation' },
      { desc: 'flipped over a mirror line', answer: 'Reflection' },
      { desc: 'turned 90° around a point', answer: 'Rotation' },
      { desc: 'slid down the page, still facing the same way', answer: 'Translation' },
      { desc: 'turned upside down by spinning around its centre', answer: 'Rotation' }
    ]
    const c = rng.pick(cases)
    return {
      id: `transformations-${rng.seed}`,
      skillId: 'transformations',
      level,
      prompt: `A shape is ${c.desc}. What is this transformation called?`,
      answer: c.answer,
      inputMode: 'choice',
      choices: rng.shuffle(['Translation', 'Reflection', 'Rotation']),
      hints: [
        'Slide = translation, flip = reflection, turn = rotation.',
        'Did the shape change the direction it faces?',
        'If it only moved position, it is a translation.'
      ],
      worked: [
        `The shape was ${c.desc}.`,
        c.answer === 'Translation'
          ? 'It only changed position, not direction — that is a translation (a slide).'
          : c.answer === 'Reflection'
            ? 'It was mirrored — that is a reflection (a flip).'
            : 'It was spun around a point — that is a rotation (a turn).',
        `Answer: ${c.answer}`
      ]
    }
  }
}

export const spaceSkills: Skill[] = [shapes2d, shapes3d, symmetry, coordinates, transformations]
