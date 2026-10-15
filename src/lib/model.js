// Lõi toán học cho "Enhancing Binary Search via Overlapping Partitions".
// Ký hiệu bám theo bài báo: alpha (độ chồng lấn), sigma (độ lệch chuẩn nhiễu),
// f(d) = mô hình suy hao log-distance (đơn vị dB), Q(x) = Gaussian tail.

export const DEFAULT_PARAMS = { P0: 20, eta: 1, sigma: 1 / Math.SQRT2, eps: 10 }

// Eq. (9): 10 log10 f(d) = P0 - eta * 10 log10(d + eps)  =>  f(d) = 10^(P0/10) / (d + eps)^eta.
// Nhiễu Gauss được cộng vào f(d) ở miền tuyến tính (cách đọc này khớp với độ lớn P_e trong Fig. 2).
export function f(d, p) {
  return Math.pow(10, p.P0 / 10) / Math.pow(d + p.eps, p.eta)
}

// ---------- Hàm Q và các tiện ích số học ----------

// erfc theo Numerical Recipes (sai số tương đối < 1.2e-7).
export function erfc(x) {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const r =
    t *
    Math.exp(
      -z * z - 1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
        t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    )
  return x >= 0 ? r : 2 - r
}

export const Q = (x) => 0.5 * erfc(x / Math.SQRT2)

// Làm tròn về số chẵn gần nhất khi bằng .5 (round() trong Eq. 3).
export function roundHalfEven(x) {
  const fl = Math.floor(x)
  const diff = x - fl
  if (Math.abs(diff - 0.5) < 1e-12) return fl % 2 === 0 ? fl : fl + 1
  return Math.round(x)
}

// Eq. (3): số điểm lưới của mỗi nửa sau khi phân hoạch.
export function nextSize(n, alpha) {
  return Math.max(roundHalfEven((0.5 + alpha) * n), Math.ceil(n / 2))
}

// Dãy kích thước n^(0) > n^(1) > ... cho tới khi n <= nFinal.
export function sizeSequence(n0, alpha, nFinal = 1) {
  const seq = [n0]
  let n = n0
  while (n > nFinal) {
    const m = nextSize(n, alpha)
    if (m >= n) break
    n = m
    seq.push(n)
  }
  return seq
}

// Eq. (6): xấp xỉ độ sâu cây.
export function approxDepth(n0, nFinal, alpha) {
  return (Math.log(n0) - Math.log(nFinal)) / Math.log(1 / (0.5 + alpha))
}

// PRNG có seed (mulberry32) + Gaussian (Box–Muller) để mô phỏng tái lập được.
export function makeRng(seed = 1) {
  let a = seed >>> 0
  const uniform = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  let spare = null
  const normal = () => {
    if (spare !== null) {
      const s = spare
      spare = null
      return s
    }
    let u = 0
    while (u === 0) u = uniform()
    const v = uniform()
    const r = Math.sqrt(-2 * Math.log(u))
    spare = r * Math.sin(2 * Math.PI * v)
    return r * Math.cos(2 * Math.PI * v)
  }
  return { uniform, normal }
}

// ---------- Hình học 1D của một bước ----------

// Vị trí cảm biến đối xứng quanh điểm giữa khoảng [start, start+len].
//  - 'exclusive': giữa vùng "riêng" của mỗi nửa, s = (L/2)(1/2 - alpha)  (Fig. 3, 5)
//  - 'quarter'  : cố định tại L/4 và 3L/4                                 (Fig. 2)
//  - 'custom'   : s = frac * L
export function sensorPositions(start, len, mode, alphaEff, frac = 0.25) {
  let off
  if (mode === 'exclusive') off = (len / 2) * (0.5 - alphaEff)
  else if (mode === 'quarter') off = len / 4
  else off = frac * len
  return [start + off, start + len - off]
}

// Khoảng cách từ h_k tới biên quyết định (đường chéo z1 = z2) khi có 2 cảm biến
// đối xứng: d_k = ||h_k - h_k'|| / 2 = |h_k1 - h_k2| / sqrt(2).
export function dk(x, s1, s2, p) {
  return Math.abs(f(Math.abs(s1 - x), p) - f(Math.abs(s2 - x), p)) / Math.SQRT2
}

