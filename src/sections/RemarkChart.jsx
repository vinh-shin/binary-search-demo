import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_PARAMS, Q, dk, peStepContinuous } from '../lib/model'
import { Card, Slider, TeX } from '../components/ui'
import { THEORY } from '../theory'

const L = 500

// Demo 4: Corollary 2(b) và Remark 2 của bài báo.
// Trái: P_e^t theo α (giới hạn liên tục) với hai cách đặt cảm biến như Fig. 2 và Fig. 5.
// Phải: công thức đạo hàm của Remark 2 (chỉ áp dụng cho cảm biến cố định).
export default function RemarkChart() {
  const [sigma, setSigma] = useState(1 / Math.SQRT2) // Bảng I
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const data = useMemo(() => {
    const rows = []
    for (let a = 0.005; a <= 0.4951; a += 0.0075) {
      rows.push({
        alpha: +a.toFixed(4),
        peFixed: peStepContinuous(L, a, p, 'quarter', 0.25, 1500),
        peHeur: peStepContinuous(L, a, p, 'exclusive', 0.25, 1500),
        formula: -2 * Q(dk(L * (0.5 - a), L / 4, (3 * L) / 4, p) / sigma),
      })
    }
    return rows
  }, [p, sigma])

  const axisX = { dataKey: 'alpha', type: 'number', domain: [0, 0.5], label: { value: 'α', position: 'insideBottom', offset: -10 } }
  // Mục III: α ∈ [0, 1/4); Phụ lục D-A: Fig. 2 và Fig. 5 vẽ α ∈ [0, 0.5]
  const quarter = (
    <ReferenceLine x={0.25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'α = ¼', fontSize: 11, position: 'insideTopRight' }} />
  )

  return (
    <Card title="Demo 4 · Corollary 2 và Remark 2: P_e^t theo độ chồng lấn α" info={THEORY.demo4}>
      <div className="w-64 mb-3">
        <Slider label="σ" value={sigma} min={0.1} max={1.5} step={0.01} onChange={setSigma} format={(v) => v.toFixed(3)} />
      </div>
      <div className="grid @3xl:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-1">
            <TeX>{'P_e^t'}</TeX> theo α (Corollary 2b, L = 500)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 15, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisX} />
              <YAxis tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip formatter={(v) => v.toFixed(4)} labelFormatter={(a) => `α = ${a}`} />
              <Legend verticalAlign="top" />
              {quarter}
              <Line isAnimationActive={false} dataKey="peFixed" name="Cảm biến L/4, 3L/4 (Fig. 2)" stroke="#111827" strokeWidth={2} dot={false} />
              <Line isAnimationActive={false} dataKey="peHeur" name="s = (L/2)(½ − α) (Fig. 5)" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-1">
            Remark 2: <TeX>{'\\partial P_e^t/\\partial\\alpha'}</TeX> (cảm biến cố định L/4, 3L/4)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 5, right: 15, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisX} />
              <YAxis domain={[-1.05, 0.05]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip formatter={(v) => v.toFixed(4)} labelFormatter={(a) => `α = ${a}`} />
              <Legend verticalAlign="top" />
              {quarter}
              <Line isAnimationActive={false} dataKey="formula" name="−2Q(d(L(½−α))/σ)" stroke="#dc2626" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-3">
        Kéo σ để xem <TeX>{'P_e^t'}</TeX> theo Corollary 2 và công thức đạo hàm của Remark 2 thay đổi thế nào. Hai đồ thị
        vẽ α tới 0,5 như Fig. 2 và Fig. 5 của bài báo.
      </p>
    </Card>
  )
}
