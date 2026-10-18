// Web Worker chạy Monte Carlo để không chặn giao diện.
import { makeRng, simOverlap1D, sizeSequence } from './model.js'

self.onmessage = (e) => {
  const { id, cfg } = e.data
  runSteps(id, cfg)
}

// Đếm mục tiêu bị loại ở từng bước t với một α cố định (Demo 2b)
function runSteps(id, cfg) {
  const rng = makeRng(cfg.seed ?? 12345)
  const { n0, L0, nFinal, p, trials, alpha, mode = 'exclusive' } = cfg
  const beta = sizeSequence(n0, alpha, nFinal).length - 1
  const fails = new Array(beta).fill(0)
  const chunks = 10
  const per = Math.ceil(trials / chunks)
  let done = 0
  for (let c = 0; c < chunks; c++) {
    for (let i = 0; i < per && done < trials; i++, done++) {
      const target = Math.floor(rng.uniform() * n0)
      const r = simOverlap1D({ n0, L0, nFinal, alpha, p, mode, rng, target })
      if (r.failStep >= 0) fails[r.failStep]++
    }
    const res = { fails: fails.slice(), trials: done }
    self.postMessage({ id, type: 'progress', done: c + 1, total: chunks, partial: res })
  }
  self.postMessage({ id, type: 'done', results: { fails, trials: done } })
}