// Corollary 2(a): P_e^t trên lưới rời rạc n điểm, khoảng dài len (bắt đầu tại 0).
export function peStepDiscrete(n, len, alpha, p, mode = 'exclusive', frac = 0.25) {
  const m = nextSize(n, alpha)
  const excl = n - m // số điểm thuộc H1 \ H2
  if (excl <= 0) return 0
  const delta = len / n
  const alphaEff = m / n - 0.5
  const [s1, s2] = sensorPositions(0, len, mode, alphaEff, frac)
  let sum = 0
  for (let k = 0; k < excl; k++) {
    const x = (k + 0.5) * delta
    sum += Q(dk(x, s1, s2, p) / p.sigma)
  }
  return (2 / n) * sum
}

// Corollary 2(b): giới hạn liên tục n -> infinity (tích phân Riemann).
export function peStepContinuous(len, alpha, p, mode = 'exclusive', frac = 0.25, steps = 2000) {
  const upper = len * (0.5 - alpha)
  if (upper <= 0) return 0
  const [s1, s2] = sensorPositions(0, len, mode, alpha, frac)
  const h = upper / steps
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) * h
    sum += Q(dk(x, s1, s2, p) / p.sigma)
  }
  return (2 / len) * sum * h
}

// Eq. (1): lỗi tổng theo lý thuyết, dùng P_e^t từ Corollary 2(a) ở mỗi bước.
export function peTotalTheory(n0, L0, nFinal, alpha, p, mode = 'exclusive') {
  const seq = sizeSequence(n0, alpha, nFinal)
  const delta = L0 / n0
  let surv = 1
  const steps = []
  for (let t = 0; t < seq.length - 1; t++) {
    const n = seq[t]
    const pe = peStepDiscrete(n, n * delta, alpha, p, mode)
    surv *= 1 - pe
    steps.push({ t: t + 1, n, pe })
  }
  return { beta: seq.length - 1, total: 1 - surv, steps, finalSize: seq[seq.length - 1] }
}

// ---------- Một bước của Algorithm 1 trên lưới 2D (1D là trường hợp ny = 1) ----------

// state: { x0, x1, y0, y1 } — các chỉ số [x0, x1) × [y0, y1) trong lưới gốc nx × ny.
// grid : { nx, ny, Lx, Ly }
export function gridPoint(i, j, grid) {
  return [((i + 0.5) * grid.Lx) / grid.nx, ((j + 0.5) * grid.Ly) / grid.ny]
}

export function partition(state, grid, alpha) {
  const dxLen = ((state.x1 - state.x0) * grid.Lx) / grid.nx
  const dyLen = ((state.y1 - state.y0) * grid.Ly) / grid.ny
  const canX = state.x1 - state.x0 > 1
  const canY = state.y1 - state.y0 > 1
  if (!canX && !canY) return null
  // Chiều dài nhất (trong các chiều còn chia được)
  const dim = canX && (!canY || dxLen >= dyLen) ? 'x' : 'y'
  const lo = dim === 'x' ? state.x0 : state.y0
  const hi = dim === 'x' ? state.x1 : state.y1
  const n = hi - lo
  const m = nextSize(n, alpha)
  const H1 = { ...state }
  const H2 = { ...state }
  if (dim === 'x') {
    H1.x1 = lo + m
    H2.x0 = hi - m
  } else {
    H1.y1 = lo + m
    H2.y0 = hi - m
  }
  return { dim, n, m, H1, H2, alphaEff: m / n - 0.5 }
}

