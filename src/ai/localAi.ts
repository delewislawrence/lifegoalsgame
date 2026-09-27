import { parseGoalPlan, systemPrompt, type GoalPlan } from './plan'

export const MODEL_ID = 'Phi-3-mini-4k-instruct-q4f16_1-MLC'

type Engine = import('@mlc-ai/web-llm').MLCEngine

let engine: Engine | null = null
let loading: Promise<Engine> | null = null

export function webGpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

export async function modelCached(): Promise<boolean> {
  const { hasModelInCache } = await import('@mlc-ai/web-llm')
  return hasModelInCache(MODEL_ID)
}

export async function installModel(onProgress: (percent: number, text: string) => void): Promise<void> {
  if (engine) {
    onProgress(100, 'Ready')
    return
  }
  if (!loading) {
    loading = (async () => {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      return CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          const ratio = report.progress > 1 ? report.progress : report.progress * 100
          const percent = Math.max(0, Math.min(100, Math.round(ratio)))
          onProgress(percent, report.text)
        },
      })
    })()
  }
  try {
    engine = await loading
    onProgress(100, 'Ready')
  } catch (error) {
    loading = null
    throw error
  }
}

export async function clearAiCache(): Promise<void> {
  const { deleteModelAllInfoInCache } = await import('@mlc-ai/web-llm')
  if (engine) {
    await engine.unload()
    engine = null
  }
  loading = null
  await deleteModelAllInfoInCache(MODEL_ID)
}

export async function draftPlan(
  themeName: string,
  goal: string,
  onProgress: (percent: number, text: string) => void = () => undefined,
): Promise<GoalPlan> {
  await installModel(onProgress)
  if (!engine) throw new Error('Install the local model first.')
  const reply = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt(themeName) },
      { role: 'user', content: goal.trim() },
    ],
    temperature: 0.3,
    max_tokens: 1400,
  })
  const text = reply.choices[0]?.message?.content ?? ''
  const plan = parseGoalPlan(text)
  await engine.resetChat()
  if (!plan) throw new Error('The model did not return a valid plan.')
  return plan
}
