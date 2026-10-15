import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ErrorBar, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEFAULT_PARAMS, peStepDiscrete, sizeSequence } from '../lib/model'
import { useMC } from '../lib/useMC'
import { Button, Callout, Card, Progress, Select, Slider, TeX, fmtP } from '../components/ui'

const L0 = 500

// Demo 2b: chạy Algorithm 1 nhiều lần, đếm mục tiêu bị loại ở từng bước và so với P_e^t lý thuyết.
export default function StepMCDemo() {
  const [n0, setN0] = useState('1024')
  const [alpha, setAlpha] = useState(0)
  const [sigma, setSigma] = useState(0.7)
  const [nF, setNF] = useState(8)
  const [trials, setTrials] = useState('10000')
  const mc = useMC()
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])

  const seq = useMemo(() => sizeSequence(+n0, alpha, nF), [n0, alpha, nF])
  const theory = useMemo(
    () => seq.slice(0, -1).map((n) => peStepDiscrete(n, (n * L0) / +n0, alpha, p, 'exclusive')),
    [seq, n0, alpha, p],
  )

  // Kết quả MC chỉ hợp lệ nếu được chạy với đúng cấu hình đang hiển thị
  const [ranKey, setRanKey] = useState(null)
  const key = `${n0}|${alpha}|${sigma}|${nF}|${trials}`
  const res = ranKey === key ? mc.results : null

  const rows = useMemo(() => {
    let alive = res?.trials ?? 0
    return theory.map((th, t) => {
      const row = { t: t + 1, n: seq[t], theory: th }
      if (res) {
        const lost = res.fails[t]
        const emp = alive > 0 ? lost / alive : 0
        row.alive = alive
        row.lost = lost
        row.emp = emp
        row.ci = alive > 0 ? 1.96 * Math.sqrt((emp * (1 - emp)) / alive) : 0
        alive -= lost
      }
      return row
    })
  }, [theory, seq, res])

  const totalTheory = 1 - theory.reduce((s, v) => s * (1 - v), 1)
  const totalEmp = res ? res.fails.reduce((s, v) => s + v, 0) / res.trials : null

  const run = () => {
    setRanKey(key)
    mc.run({ kind: 'steps', n0: +n0, L0, nFinal: nF, p, trials: +trials, alpha, seed: Math.floor(Math.random() * 2 ** 31) })
  }

  return (
    <Card title="Demo 2b · Mục tiêu bị mất ở bước nào? Kiểm chứng giả định prior đều bằng Monte Carlo">
      <p className="text-sm text-slate-600 mb-4">
        Theorem 1 tính <TeX>{'P_e^t'}</TeX> với giả định mục tiêu phân bố <b>đều</b> trên{' '}
        <TeX>{'\\mathcal H^{t-1}'}</TeX>, rồi Eq. (1) nhân các bước lại. Demo này chạy Algorithm 1 nhiều lần với mục
        tiêu ngẫu nhiên, đếm số mục tiêu bị loại ở mỗi bước, rồi tính tỉ lệ lỗi <b>có điều kiện</b>: số bị loại ở bước
        t chia cho số mục tiêu còn sống trước bước t. Cảm biến đặt theo heuristic s = (L/2)(½ − α).
      </p>
      <div className="grid md:grid-cols-6 gap-4 mb-4 items-end">
        <Select label="n⁽⁰⁾" value={n0} onChange={setN0} options={['256', '1024', '4096'].map((v) => ({ value: v, label: v }))} />
        <Slider label="α" value={alpha} min={0} max={0.24} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
        <Slider label="σ" value={sigma} min={0.1} max={1.2} step={0.05} onChange={setSigma} format={(v) => v.toFixed(2)} />
        <Slider label="Dừng khi |H| ≤" value={nF} min={1} max={64} step={1} onChange={setNF} />
        <Select
          label="Số lần chạy"
          value={trials}
          onChange={setTrials}
          options={['2000', '10000', '30000'].map((v) => ({ value: v, label: (+v).toLocaleString('vi-VN') }))}
        />
        <div className="space-y-1">
          {mc.running ? (
            <Button variant="danger" onClick={mc.cancel}>
              Hủy
            </Button>
          ) : (
            <Button onClick={run}>▶ Chạy Monte Carlo</Button>
          )}
          {mc.running && <Progress done={mc.done} total={mc.total} />}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rows} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" label={{ value: 'Bước t', position: 'insideBottom', offset: -10 }} />
          <YAxis tickFormatter={(v) => v.toFixed(2)} label={{ value: 'P_e^t', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(v, name) => fmtP(v)}
            labelFormatter={(t) => `Bước ${t} · |H^(t−1)| = ${rows[t - 1]?.n}`}
          />
          <Legend verticalAlign="top" />
          <Bar isAnimationActive={false} dataKey="theory" name="Lý thuyết (Theorem 1, prior đều)" fill="#dc2626" />
          {res && (
            <Bar isAnimationActive={false} dataKey="emp" name="Monte Carlo (có điều kiện)" fill="#2563eb">
              <ErrorBar dataKey="ci" width={4} stroke="#0f172a" />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-slate-500 mb-4">Vạch đen trên cột xanh là khoảng tin cậy 95% của ước lượng Monte Carlo.</div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-1">t</th>
                <th>|H^(t−1)|</th>
                <th>Còn sống trước bước</th>
                <th>Bị loại</th>
                <th>MC</th>
                <th>Lý thuyết</th>
                <th>MC / lý thuyết</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const ratio = res && r.theory > 0 ? r.emp / r.theory : null
                return (
                  <tr key={r.t} className="border-b border-slate-100 font-mono">
                    <td className="py-1">{r.t}</td>
                    <td>{r.n}</td>
                    <td>{res ? r.alive : '…'}</td>
                    <td>{res ? r.lost : '…'}</td>
                    <td>{res ? `${fmtP(r.emp)} ± ${fmtP(r.ci)}` : '…'}</td>
                    <td>{fmtP(r.theory)}</td>
                    <td className={ratio && ratio > 1.05 ? 'text-rose-700 font-semibold' : ''}>
                      {ratio ? ratio.toFixed(2) : '…'}
                    </td>
                  </tr>
                )
              })}
              <tr className="font-mono font-semibold">
                <td className="py-1" colSpan={4}>
                  Tổng (Eq. 1)
                </td>
                <td>{totalEmp !== null ? fmtP(totalEmp) : '…'}</td>
                <td>{fmtP(totalTheory)}</td>
                <td>{totalEmp !== null && totalTheory > 0 ? (totalEmp / totalTheory).toFixed(2) : '…'}</td>
              </tr>
            </tbody>
          </table>
          {mc.results && ranKey !== key && !mc.running && (
            <div className="text-xs text-amber-700 mt-2">Tham số đã thay đổi. Bấm chạy lại để cập nhật kết quả Monte Carlo.</div>
          )}
        </div>
        <Callout type="info" title="Cách đọc kết quả">
          <p>
            <b>Bước 1:</b> MC khớp lý thuyết, vì lúc này mục tiêu thực sự phân bố đều. Với vài nghìn lần chạy, lệch vài
            phần trăm là dao động thống kê bình thường.
          </p>
          <p>
            <b>Từ bước 2:</b> MC lệch khỏi lý thuyết. Ở mỗi bước, các mục tiêu nằm sát mép trong của vùng riêng (gần
            điểm cắt) dễ bị chọn sai nhất và đã bị loại một phần, nên vùng đó bị "hao hụt". Chiều lệch phụ thuộc vào chỗ
            vùng hao hụt rơi vào trong khoảng mới:
          </p>
          <p>
            • <b>α nhỏ</b> (ví dụ 0 hoặc 0.1): vùng hao hụt rơi vào chỗ an toàn (mép khoảng mới, hoặc vùng giao). Khi
            đó tỉ lệ mục tiêu ở chỗ dễ sai của bước mới tăng lên, nên <b>MC cao hơn</b> lý thuyết, từ +5% tới +50%.
          </p>
          <p>
            • <b>α lớn</b> (ví dụ 0.2, σ = 1): vùng hao hụt trùng với chỗ dễ sai của bước mới, nên <b>MC thấp hơn</b>{' '}
            lý thuyết, có bước thấp hơn tới 30%.
          </p>
          <p>
            Hệ quả: Eq. (1) chỉ là xấp xỉ, <b>không phải cận trên cũng không phải cận dưới</b> của lỗi thật.
          </p>
        </Callout>
      </div>
    </Card>
  )
}