// Cảm biến đối xứng quanh điểm giữa theo chiều cắt; chiều còn lại đặt ở tâm.
export function sensors2D(state, grid, part, mode) {
  const dX = grid.Lx / grid.nx
  const dY = grid.Ly / grid.ny
  const cx = ((state.x0 + state.x1) / 2) * dX
  const cy = ((state.y0 + state.y1) / 2) * dY
  if (part.dim === 'x') {
    const start = state.x0 * dX
    const len = (state.x1 - state.x0) * dX
    const off = mode === 'exclusive' ? ((part.n - part.m) * dX) / 2 : len / 4
    return [
      [start + off, cy],
      [start + len - off, cy],
    ]
  }
  const start = state.y0 * dY
  const len = (state.y1 - state.y0) * dY
  const off = mode === 'exclusive' ? ((part.n - part.m) * dY) / 2 : len / 4
  return [
    [cx, start + off],
    [cx, start + len - off],
  ]
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

export function hVec(point, sensors, p) {
  return sensors.map((s) => f(dist(s, point), p))
}

export const inRect = (i, j, r) => i >= r.x0 && i < r.x1 && j >= r.y0 && j < r.y1

// Thực hiện một bước: đo, tính log-likelihood mọi điểm, chọn nửa theo Eq. (5).
export function runStep(state, grid, alpha, p, mode, target, rng, reps = 1) {
  const part = partition(state, grid, alpha)
  if (!part) return null
  const sens = sensors2D(state, grid, part, mode)
  const tPos = gridPoint(target[0], target[1], grid)
  const hT = hVec(tPos, sens, p)
  // r lần lặp → lấy trung bình (thống kê đủ cho ML Gauss)
  const z = hT.map((h) => {
    let acc = 0
    for (let r = 0; r < reps; r++) acc += h + p.sigma * rng.normal()
    return acc / reps
  })
  const lik = []
  let best1 = -Infinity
  let best2 = -Infinity
  let arg1 = null
  let arg2 = null
  for (let i = state.x0; i < state.x1; i++) {
    for (let j = state.y0; j < state.y1; j++) {
      const h = hVec(gridPoint(i, j, grid), sens, p)
      const ll = (-reps * ((z[0] - h[0]) ** 2 + (z[1] - h[1]) ** 2)) / (2 * p.sigma ** 2)
      lik.push({ i, j, ll, h })
      if (inRect(i, j, part.H1) && ll > best1) {
        best1 = ll
        arg1 = [i, j]
      }
      if (inRect(i, j, part.H2) && ll > best2) {
        best2 = ll
        arg2 = [i, j]
      }
    }
  }
  const choice = best1 > best2 ? 1 : best1 < best2 ? 2 : z[0] >= z[1] ? 1 : 2
  const next = choice === 1 ? part.H1 : part.H2
  return {
    part,
    sensors: sens,
    z,
    hT,
    lik,
    best1,
    best2,
    arg1,
    arg2,
    choice,
    next,
    targetInside: inRect(target[0], target[1], next),
  }
}

// ---------- Mô phỏng Monte Carlo 1D cho các phương pháp (dùng trong worker) ----------

function precomputeH(n0, L0, p) {
  const delta = L0 / n0
  return Float64Array.from({ length: n0 }, (_, i) => (i + 0.5) * delta)
}

// Chạy trọn Algorithm 1 (1D) cho một mục tiêu, trả về mục tiêu có bị loại hay không.
export function simOverlap1D({ n0, L0, nFinal, alpha, p, mode, rng, target }) {
  const xs = precomputeH(n0, L0, p)
  const delta = L0 / n0
  let lo = 0
  let hi = n0
  let t = 0
  let failStep = -1 // bước (0-index) mà mục tiêu bị loại, -1 nếu không bị loại
  while (hi - lo > nFinal) {
    const n = hi - lo
    const m = nextSize(n, alpha)
    if (m >= n) break
    const start = lo * delta
    const off = mode === 'quarter' ? (n * delta) / 4 : ((n - m) * delta) / 2
    const s1 = start + off
    const s2 = start + n * delta - off
    const xt = xs[target]
    const sig = p.sigma
    const z1 = f(Math.abs(s1 - xt), p) + sig * rng.normal()
    const z2 = f(Math.abs(s2 - xt), p) + sig * rng.normal()
    let b1 = -Infinity
    let b2 = -Infinity
    for (let k = lo; k < hi; k++) {
      const a = z1 - f(Math.abs(s1 - xs[k]), p)
      const b = z2 - f(Math.abs(s2 - xs[k]), p)
      const ll = -(a * a + b * b) / (2 * sig * sig)
      if (k < lo + m && ll > b1) b1 = ll
      if (k >= hi - m && ll > b2) b2 = ll
    }
    if (b1 > b2 || (b1 === b2 && z1 >= z2)) hi = lo + m
    else lo = hi - m
    if (failStep < 0 && (target < lo || target >= hi)) failStep = t
    t++
  }
  return { error: target < lo || target >= hi, steps: t, finalSize: hi - lo, failStep }
}
