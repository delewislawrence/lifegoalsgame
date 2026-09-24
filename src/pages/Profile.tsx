import { useState } from 'react'
import { CONTRACTS } from '../game/catalog'
import { parseSave } from '../game/storage'
import { useGame } from '../state/GameProvider'
import type { DayEntry } from '../game/journal'
import type { ContractId, ContractText } from '../game/types'

export default function Profile() {
  const { save, journal, dispatch, today, mergeDays } = useGame()
  const [name, setName] = useState(save.playerName)
  const [contracts, setContracts] = useState<Record<ContractId, ContractText>>(save.contracts)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const saveSettings = () => {
    dispatch({ type: 'update-settings', playerName: name, contracts })
    setMessage('Profile saved.')
  }

  const exportSave = () => {
    const blob = new Blob([JSON.stringify({ ...save, journal: journal.entries }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `animus-year-${save.campaign}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <p className="brand">PROFILE</p>
      <h1>{save.playerName}</h1>
      <p className="meta">Campaign {save.campaign} · started {save.startedAt}</p>
      <p>Progress lives in this browser. Export a backup before you clear site data.</p>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      {CONTRACTS.map((contract) => (
        <div key={contract.id}>
          <label>
            {contract.defaultTitle} title
            <input
              value={contracts[contract.id]?.title ?? ''}
              onChange={(event) => setContracts((current) => ({ ...current, [contract.id]: { ...current[contract.id], title: event.target.value } }))}
            />
          </label>
          <label>
            Description
            <textarea
              value={contracts[contract.id]?.description ?? ''}
              onChange={(event) => setContracts((current) => ({ ...current, [contract.id]: { ...current[contract.id], description: event.target.value } }))}
            />
          </label>
        </div>
      ))}
      <div className="button-row">
        <button className="btn solid" type="button" onClick={saveSettings}>Save profile</button>
      </div>
      <label className="row-between">
        <span>Sound</span>
        <input
          type="checkbox"
          checked={save.sound}
          onChange={(event) => dispatch({ type: 'update-settings', sound: event.target.checked })}
        />
      </label>
      <div className="button-row">
        <button className="btn" type="button" onClick={exportSave}>Export</button>
        <label className="btn">
          Import
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const text = await file.text()
              const parsed = parseSave(text)
              if (!parsed) {
                setMessage('That file is not an Animus save.')
                return
              }
              dispatch({ type: 'import-save', save: parsed })
              const extra = JSON.parse(text) as { journal?: DayEntry[] }
              if (Array.isArray(extra.journal)) mergeDays(extra.journal)
              setMessage('Campaign imported. Existing days were kept.')
            }}
          />
        </label>
      </div>
      {message ? <p>{message}</p> : null}
      <section className="section">
        <h2>Past campaigns</h2>
        {save.history.length === 0 ? <p>No archived year yet. The first one ends at 100% synchronization.</p> : null}
        {save.history.map((year) => (
          <div key={`${year.campaign}-${year.endedAt}`} className="history-item">
            <strong>Year {year.campaign}</strong>
            <p>{year.startedAt} — {year.endedAt}</p>
            <p>{Math.round(year.xp)} XP · {year.goalsCompleted} goals · {year.contractsCompleted} contracts · best streak {year.bestStreak}</p>
          </div>
        ))}
      </section>
      <section className="section">
        <h2>Reset</h2>
        <p>This clears the current year and keeps archived campaigns. Recorded days stay until you delete each one on the Days page.</p>
        {confirmReset ? (
          <button className="btn" type="button" onClick={() => dispatch({ type: 'reset-campaign', at: new Date().toISOString(), date: today })}>
            Confirm reset
          </button>
        ) : (
          <button className="btn ghost" type="button" onClick={() => setConfirmReset(true)}>Reset campaign</button>
        )}
      </section>
    </>
  )
}
