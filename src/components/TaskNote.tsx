import { useState } from 'react'
import { useGame } from '../state/GameProvider'

export default function TaskNote({ id }: { id: string }) {
  const { save, dispatch } = useGame()
  const [open, setOpen] = useState(false)
  const text = save.notes?.[id] ?? ''
  return (
    <>
      <button className={text.trim() ? 'btn ghost note-toggle has-note' : 'btn ghost note-toggle'} type="button" onClick={() => setOpen((current) => !current)}>
        {open ? 'Close' : 'Note'}
      </button>
      {open ? (
        <label className="note-panel">
          Note
          <textarea
            value={text}
            placeholder="Write a note for this task"
            onChange={(event) => dispatch({ type: 'set-note', id, text: event.target.value })}
          />
        </label>
      ) : null}
    </>
  )
}
