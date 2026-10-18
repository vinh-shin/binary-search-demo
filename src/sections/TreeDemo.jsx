import { useMemo, useState } from 'react'
import { nextSize } from '../lib/model'
import { C, Card, Slider } from '../components/ui'
import { THEORY } from '../theory'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Xây "cây" phân hoạch dưới dạng DAG: các nút trùng khoảng [a,b) ở cùng mức được gộp lại (giống Fig. 1b).
function buildDag(n, alpha) {
  const levels = [[{ a: 0, b: n }]]
  const edges = []
  while (levels[levels.length - 1].some((nd) => nd.b - nd.a > 1)) {
    const cur = levels[levels.length - 1]
    const map = new Map()
    cur.forEach((nd, pi) => {
      const size = nd.b - nd.a
      const kids =
        size > 1
          ? (() => {
              const m = nextSize(size, alpha)
              return [
                { a: nd.a, b: nd.a + m, side: 1 },
                { a: nd.b - m, b: nd.b, side: 2 },
              ]
            })()
          : [{ a: nd.a, b: nd.b, side: 0 }]
      kids.forEach((k) => {
        const key = `${k.a}-${k.b}`
        if (!map.has(key)) map.set(key, { a: k.a, b: k.b })
        edges.push({ level: levels.length - 1, from: pi, toKey: key, side: k.side })
      })
    })
    const next = [...map.values()].sort((x, y) => x.a - y.a || x.b - y.b)
    const idx = new Map(next.map((nd, i) => [`${nd.a}-${nd.b}`, i]))
    edges.forEach((e) => {
      if (e.to === undefined && e.level === levels.length - 1) e.to = idx.get(e.toKey)
    })
    levels.push(next)
    if (levels.length > 30) break
  }
  return { levels, edges }
}

const label = (nd) => LETTERS.slice(nd.a, nd.b)

function Dag({ n, alpha, target, title }) {
  const { levels, edges } = useMemo(() => buildDag(n, alpha), [n, alpha])
  const W = 520
  const rowH = 54
  const H = levels.length * rowH + 20
  const pos = (lvl, i) => {
    const nd = levels[lvl][i]
    const cnt = levels[lvl].length
    // trải đều theo thứ tự để tránh chồng chữ
    const x = cnt === 1 ? W / 2 : 30 + (i * (W - 60)) / (cnt - 1)
    return { x, y: 24 + lvl * rowH, nd }
  }
  const contains = (nd) => target >= nd.a && target < nd.b
  // số đường đi từ gốc tới lá mà vẫn giữ được mục tiêu
  const [goodPaths, totalPaths] = useMemo(() => {
    const count = (filter) => {
      const ways = levels.map((lv) => lv.map(() => 0))
      ways[0][0] = filter(levels[0][0]) ? 1 : 0
      edges.forEach((e) => {
        if (filter(levels[e.level + 1][e.to])) ways[e.level + 1][e.to] += ways[e.level][e.from]
      })
      return ways[levels.length - 1].reduce((s, v) => s + v, 0)
    }
    return [count(contains), count(() => true)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, edges, target])
  const safeSteps = useMemo(() => {
    // dọc theo một đường bất kỳ chứa mục tiêu: bao nhiêu bước mục tiêu nằm trong vùng giao?
    let cnt = 0
    let a = 0
    let b = n
    while (b - a > 1) {
      const m = nextSize(b - a, alpha)
      const in1 = target < a + m
      const in2 = target >= b - m
      if (in1 && in2) cnt++
      if (in1) b = a + m
      else a = b - m
    }
    return cnt
  }, [n, alpha, target])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">
          độ sâu <b>{levels.length - 1}</b> · {levels.reduce((s, l) => s + l.length, 0)} nút khác nhau
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-50 rounded-lg border border-slate-200">
        {edges.map((e, i) => {
          const p = pos(e.level, e.from)
          const q = pos(e.level + 1, e.to)
          const good = contains(p.nd) && contains(q.nd)
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y + 9}
              x2={q.x}
              y2={q.y - 9}
              stroke={good ? C.ok : e.side === 1 ? C.h1 : e.side === 2 ? C.h2 : '#94a3b8'}
              strokeOpacity={good ? 0.9 : 0.25}
              strokeWidth={good ? 2 : 1}
            />
          )
        })}
        {levels.map((lv, l) =>
          lv.map((nd, i) => {
            const p = pos(l, i)
            const has = contains(nd)
            const txt = label(nd)
            const fs = Math.max(7, Math.min(12, 90 / Math.max(3, txt.length)))
            return (
              <g key={`${l}-${i}`}>
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize={fs}
                  fontWeight={has ? 700 : 400}
                  fill={has ? C.ok : '#334155'}
                  style={{ fontFamily: 'ui-monospace, monospace' }}
                >
                  {txt}
                </text>
              </g>
            )
          }),
        )}
      </svg>
      <div className="text-xs text-slate-600 mt-2 grid grid-cols-2 gap-1">
        <div>
          Nhánh giữ mục tiêu <b className="text-emerald-700">{LETTERS[target]}</b>: <b>{goodPaths}</b> / {totalPaths} đường
        </div>
        <div>
          Bước "an toàn" (mục tiêu ở vùng giao, <i>P</i><sub>e</sub><sup>t</sup>=0): <b>{safeSteps}</b> / {levels.length - 1}
        </div>
      </div>
    </div>
  )
}

export default function TreeDemo() {
  const [n, setN] = useState(8)
  const [alpha, setAlpha] = useState(0.2)
  const [target, setTarget] = useState(3)
  const t = Math.min(target, n - 1)
  return (
    <Card title="Demo 1 · Cây phân hoạch: rời nhau vs chồng lấn (tái tạo Fig. 1)" info={THEORY.demo1}>
      <div className="grid @2xl:grid-cols-3 gap-4 mb-4">
        <Slider label="Số phần tử n" value={n} min={4} max={20} step={1} onChange={setN} />
        <Slider
          label="Độ chồng lấn α"
          value={alpha}
          min={0}
          max={0.24}
          step={0.01}
          onChange={setAlpha}
          format={(v) => v.toFixed(2)}
        />
        <div className="text-sm">
          <div className="text-slate-600 mb-1">Mục tiêu (bấm để chọn)</div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: n }, (_, i) => (
              <button
                key={i}
                onClick={() => setTarget(i)}
                className={`w-6 h-6 rounded text-xs font-mono ${
                  i === t ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {LETTERS[i]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid @3xl:grid-cols-2 gap-6">
        <Dag n={n} alpha={0} target={t} title="(a) Binary search cổ điển (α = 0)" />
        <Dag n={n} alpha={alpha} target={t} title={`(b) Phân hoạch chồng lấn (α = ${alpha.toFixed(2)})`} />
      </div>
      <p className="text-sm text-slate-600 mt-4">
        Chọn mục tiêu và kéo α: đường <span className="text-emerald-700 font-semibold">xanh lá</span> là các nhánh còn giữ
        được mục tiêu. So sánh số đường đúng và độ sâu giữa hai cây.
      </p>
    </Card>
  )
}
