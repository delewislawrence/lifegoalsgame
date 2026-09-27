import { useEffect, useState } from 'react'
import { draftPlan, clearAiCache, installModel, modelCached, webGpuAvailable } from '../ai/localAi'
import type { GoalPlan } from '../ai/plan'
import { useGame } from '../state/GameProvider'
import { readBackup, type BackupFile } from '../settings/backup'
import { applyTheme, loadSettings, saveSettings, themeLabel, THEMES, type ThemeId } from '../settings/prefs'

type ModelStatus = 'missing' | 'downloading' | 'ready'

export default function Settings() {
  const { save, journal, today, dispatch, replaceJournal } = useGame()
  const stored = loadSettings()
  const [theme, setTheme] = useState<ThemeId>(stored.theme)
  const [plan, setPlan] = useState<GoalPlan | null>(stored.plan)
  const [goal, setGoal] = useState('')
  const [message, setMessage] = useState('')
  const [gpu] = useState(webGpuAvailable)
  const [status, setStatus] = useState<ModelStatus>('missing')
  const [percent, setPercent] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    modelCached()
      .then((cached) => {
        if (active && cached) setStatus('ready')
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const chooseTheme = (next: ThemeId) => {
    const settings = { ...loadSettings(), theme: next }
    saveSettings(settings)
    applyTheme(next)
    setTheme(next)
  }

  const exportBackup = () => {
    const file: BackupFile = {
      kind: 'animus-backup',
      version: 1,
      save,
      journal,
      settings: loadSettings(),
    }
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `animus-backup-${today}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const install = async () => {
    setBusy(true)
    setStatus('downloading')
    setMessage('')
    try {
      await installModel((next) => setPercent(next))
      setStatus('ready')
      setPercent(100)
    } catch (error) {
      setStatus('missing')
      setMessage(error instanceof Error ? error.message : 'The model could not be installed.')
    } finally {
      setBusy(false)
    }
  }

  const clearCache = async () => {
    setBusy(true)
    setMessage('')
    try {
      await clearAiCache()
      setStatus('missing')
      setPercent(0)
      setMessage('Local model cache cleared.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The model cache could not be cleared.')
    } finally {
      setBusy(false)
    }
  }

  const ask = async () => {
    const text = goal.trim()
    if (!text) return
    setBusy(true)
    setMessage('')
    try {
      if (status !== 'ready') setStatus('downloading')
      const next = await draftPlan(themeLabel(theme), text, (percent) => {
        setPercent(percent)
        if (percent < 100) setStatus('downloading')
      })
      const settings = { ...loadSettings(), plan: next }
      saveSettings(settings)
      setPlan(next)
      setStatus('ready')
      setPercent(100)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The plan could not be read.')
      const cached = await modelCached().catch(() => false)
      setStatus(cached ? 'ready' : 'missing')
    } finally {
      setBusy(false)
    }
  }

  const statusLabel = status === 'ready' ? 'Ready' : status === 'downloading' ? `Downloading ${percent}%` : 'Not installed'

  return (
    <>
      <p className="brand">SETTINGS</p>
      <h1>Appearance and local planner</h1>
      <label>
        Theme
        <select value={theme} onChange={(event) => chooseTheme(event.target.value as ThemeId)}>
          {THEMES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>

      <section className="section">
        <h2>Backup</h2>
        <p>This file holds the campaign, the journal, and these settings. A file that cannot be read leaves the current data in place.</p>
        <div className="button-row">
          <button className="btn" type="button" onClick={exportBackup}>Export</button>
          <label className="btn">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                const restored = readBackup(await file.text(), today)
                if (!restored) {
                  setMessage('That file could not be read. Nothing was replaced.')
                  return
                }
                dispatch({ type: 'import-save', save: restored.save })
                if (restored.journal) replaceJournal(restored.journal)
                if (restored.settings) {
                  saveSettings(restored.settings)
                  applyTheme(restored.settings.theme)
                  setTheme(restored.settings.theme)
                  setPlan(restored.settings.plan)
                }
                setMessage('Backup imported.')
              }}
            />
          </label>
        </div>
      </section>

      <section className="section">
        <h2>Local planner</h2>
        <p>WebGPU {gpu ? 'pass' : 'fail'}. Model: {statusLabel}. Phi-3-mini stays in this browser and is not sent to a server.</p>
        <div className="button-row">
          <button className="btn solid" type="button" disabled={!gpu || busy || status === 'ready'} onClick={install}>Install</button>
          <button className="btn" type="button" disabled={busy || status === 'missing'} onClick={clearCache}>Clear AI cache</button>
        </div>
        <label>
          Goal
          <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="What should this year move toward?" />
        </label>
        <div className="button-row">
          <button className="btn solid" type="button" disabled={!gpu || busy || status !== 'ready' || !goal.trim()} onClick={ask}>Draft plan</button>
        </div>
        {plan ? <PlanView plan={plan} /> : null}
      </section>
      {message ? <p>{message}</p> : null}
    </>
  )
}

function PlanView({ plan }: { plan: GoalPlan }) {
  const sequences = [
    ['awakening', 'Awakening'],
    ['apprentice', 'Apprentice'],
    ['assassin', 'Assassin'],
    ['master', 'Master'],
  ] as const
  const contracts = [
    ['body', 'Body'],
    ['mind', 'Mind'],
    ['inner_temple', 'Inner Temple'],
  ] as const
  return (
    <div className="card">
      {sequences.map(([id, label]) => (
        <p key={id}>
          <strong>{label}</strong>
          <br />
          {plan.sequences[id].milestone}
          <br />
          {plan.sequences[id].focus}
        </p>
      ))}
      {contracts.map(([id, label]) => (
        <div key={id}>
          <strong>{label}</strong>
          <ol>
            {plan.initial_contracts[id].map((step, index) => (
              <li key={`${id}-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
