// Ví dụ số và hình SVG tĩnh cho trang "Đọc hiểu bài báo".
// Mọi con số đều tính từ lib/model.js (cùng mô hình Eq. 9, tham số Bảng I) để khớp với các demo.
import { C } from '../components/ui'
import { DEFAULT_PARAMS, f, nextSize, Q } from '../lib/model'

// ---------- Ví dụ chạy xuyên suốt: 1D, n = 8, L = 500, cảm biến L/4 và 3L/4, σ = 1/√2 ----------
const L = 500
const N = 8
const P = DEFAULT_PARAMS
const S = [L / 4, (3 * L) / 4]
const XS = [...Array(N)].map((_, i) => ((2 * i + 1) * L) / (2 * N))
const H = XS.map((x) => S.map((s) => f(Math.abs(s - x), P)))
// Điểm đối xứng của điểm i (đếm từ 0) qua điểm giữa là N − 1 − i
const D = H.map((h, i) => Math.hypot(h[0] - H[N - 1 - i][0], h[1] - H[N - 1 - i][1]) / 2)
const QK = D.map((d) => Q(d / P.sigma))
const peDiscrete = (alpha) => {
  const m = nextSize(N, alpha)
  // H1 \ H2 gồm N − m điểm đầu
  return (2 / N) * QK.slice(0, N - m).reduce((a, b) => a + b, 0)
}

// Phép đo mẫu: mục tiêu ở điểm 4, nhiễu đẩy z về phía h_5
const TARGET = 3
const NOISE = [-0.25, 0.25]
const Z = [H[TARGET][0] + NOISE[0], H[TARGET][1] + NOISE[1]]
const DIST2 = H.map((h) => (Z[0] - h[0]) ** 2 + (Z[1] - h[1]) ** 2)
const BEST = DIST2.indexOf(Math.min(...DIST2))

export const EX = {
  L,
  N,
  P,
  S,
  XS,
  H,
  D,
  QK,
  pe0: peDiscrete(0),
  pe1: peDiscrete(0.1),
  m0: nextSize(N, 0),
  m1: nextSize(N, 0.1),
  target: TARGET,
  noise: NOISE,
  z: Z,
  dist2: DIST2,
  best: BEST,
}

export const fx = (x, d = 3) => x.toFixed(d).replace('.', ',')

// Chuỗi kích thước n^(0) → n^(1) → … theo Eq. (3)
export function sizeChain(n, alpha) {
  const out = [n]
  while (out.at(-1) > 1) out.push(nextSize(out.at(-1), alpha))
  return out
}

