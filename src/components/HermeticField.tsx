import type { ReactNode } from 'react'

const GLYPHS: ReactNode[] = [
  <>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </>,
  <path d="M16.5 7.2a6.2 6.2 0 1 0 0 9.6" />,
  <>
    <path d="M8.5 5.2c1.6-1.4 5.4-1.4 7 0" />
    <circle cx="12" cy="10.2" r="3.4" />
    <path d="M12 13.6v6.2M8.6 16.4h6.8" />
  </>,
  <>
    <circle cx="12" cy="8.6" r="3.6" />
    <path d="M12 12.2v8M8.4 16.4h7.2" />
  </>,
  <>
    <circle cx="9.2" cy="14.4" r="3.8" />
    <path d="M12 11.2 18.2 5M14.6 5H18.2v3.6" />
  </>,
  <>
    <path d="M7 18.5c2.2-7 8-9.2 10.4-6.2 1.6 2 .4 4.2-1.6 4.2H9.2" />
    <path d="M12 6.2v4.2" />
  </>,
  <>
    <path d="M8 16.8h8M12 7.2v11" />
    <path d="M7.2 20h9.6" />
  </>,
  <>
    <path d="M12 4.2 19 16.2H5z" />
    <path d="M12 11.2v6.4M8.8 14.6h6.4" />
  </>,
  <>
    <circle cx="12" cy="13.2" r="4.6" />
    <path d="M12 8.6V4.2M12 17.8v2" />
  </>,
  <>
    <path d="M12 3.4 20.2 18.2H3.8z" />
    <circle cx="12" cy="13.4" r="2.1" />
    <path d="M12 12.2v2.6" />
  </>,
  <>
    <path d="M12 3.2c2.4 2.2 2.4 4.2 0 6.2-2.4-2-2.4-4 0-6.2z" />
    <path d="M12 9.2v11.2M8 15.2h8" />
  </>,
  <>
    <path d="M12 2.8 14.1 9h6.5l-5.3 3.8 2 6.2L12 15.4 6.7 19l2-6.2L3.4 9h6.5z" />
  </>,
  <>
    <circle cx="12" cy="12" r="7.2" />
    <rect x="6.2" y="6.2" width="11.6" height="11.6" />
    <path d="M12 4.8v14.4M4.8 12h14.4" />
  </>,
  <>
    <path d="M4 16.8 12 4.2l8 12.6z" />
    <path d="M4 8.2 12 20.8l8-12.6z" />
  </>,
  <path d="M16.8 8.2A6.4 6.4 0 1 0 16.2 16l2.2 2.2-1.6 1.6" />,
]

const MARKS = Array.from({ length: 16 }, (_, index) => ({
  glyph: index % GLYPHS.length,
  left: `${(index * 41) % 94}%`,
  top: `${(index * 23) % 96}%`,
  size: 28 + (index % 5) * 14,
  duration: 28 + (index % 6) * 6,
  delay: -(index * 5),
  opacity: 0.08 + (index % 4) * 0.03,
}))

export default function HermeticField() {
  return (
    <div className="hermetic-field" aria-hidden="true">
      {MARKS.map((mark, index) => (
        <svg
          key={index}
          className="hermetic-glyph"
          viewBox="0 0 24 24"
          width={mark.size}
          height={mark.size}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            left: mark.left,
            top: mark.top,
            opacity: mark.opacity,
            animationDuration: `${mark.duration}s`,
            animationDelay: `${mark.delay}s`,
          }}
        >
          {GLYPHS[mark.glyph]}
        </svg>
      ))}
    </div>
  )
}
