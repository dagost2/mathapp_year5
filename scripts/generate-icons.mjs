import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(join(__dir, 'icon.svg'))

mkdirSync('public/icons', { recursive: true })

await sharp(svg).resize(192, 192).png().toFile('public/icons/pwa-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icons/pwa-512.png')

console.log('Icons generated → public/icons/')