// ---------- Hình 1: đường đi trong cây, rời nhau và chồng lấn ----------
// Mỗi hàng là một bước: 8 ô, tô màu H1 / H2 / phần chung, viền đậm là tập được giữ lại.
export function Ladder({ alpha, target = TARGET }) {
  const rows = []
  let a = 0
  let b = N // [a, b)
  while (b - a > 1) {
    const n = b - a
    const m = nextSize(n, alpha)
    const h1 = [a, a + m]
    const h2 = [b - m, b]
    // Mục tiêu nằm trong phần chung thì nửa nào cũng đúng; hình chọn nửa có tâm gần mục tiêu hơn
    const in1 = target < h1[1]
    const in2 = target >= h2[0]
    const center = ([u, v]) => (u + v - 1) / 2
    const pick =
      in1 && in2 ? (Math.abs(target - center(h1)) <= Math.abs(target - center(h2)) ? h1 : h2) : in1 ? h1 : h2
    rows.push({ a, b, h1, h2, pick })
    ;[a, b] = pick
  }
  rows.push({ a, b, h1: null, h2: null, pick: [a, b] })
  const cw = 34
  const rh = 34
  const W = N * cw + 70
  return (
    <svg viewBox={`0 0 ${W} ${rows.length * rh + 8}`} className="w-full max-w-[380px]">
      {rows.map((r, t) => (
        <g key={t} transform={`translate(64 ${t * rh + 4})`}>
          <text x={-8} y={18} textAnchor="end" className="fill-slate-500 text-[11px]">
            {t === 0 ? 'H⁰' : `H${'¹²³⁴⁵⁶'[t - 1]}`} ({r.b - r.a})
          </text>
          {[...Array(N)].map((_, i) => {
            const inside = i >= r.a && i < r.b
            const i1 = r.h1 && i >= r.h1[0] && i < r.h1[1]
            const i2 = r.h2 && i >= r.h2[0] && i < r.h2[1]
            const fill = !inside ? '#f1f5f9' : i1 && i2 ? C.both : i1 ? C.h1 : i2 ? C.h2 : '#64748b'
            return (
              <g key={i}>
                <rect x={i * cw + 1} y={2} width={cw - 2} height={24} rx={4} fill={fill} opacity={inside ? 0.85 : 1} />
                <text x={i * cw + cw / 2} y={18} textAnchor="middle" className="text-[11px]" fill={inside ? '#fff' : '#cbd5e1'}>
                  {i + 1}
                </text>
                {i === target && <circle cx={i * cw + cw / 2} cy={30} r={2.5} fill={C.target} />}
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

export function Legend() {
  const items = [
    [C.h1, 'chỉ thuộc H₁'],
    [C.h2, 'chỉ thuộc H₂'],
    [C.both, 'thuộc cả hai (chồng lấn)'],
    [C.target, 'mục tiêu'],
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(([c, t]) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: c }} />
          {t}
        </span>
      ))}
    </div>
  )
}

// ---------- Hình 2: trục số 1D với 8 điểm lưới, 2 cảm biến, H1/H2 khi α = 0,1 ----------
export function NumberLine({ alpha = 0.1 }) {
  const W = 520
  const pad = 20
  const sx = (x) => pad + (x / L) * (W - 2 * pad)
  const m = nextSize(N, alpha)
  const bar = (i0, i1, y, color, label) => (
    <g>
      <rect x={sx(XS[i0]) - 10} y={y} width={sx(XS[i1]) - sx(XS[i0]) + 20} height={10} rx={5} fill={color} opacity={0.75} />
      <text x={sx(XS[i0]) - 14} y={y + 9} textAnchor="end" className="text-[11px]" fill={color}>
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full max-w-[560px]">
      <line x1={sx(0)} x2={sx(L)} y1={62} y2={62} stroke="#94a3b8" />
      {[0, L / 2, L].map((x) => (
        <g key={x}>
          <line x1={sx(x)} x2={sx(x)} y1={57} y2={67} stroke="#94a3b8" />
          <text x={sx(x)} y={82} textAnchor="middle" className="fill-slate-400 text-[10px]">
            {x}
          </text>
        </g>
      ))}
      {XS.map((x, i) => (
        <g key={i}>
          <circle cx={sx(x)} cy={62} r={5} fill={i === TARGET ? C.target : '#475569'} />
          <text x={sx(x)} y={50} textAnchor="middle" className="fill-slate-600 text-[11px]">
            {i + 1}
          </text>
        </g>
      ))}
      {S.map((s, j) => (
        <g key={j}>
          <path d={`M${sx(s)} 98 l-6 10 h12 z`} fill={C.sensor} />
          <text x={sx(s)} y={119} textAnchor="middle" className="fill-slate-700 text-[10px]">
            s{j + 1} = {s}
          </text>
        </g>
      ))}
      {bar(0, m - 1, 8, C.h1, 'H₁')}
      {bar(N - m, N - 1, 24, C.h2, 'H₂')}
    </svg>
  )
}

// ---------- Hình 3: không gian phép đo (z1, z2) với 8 vector h_k và ô Voronoi ----------
// Ô Voronoi tính bằng cách cắt hình chữ nhật bao theo từng nửa mặt phẳng (Sutherland–Hodgman).
const BOX = [-0.2, 2.9]
function clip(poly, a, b, c) {
  // giữ phần a·x + b·y ≥ c
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const fp = a * p[0] + b * p[1] - c
    const fq = a * q[0] + b * q[1] - c
    if (fp >= 0) out.push(p)
    if (fp * fq < 0) {
      const t = fp / (fp - fq)
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  }
  return out
}
function voronoiCell(i) {
  let poly = [
    [BOX[0], BOX[0]],
    [BOX[1], BOX[0]],
    [BOX[1], BOX[1]],
    [BOX[0], BOX[1]],
  ]
  const hi = H[i]
  H.forEach((hj, j) => {
    if (j === i) return
    // Phụ lục A: x·(h_k − h_k') ≥ ½(‖h_k‖² − ‖h_k'‖²)
    const a = hi[0] - hj[0]
    const b = hi[1] - hj[1]
    const c = 0.5 * (hi[0] ** 2 + hi[1] ** 2 - hj[0] ** 2 - hj[1] ** 2)
    poly = clip(poly, a, b, c)
  })
  return poly
}
const CELLS = H.map((_, i) => voronoiCell(i))

export function MeasureSpace({ alpha = 0.1, showZ = true, showCells = true, showD = null }) {
  const W = 360
  const pad = 34
  const sc = (v) => ((v - BOX[0]) / (BOX[1] - BOX[0])) * (W - 2 * pad)
  const X = (v) => pad + sc(v)
  const Y = (v) => W - pad - sc(v)
  const m = nextSize(N, alpha)
  const group = (i) => (i < N - m ? 'h1' : i >= m ? 'h2' : 'both')
  const col = { h1: C.h1, h2: C.h2, both: C.both }
  const ticks = [0, 1, 2]
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[380px]">
      <rect x={X(BOX[0])} y={Y(BOX[1])} width={sc(BOX[1])} height={sc(BOX[1])} fill="#fff" stroke="#e2e8f0" />
      {showCells &&
        CELLS.map((poly, i) => (
          <polygon
            key={i}
            points={poly.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')}
            fill={col[group(i)]}
            fillOpacity={0.1}
            stroke={col[group(i)]}
            strokeOpacity={0.5}
          />
        ))}
      <line x1={X(BOX[0])} y1={Y(BOX[0])} x2={X(BOX[1])} y2={Y(BOX[1])} stroke="#0f172a" strokeDasharray="5 4" />
      <text x={X(2.55)} y={Y(2.75)} className="fill-slate-700 text-[10px]" textAnchor="end">
        z₁ = z₂
      </text>
      {ticks.map((t) => (
        <g key={t} className="fill-slate-400 text-[10px]">
          <text x={X(t)} y={W - pad + 14} textAnchor="middle">
            {t}
          </text>
          <text x={pad - 6} y={Y(t) + 3} textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      <text x={W / 2} y={W - 4} textAnchor="middle" className="fill-slate-600 text-[11px]">
        z₁ (cảm biến 1)
      </text>
      <text x={10} y={W / 2} textAnchor="middle" transform={`rotate(-90 10 ${W / 2})`} className="fill-slate-600 text-[11px]">
        z₂ (cảm biến 2)
      </text>
      {showD !== null &&
        (() => {
          const h = H[showD]
          const mid = (h[0] + h[1]) / 2
          return (
            <g>
              <line x1={X(h[0])} y1={Y(h[1])} x2={X(mid)} y2={Y(mid)} stroke={C.target} strokeWidth={2} />
              <text x={(X(h[0]) + X(mid)) / 2 + 4} y={(Y(h[1]) + Y(mid)) / 2 + 12} className="text-[11px]" fill={C.target}>
                d{showD + 1}
              </text>
            </g>
          )
        })()}
      {H.map((h, i) => {
        // h2/h3 và h6/h7 nằm sát nhau: đặt nhãn của h2 bên dưới, h7 bên trái
        const [dx, dy, anchor] = i === 1 ? [0, 16, 'middle'] : i === 6 ? [-7, -5, 'end'] : [7, -5, 'start']
        return (
          <g key={i}>
            <circle cx={X(h[0])} cy={Y(h[1])} r={4.5} fill={col[group(i)]} stroke="#fff" />
            <text x={X(h[0]) + dx} y={Y(h[1]) + dy} textAnchor={anchor} className="text-[11px] font-semibold" fill={col[group(i)]}>
              h{i + 1}
            </text>
          </g>
        )
      })}
      {showZ && (
        <g>
          <line x1={X(H[TARGET][0])} y1={Y(H[TARGET][1])} x2={X(Z[0])} y2={Y(Z[1])} stroke={C.target} strokeDasharray="2 2" />
          <path d={`M${X(Z[0])} ${Y(Z[1]) - 7} l2 5 5 0 -4 3 2 6 -5 -4 -5 4 2 -6 -4 -3 5 0 z`} fill={C.target} />
          <text x={X(Z[0]) + 8} y={Y(Z[1]) - 6} textAnchor="start" className="text-[11px] font-semibold" fill={C.target}>
            z
          </text>
        </g>
      )}
    </svg>
  )
}

// ---------- Hình 4: hàm Q là diện tích đuôi phải của phân phối chuẩn ----------
export function QFig({ t }) {
  const W = 300
  const Hh = 120
  const xr = [-3.5, 3.5]
  const X = (x) => 10 + ((x - xr[0]) / (xr[1] - xr[0])) * (W - 20)
  const phi = (x) => Math.exp(-x * x / 2)
  const Y = (y) => Hh - 22 - y * (Hh - 40)
  const pts = []
  for (let x = xr[0]; x <= xr[1] + 1e-9; x += 0.05) pts.push([x, phi(x)])
  const curve = pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')
  const tail = pts.filter(([x]) => x >= t)
  const area = `${X(t)},${Y(0)} ${tail.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} ${X(xr[1])},${Y(0)}`
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full max-w-[300px]">
      <polygon points={area} fill={C.target} fillOpacity={0.3} />
      <polyline points={curve} fill="none" stroke="#334155" strokeWidth={1.5} />
      <line x1={X(xr[0])} x2={X(xr[1])} y1={Y(0)} y2={Y(0)} stroke="#94a3b8" />
      <line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(phi(t)) - 4} stroke={C.target} />
      <text x={X(t)} y={Hh - 6} textAnchor="middle" className="text-[10px]" fill={C.target}>
        x = {fx(t, 2)}
      </text>
      {Math.abs(t) > 0.6 && (
        <text x={X(0)} y={Hh - 6} textAnchor="middle" className="fill-slate-400 text-[10px]">
          0
        </text>
      )}
      <text x={W - 6} y={14} textAnchor="end" className="text-[11px]" fill={C.target}>
        Q(x) = {fx(Q(t), 3)}
      </text>
    </svg>
  )
}

// ---------- Hình 5: Corollary 1/2(b) — tổng rời rạc hội tụ về tích phân ----------
export function RiemannFig({ alpha = 0.1 }) {
  const W = 480
  const Hh = 190
  const pad = 36
  const X = (x) => pad + (x / (L / 2)) * (W - 2 * pad)
  const Y = (y) => Hh - 26 - y * (Hh - 46) * 2 // trục tung 0 … 0,5
  const g = (x) => {
    const a = f(Math.abs(S[0] - x), P)
    const b = f(Math.abs(S[1] - x), P)
    return Q(Math.abs(a - b) / Math.SQRT2 / P.sigma)
  }
  const pts = []
  for (let x = 0; x <= L / 2 + 1e-9; x += 1) pts.push([x, g(x)])
  const upper = L * (0.5 - alpha)
  const shaded = pts.filter(([x]) => x <= upper)
  const area = `${X(0)},${Y(0)} ${shaded.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} ${X(upper)},${Y(0)}`
  const step = L / N
  const m = nextSize(N, alpha)
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full max-w-[520px]">
      <polygon points={area} fill={C.h1} fillOpacity={0.15} />
      {QK.slice(0, N - m).map((q, i) => (
        <rect
          key={i}
          x={X(i * step)}
          y={Y(q)}
          width={X(step) - X(0)}
          height={Y(0) - Y(q)}
          fill="none"
          stroke={C.h2}
          strokeWidth={1.5}
        />
      ))}
      <polyline points={pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="none" stroke={C.h1} strokeWidth={2} />
      <line x1={X(0)} x2={X(L / 2)} y1={Y(0)} y2={Y(0)} stroke="#94a3b8" />
      <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(0.5)} stroke="#94a3b8" />
      {[0, 0.25, 0.5].map((v) => (
        <text key={v} x={pad - 4} y={Y(v) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">
          {fx(v, 2)}
        </text>
      ))}
      {[0, 125, 200, 250].map((v) => (
        <text key={v} x={X(v)} y={Y(0) + 13} textAnchor="middle" className="fill-slate-400 text-[10px]">
          {v}
        </text>
      ))}
      <line x1={X(upper)} x2={X(upper)} y1={Y(0)} y2={Y(0.5)} stroke={C.both} strokeDasharray="4 3" />
      <text x={X(upper) - 4} y={Y(0.47)} textAnchor="end" className="text-[10px]" fill={C.both}>
        L(½ − α) = {upper}
      </text>
      <text x={W / 2} y={Hh - 2} textAnchor="middle" className="fill-slate-600 text-[11px]">
        vị trí mục tiêu x (nửa trái của đoạn)
      </text>
    </svg>
  )
}
