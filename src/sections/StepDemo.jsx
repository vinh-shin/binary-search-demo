import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_PARAMS, Q, gridPoint, hVec, inRect, makeRng, runStep } from '../lib/model'
import { Button, C, Card, Select, Slider, TeX, Toggle, fmtP } from '../components/ui'
import { THEORY } from '../theory'

// Giá trị cực nhỏ (ví dụ 1e-27) chỉ là nhiễu số học, không có ý nghĩa thực tế
const fmtTiny = (x) => (x > 0 && x < 1e-9 ? '< 10⁻⁹' : fmtP(x))

const PHASES = [
  { line: 3, name: 'Phân hoạch', desc: 'Chia vùng hiện tại thành H₁, H₂ chồng lấn theo chiều dài nhất (Eq. 2–3).' },
  { line: 4, name: 'Đo', desc: 'Kích hoạt 2 cảm biến đối xứng, thu z = h(l_T) + nhiễu.' },
  { line: 5, name: 'Likelihood', desc: 'Tính ℓ(k) cho mọi điểm k còn lại (Eq. 4).' },
  { line: 6, name: 'Chọn vùng', desc: 'Giữ nửa có max ℓ lớn hơn (Eq. 5).' },
]

const ALGO = [
  'Inputs: H⁰, α, β, f(·)',
  'for t ← 1, …, β do',
  '  Chia H^{t−1} thành {H₁ᵗ, H₂ᵗ} chồng lấn  (2)',
  '  Kích hoạt Sᵗ, thu phép đo zᵗ',
  '  Tính ℓ(k) ∀k ∈ H^{t−1}  (4)',
  '  Hᵗ ← argmax_i { max_{k∈Hᵢ} ℓ(k) }',
  'end for',
  'Output: H^β',
]

function simulate({ grid, alpha, p, mode, target, seed, stopSize }) {
  const rng = makeRng(seed)
  let state = { x0: 0, x1: grid.nx, y0: 0, y1: grid.ny }
  const steps = []
  const size = (s) => (s.x1 - s.x0) * (s.y1 - s.y0)
  while (size(state) > stopSize && steps.length < 80) {
    const r = runStep(state, grid, alpha, p, mode, target, rng)
    if (!r) break
    // P_e^t lý thuyết (Theorem 1) cho bước này, với prior đều trên H^{t-1}
    let sum = 0
    for (let i = state.x0; i < state.x1; i++)
      for (let j = state.y0; j < state.y1; j++) {
        if (inRect(i, j, r.part.H1) && !inRect(i, j, r.part.H2)) {
          const h = hVec(gridPoint(i, j, grid), r.sensors, p)
          sum += Q(Math.abs(h[0] - h[1]) / Math.SQRT2 / p.sigma)
        }
      }
    r.peTheory = (2 / size(state)) * sum
    r.before = state
    steps.push(r)
    state = r.next
  }
  return { steps, final: state }
}

