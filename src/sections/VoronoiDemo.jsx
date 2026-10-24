import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_PARAMS, Q, f, makeRng, nextSize } from '../lib/model'
import { C, Card, Slider, TeX, fmtP } from '../components/ui'
import { THEORY } from '../theory'

const L = 500
const SIZE = 440
// Hai cảm biến cố định tại L/4 và 3L/4, như ví dụ trong báo cáo
const SENSORS = [L / 4, (3 * L) / 4]

export default function VoronoiDemo() {
  const [n, setN] = useState(16)
  const [alpha, setAlpha] = useState(0.15)
  const [sigma, setSigma] = useState(1 / Math.SQRT2) // Bảng I
  const [sel, setSel] = useState(2)
  const canvasRef = useRef(null)
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])

  const m = nextSize(n, alpha)
  const delta = L / n
  const xs = useMemo(() => Array.from({ length: n }, (_, i) => (i + 0.5) * delta), [n, delta])
  const sensors = SENSORS

  const group = (k) => (k < n - m ? 1 : k >= m ? 2 : 0) // 0 = vùng giao
  const hs = useMemo(
    () => xs.map((x) => [f(Math.abs(sensors[0] - x), p), f(Math.abs(sensors[1] - x), p)]),
    [xs, sensors, p],
  )

  // Quy tắc quyết định ML = láng giềng gần nhất trong không gian đo (Lemma 1)
  const decide = (z1, z2) => {
    let best = Infinity
    let arg = 0
    for (let k = 0; k < hs.length; k++) {
      const d = (z1 - hs[k][0]) ** 2 + (z2 - hs[k][1]) ** 2
      if (d < best) {
        best = d
        arg = k
      }
    }
    const g = group(arg)
    return { region: g === 0 ? (z1 >= z2 ? 1 : 2) : g, nearest: arg }
  }
  const correct = (k, region) => (region === 1 ? k < m : k >= n - m)

  // phạm vi trục
  const all = hs.flat()
  const lo = Math.min(...all) - 2.5 * sigma
  const hi = Math.max(...all) + 2.5 * sigma
  const toPx = (v) => ((v - lo) / (hi - lo)) * SIZE
  const toPy = (v) => SIZE - ((v - lo) / (hi - lo)) * SIZE

  // Vẽ nền: miền quyết định (màu) + biên các ô Voronoi (vạch trắng)
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const R = 440 // khớp kích thước hiển thị để biên sắc nét
    const img = ctx.createImageData(R, R)
    const col = { 1: [37, 99, 235], 2: [234, 88, 12], 0: [124, 58, 237] }
    // chỉ số giả thuyết gần nhất của từng pixel, để so với pixel bên trái và phía trên
    const near = new Int16Array(R * R)
    for (let py = 0; py < R; py++)
      for (let px = 0; px < R; px++) {
        const z1 = lo + ((px + 0.5) / R) * (hi - lo)
        const z2 = hi - ((py + 0.5) / R) * (hi - lo)
        const d = decide(z1, z2)
        const i = py * R + px
        near[i] = d.nearest
        const g = group(d.nearest)
        const c = g === 0 ? col[0] : col[d.region]
        const o = i * 4
        // biên ô Voronoi: giả thuyết gần nhất khác với pixel bên trái hoặc phía trên
        const edge = (px > 0 && near[i - 1] !== d.nearest) || (py > 0 && near[i - R] !== d.nearest)
        img.data[o] = edge ? 255 : c[0]
        img.data[o + 1] = edge ? 255 : c[1]
        img.data[o + 2] = edge ? 255 : c[2]
        img.data[o + 3] = edge ? 200 : g === 0 ? 55 : 38
      }
    ctx.putImageData(img, 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hs, lo, hi, m, n])

  const k = Math.min(sel, n - 1)
  const cloud = useMemo(() => {
    const rng = makeRng(99 + k)
    return Array.from({ length: 350 }, () => {
      const z1 = hs[k][0] + sigma * rng.normal()
      const z2 = hs[k][1] + sigma * rng.normal()
      return { z1, z2, ok: correct(k, decide(z1, z2).region) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hs, k, sigma, m])

  const dks = hs.map((h) => Math.abs(h[0] - h[1]) / Math.SQRT2)
  const theoryPe = (2 / n) * dks.slice(0, n - m).reduce((s, d) => s + Q(d / sigma), 0)
  const foot = ((hs[k][0] + hs[k][1]) / 2)

  return (
    <Card title="Demo 3 · Không gian đo, ô Voronoi và Theorem 1" info={THEORY.demo3}>
      <div className="grid grid-cols-2 @3xl:grid-cols-5 gap-4 mb-4">
        <Slider label="Số giả thuyết n" value={n} min={6} max={40} step={2} onChange={setN} />
        <Slider label="α" value={alpha} min={0} max={0.24} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
        <Slider label="σ" value={sigma} min={0.05} max={1.5} step={0.01} onChange={setSigma} format={(v) => v.toFixed(3)} />
          <div className="text-xs text-slate-500">
            s₁ = {sensors[0].toFixed(1)}, s₂ = {sensors[1].toFixed(1)}
            <br />
            (L = {L}, đối xứng quanh {L / 2})
          </div>
      </div>

      <div className="grid @4xl:grid-cols-[460px_1fr] gap-6">
        <div className="w-full max-w-[460px] mx-auto">
          {/* trục số 1D */}
          <svg viewBox={`0 0 ${SIZE} 46`} className="w-full mb-1">
            <line x1="10" x2={SIZE - 10} y1="20" y2="20" stroke="#94a3b8" />
            {xs.map((x, i) => {
              const g = group(i)
              return (
                <circle
                  key={i}
                  cx={10 + (x / L) * (SIZE - 20)}
                  cy="20"
                  r={i === k ? 6 : 4}
                  fill={g === 1 ? C.h1 : g === 2 ? C.h2 : C.both}
                  stroke={i === k ? '#000' : 'none'}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => setSel(i)}
                />
              )
            })}
            {sensors.map((s, i) => (
              <g key={i} transform={`translate(${10 + (s / L) * (SIZE - 20)},36)`}>
                <path d="M0,-7 L6,4 L-6,4 Z" fill={C.sensor} />
                <text x="9" y="4" fontSize="10">
                  s{i + 1}
                </text>
              </g>
            ))}
          </svg>
          <div className="relative" style={{ width: '100%', aspectRatio: '1' }}>
            <canvas
              ref={canvasRef}
              width={440}
              height={440}
              className="absolute inset-0 w-full h-full rounded border border-slate-200"
              style={{ imageRendering: 'pixelated' }}
            />
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 w-full h-full">
              {/* đường chéo z1 = z2 */}
              <line x1={toPx(lo)} y1={toPy(lo)} x2={toPx(hi)} y2={toPy(hi)} stroke="#dc2626" strokeDasharray="6 4" strokeWidth="1.5" />
              {cloud.map((c, i) => (
                <circle key={i} cx={toPx(c.z1)} cy={toPy(c.z2)} r="1.8" fill={c.ok ? '#059669' : '#dc2626'} opacity="0.7" />
              ))}
              <>
                  <line
                    x1={toPx(hs[k][0])}
                    y1={toPy(hs[k][1])}
                    x2={toPx(foot)}
                    y2={toPy(foot)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text x={(toPx(hs[k][0]) + toPx(foot)) / 2 + 6} y={(toPy(hs[k][1]) + toPy(foot)) / 2} fontSize="12" fontWeight="700">
                    d_k
                  </text>
              </>
              {hs.map((h, i) => {
                const g = group(i)
                return (
                  <circle
                    key={i}
                    cx={toPx(h[0])}
                    cy={toPy(h[1])}
                    r={i === k ? 6.5 : 4.5}
                    fill={g === 1 ? C.h1 : g === 2 ? C.h2 : C.both}
                    stroke={i === k ? '#000' : 'white'}
                    strokeWidth={i === k ? 2.5 : 1}
                    className="cursor-pointer"
                    onClick={() => setSel(i)}
                  />
                )
              })}
              <text x="8" y="16" fontSize="12" fill="#334155">
                z₂
              </text>
              <text x={SIZE - 20} y={SIZE - 8} fontSize="12" fill="#334155">
                z₁
              </text>
            </svg>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Bấm vào một chấm (hoặc một điểm trên trục 1D) để chọn giả thuyết k. Đám mây là 350 phép đo minh họa{' '}
            <TeX>{'z = h_k + \\eta'}</TeX> của giả thuyết đó: chấm xanh là quyết định đúng, chấm đỏ là lỗi.
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Giả thuyết được chọn" value={`k = ${k + 1}`} sub={['vùng giao', 'chỉ H₁', 'chỉ H₂'][group(k)]} />
            <Stat
              label="Q(d_k/σ) (Theorem 1)"
              value={group(k) === 0 ? '0' : fmtP(Q(dks[k] / sigma))}
              sub={`d_k = ${dks[k].toFixed(4)}`}
            />
            <Stat
              label="P_e^t theo Theorem 1"
              value={fmtP(theoryPe)}
              sub={<TeX>{'\\frac{2}{n}\\sum_{k\\in H_1\\setminus H_2} Q(d_k/\\sigma)'}</TeX>}
            />
          </div>
          <div className="max-h-64 overflow-auto border border-slate-200 rounded">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left">
                  <th className="p-1.5">k</th>
                  <th>vị trí</th>
                  <th>nhóm</th>
                  <th>h_k</th>
                  <th>d_k</th>
                  <th>Q(d_k/σ)</th>
                </tr>
              </thead>
              <tbody>
                {hs.map((h, i) => {
                  const g = group(i)
                  return (
                    <tr
                      key={i}
                      onClick={() => setSel(i)}
                      className={`cursor-pointer border-t border-slate-100 ${i === k ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="p-1.5 font-mono">{i + 1}</td>
                      <td className="font-mono">{xs[i].toFixed(1)}</td>
                      <td style={{ color: g === 1 ? C.h1 : g === 2 ? C.h2 : C.both }}>
                        {['H₁∩H₂', 'H₁\\H₂', 'H₂\\H₁'][g]}
                      </td>
                      <td className="font-mono">
                        ({h[0].toFixed(3)}, {h[1].toFixed(3)})
                      </td>
                      <td className="font-mono">{dks[i].toFixed(4)}</td>
                      <td className="font-mono">{g === 0 ? '0' : fmtP(Q(dks[i] / sigma))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold font-mono text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  )
}
