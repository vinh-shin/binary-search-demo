import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_PARAMS, Q, dk, peStepContinuous } from '../lib/model'
import { Card, Slider, TeX } from '../components/ui'
import { THEORY } from '../theory'

const L = 500

// Demo 4: Remark 2. Trái: P_e^t theo α (thấy đoạn nằm ngang của Fig. 2). Phải: ∂P_e^t/∂α giải thích đoạn đó.
export default function RemarkChart() {
  const [sigma, setSigma] = useState(1 / Math.SQRT2)
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const data = useMemo(() => {
    const h = 0.002
    const pe = (a, mode) => peStepContinuous(L, a, p, mode, 0.25, 1500)
    const num = (a, mode) => (pe(a + h, mode) - pe(a - h, mode)) / (2 * h)
    const rows = []
    for (let a = 0.005; a <= 0.4951; a += 0.0075) {
      rows.push({
        alpha: +a.toFixed(4),
        peFixed: pe(a, 'quarter'),
        peHeur: pe(a, 'exclusive'),
        formula: -2 * Q(dk(L * (0.5 - a), L / 4, (3 * L) / 4, p) / sigma),
        numFixed: num(a, 'quarter'),
        numHeur: num(a, 'exclusive'),
      })
    }
    return rows
  }, [p, sigma])

  const axisX = { dataKey: 'alpha', type: 'number', domain: [0, 0.5], label: { value: 'α', position: 'insideBottom', offset: -10 } }
  const cut = (
    <ReferenceLine x={0.25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'α = ¼: cắt qua cảm biến', fontSize: 11, position: 'insideTopRight' }} />
  )

  return (
    <Card title="Demo 4 · Remark 2: vì sao lợi ích của overlap không giảm đều" info={THEORY.demo4}>
      <div className="w-64 mb-3">
        <Slider label="σ" value={sigma} min={0.1} max={1.5} step={0.01} onChange={setSigma} format={(v) => v.toFixed(3)} />
      </div>
      <div className="grid @3xl:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-1">
            <TeX>{'P_e^t'}</TeX> theo α (giới hạn liên tục, Corollary 2)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 15, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisX} />
              <YAxis tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip formatter={(v) => v.toFixed(4)} labelFormatter={(a) => `α = ${a}`} />
              <Legend verticalAlign="top" />
              {cut}
              <Line isAnimationActive={false} dataKey="peFixed" name="Cảm biến cố định L/4, 3L/4" stroke="#111827" strokeWidth={2} dot={false} />
              <Line isAnimationActive={false} dataKey="peHeur" name="Cảm biến s = (L/2)(½ − α)" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-1">
            Tốc độ giảm lỗi <TeX>{'\\partial P_e^t/\\partial\\alpha'}</TeX>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 15, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisX} />
              <YAxis domain={[-1.05, 0.05]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip formatter={(v) => v.toFixed(4)} labelFormatter={(a) => `α = ${a}`} />
              <Legend verticalAlign="top" />
              {cut}
              <Line isAnimationActive={false} dataKey="formula" name="Công thức Remark 2 (cố định)" stroke="#dc2626" strokeWidth={3} dot={false} />
              <Line isAnimationActive={false} dataKey="numFixed" name="Đạo hàm số (cố định)" stroke="#111827" strokeDasharray="5 4" strokeWidth={2} dot={false} />
              <Line isAnimationActive={false} dataKey="numHeur" name="Đạo hàm số (theo α)" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-3">
        Kéo σ và quan sát: đoạn nằm ngang bên trái (cảm biến cố định) trùng với chỗ đạo hàm bên phải gần bằng 0, quanh
        α = ¼.
      </p>
    </Card>
  )
}
