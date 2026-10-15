import { useEffect, useRef, useState } from 'react'

// Hook chạy Monte Carlo trong Web Worker, trả về tiến độ và kết quả.
export function useMC() {
  const workerRef = useRef(null)
  const idRef = useRef(0)
  const [state, setState] = useState({ running: false, done: 0, total: 0, results: null })

  useEffect(() => () => workerRef.current?.terminate(), [])

  const run = (cfg) => {
    workerRef.current?.terminate()
    const w = new Worker(new URL('./mc.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = w
    const id = ++idRef.current
    const total = cfg.kind === 'steps' ? 10 : cfg.alphas.length
    setState({ running: true, done: 0, total, results: null })
    w.onmessage = (e) => {
      if (e.data.id !== id) return
      if (e.data.type === 'progress')
        setState({ running: true, done: e.data.done, total: e.data.total, results: e.data.partial })
      else {
        setState({ running: false, done: total, total, results: e.data.results })
        w.terminate()
      }
    }
    w.postMessage({ id, cfg })
  }
  const cancel = () => {
    workerRef.current?.terminate()
    setState((s) => ({ ...s, running: false }))
  }
  return { ...state, run, cancel }
}