function Viz1D({ grid, step, phase, history, target, onPickTarget, finalState }) {
  const W = 760
  const Hh = 250
  const pad = 30
  const X = (x) => pad + (x / grid.Lx) * (W - 2 * pad)
  const dX = grid.Lx / grid.nx
  const st = step ? step.before : finalState
  const xs = Array.from({ length: grid.nx }, (_, i) => (i + 0.5) * dX)
  const axisY = 60
  const lik = step && phase >= 2 ? step.lik : null
  const maxLL = lik ? Math.max(...lik.map((l) => l.ll)) : 0
  const clip = 12
  const svgRef = useRef(null)
  const click = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const v = ((x - pad) / (W - 2 * pad)) * grid.Lx
    onPickTarget([Math.max(0, Math.min(grid.nx - 1, Math.floor(v / dX))), 0])
  }
  const rect = (s, y, h, color, op) => (
    <rect x={X(s.x0 * dX)} y={y} width={X(s.x1 * dX) - X(s.x0 * dX)} height={h} fill={color} fillOpacity={op} />
  )
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${Hh}`} className="w-full cursor-crosshair select-none" onClick={click}>
      {/* lịch sử các vùng đã thu hẹp */}
      {history.map((s, k) => (
        <rect
          key={k}
          x={X(s.before.x0 * dX)}
          y={8 + k * 2}
          width={X(s.before.x1 * dX) - X(s.before.x0 * dX)}
          height={1.5}
          fill="#94a3b8"
        />
      ))}
      {/* vùng hiện tại */}
      {rect(st, axisY - 14, 28, '#e2e8f0', 0.8)}
      {step && phase >= 0 && (
        <>
          {rect(step.part.H1, axisY - 34, 10, C.h1, phase >= 3 && step.choice !== 1 ? 0.2 : 0.75)}
          {rect(step.part.H2, axisY - 22, 10, C.h2, phase >= 3 && step.choice !== 2 ? 0.2 : 0.75)}
          {step.part.H1.x1 > step.part.H2.x0 &&
            rect({ x0: step.part.H2.x0, x1: step.part.H1.x1 }, axisY - 14, 28, C.both, 0.18)}
          <text x={X(step.part.H1.x0 * dX)} y={axisY - 37} fontSize="10" fill={C.h1}>
            H₁
          </text>
          <text x={X(step.part.H2.x1 * dX) - 14} y={axisY - 25} fontSize="10" fill={C.h2}>
            H₂
          </text>
        </>
      )}
      <line x1={pad} x2={W - pad} y1={axisY} y2={axisY} stroke="#64748b" />
      {xs.map((x, i) => {
        const alive = i >= st.x0 && i < st.x1
        return <circle key={i} cx={X(x)} cy={axisY} r={grid.nx > 64 ? 1.5 : 2.5} fill={alive ? '#334155' : '#cbd5e1'} />
      })}
      {/* mục tiêu */}
      <g transform={`translate(${X(xs[target[0]])},${axisY})`}>
        <circle r="6" fill="none" stroke={C.target} strokeWidth="2" />
        <text y="22" textAnchor="middle" fontSize="11" fill={C.target} fontWeight="700">
          l_T
        </text>
      </g>
      {/* cảm biến */}
      {step &&
        phase >= 1 &&
        step.sensors.map((s, k) => (
          <g key={k} transform={`translate(${X(s[0])},${axisY + 30})`}>
            <path d="M0,-8 L7,5 L-7,5 Z" fill={C.sensor} />
            <text y="18" textAnchor="middle" fontSize="11">
              s{k + 1}
            </text>
          </g>
        ))}
      {/* likelihood */}
      {lik && (
        <g>
          <text x={pad} y={130} fontSize="11" fill="#475569">
            ℓ(k) − max ℓ (cắt tại −{clip})
          </text>
          {lik.map((l) => {
            const v = Math.max(-clip, l.ll - maxLL)
            const h = ((v + clip) / clip) * 90
            const in1 = inRect(l.i, l.j, step.part.H1)
            const in2 = inRect(l.i, l.j, step.part.H2)
            const color = in1 && in2 ? C.both : in1 ? C.h1 : C.h2
            const bw = Math.max(1, ((W - 2 * pad) / grid.nx) * 0.8)
            return <rect key={l.i} x={X(xs[l.i]) - bw / 2} y={235 - h} width={bw} height={h} fill={color} opacity={0.8} />
          })}
          {phase >= 3 &&
            [
              [step.arg1, C.h1, 'max H₁'],
              [step.arg2, C.h2, 'max H₂'],
            ].map(([a, col, t], k) => (
              <g key={k} transform={`translate(${X(xs[a[0]])},${140 + k * 12})`}>
                <text textAnchor="middle" fontSize="10" fill={col} fontWeight="700">
                  ▼ {t}
                </text>
              </g>
            ))}
          <line x1={pad} x2={W - pad} y1={235} y2={235} stroke="#94a3b8" />
        </g>
      )}
    </svg>
  )
}

function Viz2D({ grid, step, phase, history, target, onPickTarget, finalState }) {
  const S = 460
  const pad = 10
  const dX = grid.Lx / grid.nx
  const dY = grid.Ly / grid.ny
  const X = (x) => pad + (x / grid.Lx) * (S - 2 * pad)
  const Y = (y) => S - pad - (y / grid.Ly) * (S - 2 * pad)
  const st = step ? step.before : finalState
  const lik = step && phase >= 2 ? step.lik : null
  // Tô màu theo tỉ lệ likelihood exp(ℓ − max ℓ) ∈ (0, 1], tức posterior tương đối khi prior đều.
  const maxLL = lik ? Math.max(...lik.map((l) => l.ll)) : 0
  const llMap = useMemo(() => {
    const m = new Map()
    lik?.forEach((l) => m.set(l.i * 10000 + l.j, l.ll))
    return m
  }, [lik])
  const svgRef = useRef(null)
  const click = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * S
    const py = ((e.clientY - r.top) / r.height) * S
    const x = ((px - pad) / (S - 2 * pad)) * grid.Lx
    const y = ((S - pad - py) / (S - 2 * pad)) * grid.Ly
    onPickTarget([
      Math.max(0, Math.min(grid.nx - 1, Math.floor(x / dX))),
      Math.max(0, Math.min(grid.ny - 1, Math.floor(y / dY))),
    ])
  }
  const R = (s, props) => (
    <rect x={X(s.x0 * dX)} y={Y(s.y1 * dY)} width={X(s.x1 * dX) - X(s.x0 * dX)} height={Y(s.y0 * dY) - Y(s.y1 * dY)} {...props} />
  )
  const r = grid.nx > 24 ? 2 : 3
  return (
    <svg ref={svgRef} viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[460px] cursor-crosshair select-none" onClick={click}>
      <rect x="0" y="0" width={S} height={S} fill="#f8fafc" />
      {history.map((h, k) => R(h.before, { key: k, fill: 'none', stroke: '#cbd5e1', strokeDasharray: '3 3' }))}
      {R(st, { fill: '#e2e8f0', fillOpacity: 0.6, stroke: '#64748b' })}
      {step && (
        <>
          {R(step.part.H1, {
            fill: C.h1,
            fillOpacity: phase >= 3 && step.choice !== 1 ? 0.03 : 0.1,
            stroke: C.h1,
            strokeWidth: 2,
          })}
          {R(step.part.H2, {
            fill: C.h2,
            fillOpacity: phase >= 3 && step.choice !== 2 ? 0.03 : 0.1,
            stroke: C.h2,
            strokeWidth: 2,
            strokeDasharray: '6 3',
          })}
          {/* vùng giao H1 ∩ H2 */}
          {R(
            {
              x0: Math.max(step.part.H1.x0, step.part.H2.x0),
              x1: Math.min(step.part.H1.x1, step.part.H2.x1),
              y0: Math.max(step.part.H1.y0, step.part.H2.y0),
              y1: Math.min(step.part.H1.y1, step.part.H2.y1),
            },
            { fill: C.both, fillOpacity: 0.18, stroke: 'none' },
          )}
        </>
      )}
      {Array.from({ length: grid.nx }, (_, i) =>
        Array.from({ length: grid.ny }, (_, j) => {
          const [x, y] = gridPoint(i, j, grid)
          const alive = inRect(i, j, st)
          let fill = alive ? '#475569' : '#e2e8f0'
          let rad = r
          if (lik && alive) {
            // đậm và to = likelihood cao (thang xám, tránh trùng màu đỏ của mục tiêu)
            const t = Math.exp(llMap.get(i * 10000 + j) - maxLL)
            const g = Math.round(215 - 200 * t)
            fill = `rgb(${g},${g},${g + 10})`
            rad = r * (0.6 + 0.9 * t)
          }
          return <circle key={`${i}-${j}`} cx={X(x)} cy={Y(y)} r={rad} fill={fill} />
        }),
      )}
      {/* điểm có ℓ lớn nhất trong mỗi nửa */}
      {step &&
        phase >= 3 &&
        [
          [step.arg1, C.h1],
          [step.arg2, C.h2],
        ].map(([a, col], k) => {
          const [x, y] = gridPoint(a[0], a[1], grid)
          return <circle key={k} cx={X(x)} cy={Y(y)} r={r + 6} fill="none" stroke={col} strokeWidth="3" />
        })}
      {step &&
        phase >= 1 &&
        step.sensors.map((s, k) => (
          <g key={k} transform={`translate(${X(s[0])},${Y(s[1])})`}>
            <path d="M0,-9 L8,6 L-8,6 Z" fill={C.sensor} stroke="white" />
            <text y="-12" textAnchor="middle" fontSize="11" fontWeight="700">
              s{k + 1}
            </text>
          </g>
        ))}
      {(() => {
        const [x, y] = gridPoint(target[0], target[1], grid)
        return (
          <g transform={`translate(${X(x)},${Y(y)})`}>
            <circle r="7" fill="none" stroke={C.target} strokeWidth="2.5" />
            <circle r="2" fill={C.target} />
          </g>
        )
      })()}
    </svg>
  )
}

export default function StepDemo() {
  const [dimMode, setDimMode] = useState('1d')
  const [n1, setN1] = useState(32)
  const [n2, setN2] = useState(16)
  const [alpha, setAlpha] = useState(0.15)
  const [sigma, setSigma] = useState(1 / Math.SQRT2) // Bảng I
  const [mode, setMode] = useState('exclusive')
  const [seed, setSeed] = useState(7)
  const [stop1, setStop1] = useState(1)
  const [stop2, setStop2] = useState(4)
  // Mục tiêu riêng cho từng chế độ (điểm 1D [11, 0] nằm sát mép dưới khi sang 2D)
  const [targets, setTargets] = useState({ '1d': [11, 0], '2d': [12, 6] })
  const target = targets[dimMode]
  const setTarget = (t) => setTargets((s) => ({ ...s, [dimMode]: t }))
  const [cursor, setCursor] = useState({ step: 0, phase: -1 })
  const [playing, setPlaying] = useState(false)

  const grid = useMemo(
    () => (dimMode === '1d' ? { nx: n1, ny: 1, Lx: 500, Ly: 1 } : { nx: n2, ny: n2, Lx: 500, Ly: 500 }),
    [dimMode, n1, n2],
  )
  const tgt = [Math.min(target[0], grid.nx - 1), Math.min(target[1], grid.ny - 1)]
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const stopSize = dimMode === '1d' ? stop1 : stop2
  const sim = useMemo(
    () => simulate({ grid, alpha, p, mode, target: tgt, seed, stopSize }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, alpha, p, mode, tgt[0], tgt[1], seed, stopSize],
  )

  useEffect(() => setCursor({ step: 0, phase: -1 }), [sim])

  const total = sim.steps.length
  const finished = cursor.step >= total
  const step = finished ? null : sim.steps[cursor.step]
  const history = sim.steps.slice(0, Math.min(cursor.step, total))

  const advance = (full = false) =>
    setCursor((c) => {
      if (c.step >= total) return c
      if (full || c.phase >= 3) return { step: c.step + 1, phase: -1 }
      return { step: c.step, phase: c.phase + 1 }
    })
  const back = () =>
    setCursor((c) => {
      if (c.phase > -1 && c.step < total) return { ...c, phase: c.phase - 1 }
      if (c.step === 0) return c
      return { step: c.step - 1, phase: 3 }
    })

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => advance(), 650)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, total])
  useEffect(() => {
    if (finished) setPlaying(false)
  }, [finished])

  const shownStep = step && cursor.phase >= 0 ? step : null
  const phase = cursor.phase
  const finalOk = inRect(tgt[0], tgt[1], sim.final)
  const firstFail = sim.steps.findIndex((s) => !s.targetInside)
  const survival = sim.steps.reduce((acc, s) => acc * (1 - s.peTheory), 1)

  const pickTarget = (t) => setTarget(t)
  const Viz = dimMode === '1d' ? Viz1D : Viz2D

  return (
    <Card title="Demo 2 · Chạy Algorithm 1 từng bước" info={THEORY.demo2}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Toggle
          value={dimMode}
          onChange={setDimMode}
          options={[
            { value: '1d', label: '1D (đoạn thẳng)' },
            { value: '2d', label: '2D (mặt phẳng)' },
          ]}
        />
        <span className="text-xs text-slate-500">Bấm vào hình để đặt vị trí mục tiêu.</span>
      </div>
      <div className="grid grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-6 gap-4 mb-5">
        {dimMode === '1d' ? (
          <Slider label="Số điểm lưới n" value={n1} min={8} max={128} step={8} onChange={setN1} />
        ) : (
          <Slider label="Lưới n × n" value={n2} min={6} max={32} step={2} onChange={setN2} format={(v) => `${v}×${v}`} />
        )}
        <Slider label="Độ chồng lấn α" value={alpha} min={0} max={0.24} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
        <Slider label="Nhiễu σ" value={sigma} min={0.02} max={1.5} step={0.02} onChange={setSigma} format={(v) => v.toFixed(2)} />
        {dimMode === '1d' ? (
          <Slider label="Dừng khi |H| ≤" value={stop1} min={1} max={16} step={1} onChange={setStop1} />
        ) : (
          <Slider label="Dừng khi |H| ≤" value={stop2} min={1} max={64} step={1} onChange={setStop2} />
        )}
        <Select
          label="Vị trí cảm biến"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'exclusive', label: 's = (L/2)(½ − α) (mục V, Fig. 5)' },
            { value: 'quarter', label: 'L/4, 3L/4 (Bảng I, Fig. 2)' },
          ]}
        />
        <div className="text-sm">
          <div className="text-slate-600 mb-1">Nhiễu ngẫu nhiên</div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSeed((s) => s + 1)}>
              🎲 Đo lại
            </Button>
            <Button
              variant="secondary"
              onClick={() => setTarget([Math.floor(Math.random() * grid.nx), Math.floor(Math.random() * grid.ny)])}
            >
              🎯
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Button variant="secondary" onClick={() => setCursor({ step: 0, phase: -1 })}>
          ⏮ Reset
        </Button>
        <Button variant="secondary" onClick={back}>
          ◀ Lùi
        </Button>
        <Button onClick={() => advance()} disabled={finished}>
          Pha tiếp ▶
        </Button>
        <Button variant="secondary" onClick={() => advance(true)} disabled={finished}>
          Bước tiếp ⏭
        </Button>
        <Button variant="secondary" onClick={() => setPlaying((v) => !v)} disabled={finished}>
          {playing ? '⏸ Dừng' : '▶ Tự chạy'}
        </Button>
        <Button variant="secondary" onClick={() => setCursor({ step: total, phase: -1 })}>
          Chạy hết ⏩
        </Button>
        <div className="text-sm text-slate-600 ml-2">
          Bước <b>{Math.min(cursor.step + 1, total)}</b>/{total}
          {step && phase >= 0 && (
            <>
              {' '}
              · pha <b>{PHASES[phase].name}</b>
            </>
          )}
        </div>
      </div>

      <div className="grid @4xl:grid-cols-[1fr_300px] gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-2 flex justify-center">
          <Viz
            grid={grid}
            step={shownStep}
            phase={phase}
            history={history}
            target={tgt}
            onPickTarget={pickTarget}
            finalState={step ? step.before : sim.final}
          />
        </div>
        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs leading-6">
            {ALGO.map((l, i) => {
              const active = step && phase >= 0 && PHASES[phase].line === i + 1
              return (
                <div key={i} className={`px-1 rounded ${active ? 'bg-indigo-500 text-white' : ''}`}>
                  <span className="text-slate-500 mr-2">{i + 1}</span>
                  {l}
                </div>
              )
            })}
          </div>
          <PhaseInfo
            step={step}
            idx={cursor.step}
            phase={phase}
            p={p}
            finished={finished}
            finalOk={finalOk}
            final={sim.final}
            lostAt={firstFail >= 0 && cursor.step > firstFail ? firstFail + 1 : null}
          />
        </div>
      </div>

      <Legend />
      {dimMode === '2d' && (
        <p className="text-xs text-slate-500 mt-2">
          Ở pha Likelihood, chấm càng đậm và to thì giả thuyết càng giống phép đo; vòng xanh và cam là điểm tốt nhất
          của H₁ và H₂.
        </p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-1 pr-3">t</th>
              <th className="pr-3">Chiều cắt</th>
              <th className="pr-3">|H^(t−1)|</th>
              <th className="pr-3">n theo chiều cắt → mỗi nửa</th>
              <th className="pr-3">z = (z₁, z₂)</th>
              <th className="pr-3">Chọn</th>
              <th className="pr-3">l_T còn trong vùng?</th>
              <th className="pr-3">P_e^t lý thuyết</th>
            </tr>
          </thead>
          <tbody>
            {sim.steps.map((s, k) => {
              const nBefore = (s.before.x1 - s.before.x0) * (s.before.y1 - s.before.y0)
              const visible = k < cursor.step || (k === cursor.step && phase >= 3)
              return (
                <tr
                  key={k}
                  className={`border-b border-slate-100 ${k === cursor.step && !finished ? 'bg-indigo-50' : ''} ${
                    visible ? '' : 'opacity-30'
                  }`}
                >
                  <td className="py-1 pr-3 font-mono">{k + 1}</td>
                  <td className="pr-3">{s.part.dim}</td>
                  <td className="pr-3 font-mono">{nBefore}</td>
                  <td className="pr-3 font-mono">
                    {s.part.n} → {s.part.m}
                  </td>
                  <td className="pr-3 font-mono">{visible ? `(${s.z[0].toFixed(3)}, ${s.z[1].toFixed(3)})` : '…'}</td>
                  <td className="pr-3 font-semibold" style={{ color: s.choice === 1 ? C.h1 : C.h2 }}>
                    {visible ? `H${s.choice}` : '…'}
                  </td>
                  <td className="pr-3">
                    {!visible
                      ? '…'
                      : firstFail >= 0 && k > firstFail
                        ? `— (đã mất ở bước ${firstFail + 1})`
                        : s.targetInside
                          ? '✅'
                          : '❌ lỗi'}
                  </td>
                  <td className="pr-3 font-mono">{fmtTiny(s.peTheory)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="text-sm text-slate-600 mt-3">
          Theo Eq. (1), xác suất lỗi tổng lý thuyết của lần chạy này là{' '}
          <TeX>{`P_e = 1-\\prod_t (1-P_e^t) = ${fmtTiny(1 - survival)}`}</TeX>, với độ sâu β = {total}.{' '}
          {firstFail >= 0 && (
            <span className="text-rose-700">
              Lần chạy này mất mục tiêu ở bước {firstFail + 1}, và các bước sau đều không thể sửa lại.
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

function PhaseInfo({ step, idx, phase, p, finished, finalOk, final, lostAt }) {
  if (finished || !step) {
    const size = (final.x1 - final.x0) * (final.y1 - final.y0)
    return (
      <div className={`rounded-lg p-3 text-sm ${finalOk ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
        <div className="font-semibold mb-1">{finalOk ? 'Kết thúc: thành công ✅' : 'Kết thúc: thất bại ❌'}</div>
        Đầu ra là H<sup>β</sup> gồm {size} điểm.{' '}
        {finalOk ? 'Mục tiêu nằm trong vùng đầu ra.' : 'Mục tiêu đã bị loại ở một bước trước đó.'}
      </div>
    )
  }
  if (phase < 0)
    return (
      <div className="rounded-lg p-3 text-sm bg-slate-100">
        Sẵn sàng cho bước <b>t = {idx + 1}</b>. Bấm <i>Pha tiếp</i> để xem từng thao tác của bước này, hoặc{' '}
        <i>Bước tiếp</i> để làm trọn cả bước.
      </div>
    )
  const ph = PHASES[phase]
  return (
    <div className="rounded-lg p-3 text-sm bg-indigo-50 text-indigo-950 space-y-2">
      <div className="font-semibold">
        Pha {phase + 1}/4 · {ph.name}
      </div>
      <div>{ph.desc}</div>
      {phase === 0 &&
        (() => {
          const { n, m, dim, alphaEff } = step.part
          const ov = Math.max(0, 2 * m - n)
          const other = dim === 'x' ? step.before.y1 - step.before.y0 : step.before.x1 - step.before.x0
          // 1D: other = 1 → đếm điểm; 2D: đếm theo cột/hàng rồi nhân với chiều còn lại
          const unit = other === 1 ? 'điểm' : dim === 'x' ? 'cột' : 'hàng'
          const tot = (k) => (other === 1 ? '' : ` (${k * other} điểm)`)
          return (
            <div className="text-xs">
              Cắt theo chiều {dim}: n = {n} {unit} → mỗi nửa {m} {unit}
              {tot(m)}, vùng giao {ov} {unit}
              {tot(ov)}. α hiệu dụng = {alphaEff.toFixed(3)}.
            </div>
          )
        })()}
      {phase === 1 && (
        <div className="text-xs space-y-1">
          <div>
            Giá trị không nhiễu tại mục tiêu: h(l_T) = ({step.hT[0].toFixed(3)}, {step.hT[1].toFixed(3)})
          </div>
          <div>
            Phép đo: z = ({step.z[0].toFixed(3)}, {step.z[1].toFixed(3)}), với σ = {p.sigma.toFixed(2)}
          </div>
        </div>
      )}
      {phase === 2 && (
        <div className="text-xs">
          <TeX>{`\\ell(k) = -\\tfrac{1}{2\\sigma^2}\\lVert z - h_k\\rVert^2 + \\text{const}`}</TeX>. Điểm càng sáng hoặc
          cột càng cao thì càng "giống" phép đo.
        </div>
      )}
      {phase === 3 && (
        <div className="text-xs space-y-1">
          <div>
            max ℓ trên H₁ = <span className="font-mono">{step.best1.toFixed(2)}</span>, trên H₂ ={' '}
            <span className="font-mono">{step.best2.toFixed(2)}</span>
          </div>
          <div>
            → chọn <b style={{ color: step.choice === 1 ? C.h1 : C.h2 }}>H{step.choice}</b>.{' '}
            {lostAt
              ? `Mục tiêu đã mất từ bước ${lostAt}, nên bước này không còn ảnh hưởng tới kết quả.`
              : step.targetInside
                ? 'Mục tiêu vẫn còn trong vùng ✅'
                : 'Mục tiêu bị loại ở bước này ❌'}
          </div>
          <div>
            P<sub>e</sub><sup>t</sup> lý thuyết của bước này: <b>{fmtTiny(step.peTheory)}</b>
          </div>
        </div>
      )}
    </div>
  )
}

function Legend() {
  const items = [
    [C.h1, 'H₁'],
    [C.h2, 'H₂'],
    [C.both, 'Vùng giao H₁∩H₂'],
    [C.target, 'Mục tiêu l_T'],
    [C.sensor, 'Cảm biến (▲)'],
  ]
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-3">
      {items.map(([c, t]) => (
        <span key={t} className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} /> {t}
        </span>
      ))}
    </div>
  )
}
