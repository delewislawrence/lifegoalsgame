import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

function crc32(buf) {
  let crc = ~0
  for (const byte of buf) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function png(size, paint) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 2
  const stride = 1 + size * 3
  const raw = Buffer.alloc(size * stride)
  for (let y = 0; y < size; y += 1) {
    const row = y * stride
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = paint(x, y, size)
      const index = row + 1 + x * 3
      raw[index] = r
      raw[index + 1] = g
      raw[index + 2] = b
    }
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function smooth(edge, width, distance) {
  return Math.max(0, Math.min(1, (edge + width - distance) / (width * 2)))
}

function sun(x, y, size, scale) {
  const center = (size - 1) / 2
  const distance = Math.hypot(x - center, y - center)
  const radius = size * scale
  const ring = smooth(radius, 1.4, distance) * (1 - smooth(radius * 0.78, 1.4, distance))
  const dot = smooth(radius * 0.16, 1.2, distance)
  const ink = Math.round(255 * Math.max(ring, dot))
  return [ink, ink, ink]
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', png(192, (x, y, size) => sun(x, y, size, 0.34)))
writeFileSync('public/icon-512.png', png(512, (x, y, size) => sun(x, y, size, 0.34)))
writeFileSync('public/icon-512-maskable.png', png(512, (x, y, size) => sun(x, y, size, 0.2)))
