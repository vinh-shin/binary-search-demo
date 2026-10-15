// Web Worker chạy Monte Carlo để không chặn giao diện.
import { makeRng, simOverlap1D, sizeSequence } from './model.js'

self.onmessage = (e) => {
  const { id, cfg } = e.data
  if (cfg.kind === 'steps') runSteps(id, cfg)
  else runAlphas(id, cfg)
}

// Lỗi tổng theo từng α (Đồ thị D)
function runAlphas(id, cfg) {
  const rng = makeRng(cfg.seed ?? 12345)
  const { n0, L0, nFinal, p, trials, mode = 'exclusive' } = cfg
  const results = []
  const total = cfg.alphas.length
  cfg.alphas.forEach((alpha, idx) => {
    const beta = sizeSequence(n0, alpha, nFinal).length - 1
    let err = 0
    for (let tr = 0; tr < trials; tr++) {
      const target = Math.floor(rng.uniform() * n0)
      if (simOverlap1D({ n0, L0, nFinal, alpha, p, mode, rng, target }).error) err++
    }
    results.push({ alpha, beta, overlap: err / trials })
    self.postMessage({ id, type: 'progress', done: idx + 1, total, partial: results.slice() })
  })
  self.postMessage({ id, type: 'done', results })
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
