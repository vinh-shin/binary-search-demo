import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import {
  DEFAULT_PARAMS,
  Q,
  approxDepth,
  dk,
  peStepContinuous,
  peStepDiscrete,
  peTotalTheory,
  sizeSequence,
} from '../lib/model'
import { useMC } from '../lib/useMC'
import { Button, Card, Progress, Select, Slider, TeX, Toggle, fmtP } from '../components/ui'

const NS = [8, 16, 32, 64, 128]
const NCOL = ['#0ea5e9', '#f97316', '#22c55e', '#ef4444', '#a855f7']

// ---------- Fig. 2 / Fig. 5 ----------
export function PeAlphaChart() {
  const [mode, setMode] = useState('quarter')
  const [sigma, setSigma] = useState(1 / Math.SQRT2)
  const [hide, setHide] = useState({})
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const data = useMemo(() => {
    const rows = []
    for (let a = 0; a <= 0.5001; a += 0.0025) {
      const row = { alpha: +a.toFixed(4) }
      NS.forEach((n) => (row[`n${n}`] = peStepDiscrete(n, 500, a, p, mode)))
      row.cont = peStepContinuous(500, a, p, mode, 0.25, 600)
      rows.push(row)
    }
    return rows
  }, [p, mode])
  return (
    <Card title="Đồ thị A · P_e^t theo độ chồng lấn α (tái tạo Fig. 2 và Fig. 5)">
      <div className="flex flex-wrap gap-6 items-end mb-3">
        <Toggle
          value={mode}
          onChange={(m) => {
            setMode(m)
            setSigma(m === 'quarter' ? 1 / Math.SQRT2 : 1)
          }}
          options={[
            { value: 'quarter', label: 'Cảm biến cố định L/4, 3L/4 (Fig. 2)' },
            { value: 'exclusive', label: 's = (L/2)(½ − α) (Fig. 5)' },
          ]}
        />
        <div className="w-56">
          <Slider label="σ" value={sigma} min={0.1} max={1.5} step={0.01} onChange={setSigma} format={(v) => v.toFixed(3)} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="alpha" type="number" domain={[0, 0.5]} label={{ value: 'α', position: 'insideBottom', offset: -10 }} />
          <YAxis tickFormatter={(v) => v.toFixed(2)} label={{ value: 'P_e^t', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(v) => fmtP(v)} labelFormatter={(a) => `α = ${a}`} />
          <Legend verticalAlign="top" onClick={(e) => setHide((h) => ({ ...h, [e.dataKey]: !h[e.dataKey] }))} />
          <ReferenceLine x={0.25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'α = 1/4', fontSize: 11, position: 'top' }} />
          {NS.map((n, i) => (
            <Line isAnimationActive={false} key={n} dataKey={`n${n}`} name={`n = ${n}`} stroke={NCOL[i]} dot={false} type="stepAfter" hide={hide[`n${n}`]} strokeWidth={1.5} />
          ))}
          <Line isAnimationActive={false} dataKey="cont" name="n → ∞" stroke="#111827" strokeDasharray="6 3" dot={false} strokeWidth={2} hide={hide.cont} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-sm text-slate-600 mt-2 space-y-2">
        <p>
          Tham số theo Table I: L = 500, P₀ = 20, η = 1, ε = 10, σ = 1/√2 cho Fig. 2. Với Fig. 5, σ = 1 cho P
          <sub>e</sub><sup>t</sup>(0) ≈ 0.22, khớp với hình trong bài (bài không ghi rõ σ). Ở đây f được hiểu theo miền
          tuyến tính, f(d) = 10<sup>P₀/10</sup>/(d+ε)<sup>η</sup>, và cách hiểu này tái tạo đúng độ lớn của Fig. 2. Bấm vào chú giải để ẩn/hiện đường. Khi n
          nhỏ, đường có dạng bậc thang vì Eq. (3) làm tròn số điểm.
        </p>
        <p>
          <b>Nhận xét:</b> Với cảm biến cố định, P<sub>e</sub><sup>t</sup> có một vùng <b>gần như phẳng</b> ở khoảng α ≈
          0.15–0.4: tăng overlap mà lỗi hầu như không giảm. Chuyển sang cách đặt cảm biến "giữa vùng riêng" thì đường
          giảm đều về 0. Như vậy lợi ích của overlap phụ thuộc mạnh vào <b>cách đặt cảm biến</b>, không chỉ vào α.
          Phần α &gt; 1/4 chỉ để minh họa: theo Eq. (3), thuật toán không còn bảo đảm hội tụ tới 1 điểm.
        </p>
      </div>
    </Card>
  )
}

// ---------- Remark 2: đạo hàm của P_e^t theo α ----------
export function DerivativeChart() {
  const [sigma, setSigma] = useState(1 / Math.SQRT2)
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const L = 500
  const data = useMemo(() => {
    const h = 0.002
    const num = (a, mode) =>
      (peStepContinuous(L, a + h, p, mode, 0.25, 1500) - peStepContinuous(L, a - h, p, mode, 0.25, 1500)) / (2 * h)
    const rows = []
    for (let a = 0.005; a <= 0.4951; a += 0.0075) {
      rows.push({
        alpha: +a.toFixed(4),
        formula: -2 * Q(dk(L * (0.5 - a), L / 4, (3 * L) / 4, p) / sigma),
        numFixed: num(a, 'quarter'),
        numHeur: num(a, 'exclusive'),
      })
    }
    return rows
  }, [p])
  return (
    <Card title="Đồ thị A2 · Remark 2: tốc độ giảm lỗi ∂P_e^t/∂α">
      <div className="w-64 mb-2">
        <Slider label="σ" value={sigma} min={0.1} max={1.5} step={0.01} onChange={setSigma} format={(v) => v.toFixed(3)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="alpha" type="number" domain={[0, 0.5]} label={{ value: 'α', position: 'insideBottom', offset: -10 }} />
          <YAxis domain={[-1.05, 0.05]} tickFormatter={(v) => v.toFixed(1)} label={{ value: '∂P_e^t/∂α', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(v) => v.toFixed(4)} labelFormatter={(a) => `α = ${a}`} />
          <Legend verticalAlign="top" />
          <ReferenceLine x={0.25} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'cắt tại cảm biến s = L/4', fontSize: 11, position: 'insideBottomRight' }} />
          <Line isAnimationActive={false} dataKey="formula" name="Công thức −2Q(d(L(½−α))/σ), cảm biến cố định" stroke="#dc2626" strokeWidth={3} dot={false} />
          <Line isAnimationActive={false} dataKey="numFixed" name="Đạo hàm số, cảm biến cố định L/4, 3L/4" stroke="#111827" strokeDasharray="5 4" strokeWidth={2} dot={false} />
          <Line isAnimationActive={false} dataKey="numHeur" name="Đạo hàm số, cảm biến s = (L/2)(½ − α)" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-sm text-slate-600 mt-2 space-y-2">
        <p>
          <TeX>{'\\frac{\\partial P_e^t}{\\partial\\alpha}=-2Q\\big(d(L(\\tfrac12-\\alpha))/\\sigma\\big)'}</TeX>: tăng α
          thì điểm cắt <TeX>{'x=L(\\tfrac12-\\alpha)'}</TeX> lùi lại, và lượng lỗi giảm đi đúng bằng mức lỗi của các giả
          thuyết vừa được đưa vào vùng giao. Đường đỏ (công thức) và đường đen đứt (đạo hàm số) trùng nhau, xác nhận
          Remark 2.
        </p>
        <p>
          <b>Nhận xét:</b> (1) Tại α = 0, d = 0 nên đạo hàm bằng −2Q(0) = −1, là mức giảm nhanh nhất. (2) Với cảm biến
          cố định, đạo hàm <b>không</b> giảm đơn điệu về 0. Nó gần bằng 0 quanh α = ¼, khi điểm cắt đi qua vị trí cảm
          biến (d lớn nhất), rồi lại tăng. Đây chính là nguyên nhân tạo ra <b>vùng phẳng</b> trong Fig. 2. (3) Khi vị trí
          cảm biến phụ thuộc α (đường xanh), công thức không còn đúng, vì thiếu số hạng ∂s/∂α.
        </p>
      </div>
    </Card>
  )
}

// ---------- Fig. 3: tối ưu vị trí cảm biến ----------
export function SensorPlacementChart() {
  const [alpha, setAlpha] = useState(0.1)
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma: 1 }), [])
  const { curve, best } = useMemo(() => {
    const curve = []
    let best = { frac: 0, pe: Infinity }
    for (let fr = 0.005; fr < 0.5; fr += 0.005) {
      const pe = peStepContinuous(500, alpha, p, 'custom', fr, 500)
      curve.push({ frac: +fr.toFixed(3), pe })
      if (pe < best.pe) best = { frac: fr, pe }
    }
    return { curve, best }
  }, [alpha, p])
  const heur = 0.5 * (0.5 - alpha)
  const heurPe = peStepContinuous(500, alpha, p, 'custom', heur, 500)
  const table = useMemo(
    () =>
      [0, 0.05, 0.1, 0.15, 0.2, 0.25].map((a) => {
        let b = { frac: 0, pe: Infinity }
        for (let fr = 0.002; fr < 0.5; fr += 0.002) {
          const pe = peStepContinuous(500, a, p, 'custom', fr, 300)
          if (pe < b.pe) b = { frac: fr, pe }
        }
        const h = 0.5 * (0.5 - a)
        return { a, opt: b.frac * 500, optPe: b.pe, heur: h * 500, heurPe: peStepContinuous(500, a, p, 'custom', h, 300) }
      }),
    [p],
  )
  return (
    <Card title="Đồ thị B · Đặt cảm biến ở đâu? (tương ứng Fig. 3)">
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="w-64 mb-2">
            <Slider label="α" value={alpha} min={0} max={0.3} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={curve} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="frac" type="number" domain={[0, 0.5]} label={{ value: 's₁ / L (s₂ = L − s₁)', position: 'insideBottom', offset: -10 }} />
              <YAxis tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip formatter={(v) => fmtP(v)} labelFormatter={(x) => `s₁/L = ${x}`} />
              <Line isAnimationActive={false} dataKey="pe" name="P_e^t" stroke="#4f46e5" dot={false} strokeWidth={2} />
              <ReferenceLine x={heur} stroke="#059669" strokeDasharray="4 3" label={{ value: 'heuristic', fill: '#059669', fontSize: 11, position: 'top' }} />
              <ReferenceLine x={best.frac} stroke="#dc2626" strokeDasharray="2 2" label={{ value: 'tối ưu', fill: '#dc2626', fontSize: 11, position: 'insideTopRight' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-sm text-slate-600">
            Tối ưu (quét lưới): s₁ = {(best.frac * 500).toFixed(1)}, P<sub>e</sub><sup>t</sup> = {fmtP(best.pe)} · Heuristic
            s₁ = (L/2)(½ − α) = {(heur * 500).toFixed(1)}, P<sub>e</sub><sup>t</sup> = {fmtP(heurPe)}
          </div>
        </div>
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-1">α</th>
                <th>s₁ tối ưu</th>
                <th>P_e^t tối ưu</th>
                <th>s₁ heuristic</th>
                <th>P_e^t heuristic</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.a} className="border-b border-slate-100 font-mono">
                  <td className="py-1">{r.a.toFixed(2)}</td>
                  <td>{r.opt.toFixed(1)}</td>
                  <td>{fmtP(r.optPe)}</td>
                  <td>{r.heur.toFixed(1)}</td>
                  <td>{fmtP(r.heurPe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-slate-600 mt-3">
            Tham số theo Table III (L = 500, σ = 1). Bài báo dùng Evolutionary Algorithm cho bài toán này, nhưng vì cấu
            hình đối xứng chỉ có <b>một biến</b> s₁ nên quét lưới là đủ và cho đúng tối ưu toàn cục. Giống như bài báo
            nhận xét, heuristic "đặt cảm biến ở giữa vùng riêng" bám rất sát điểm tối ưu, nhất là khi α lớn.
          </p>
        </div>
      </div>
    </Card>
  )
}

// ---------- Fig. 7: độ sâu theo α ----------
export function DepthChart() {
  const [n0, setN0] = useState('100000')
  const [nF, setNF] = useState(1)
  const data = useMemo(() => {
    const rows = []
    for (let a = 0; a < 0.2451; a += 0.0025) {
      rows.push({
        alpha: +a.toFixed(4),
        sim: sizeSequence(+n0, a, nF).length - 1,
        approx: approxDepth(+n0, nF, a),
      })
    }
    return rows
  }, [n0, nF])
  return (
    <Card title="Đồ thị C · Độ sâu cây β theo α (tái tạo Fig. 7)">
      <div className="flex flex-wrap gap-6 mb-3 items-end">
        <div className="w-44">
          <Select
            label="n⁽⁰⁾"
            value={n0}
            onChange={setN0}
            options={['1024', '16384', '100000', '1000000'].map((v) => ({ value: v, label: (+v).toLocaleString('vi-VN') }))}
          />
        </div>
        <div className="w-56">
          <Slider label="n⁽ᵝ⁾ (kích thước đầu ra)" value={nF} min={1} max={256} step={1} onChange={setNF} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="alpha" type="number" domain={[0, 0.25]} label={{ value: 'α', position: 'insideBottom', offset: -10 }} />
          <YAxis label={{ value: 'β', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : v)} labelFormatter={(a) => `α = ${a}`} />
          <Legend verticalAlign="top" />
          <Line isAnimationActive={false} dataKey="sim" name="Mô phỏng theo Eq. (3)" type="stepAfter" stroke="#2563eb" dot={false} strokeWidth={2} />
          <Line isAnimationActive={false} dataKey="approx" name="Xấp xỉ Eq. (6)" stroke="#dc2626" strokeDasharray="6 3" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-600 mt-2">
        <TeX>{'\\beta \\approx \\dfrac{\\log n^{(\\beta)} - \\log n^{(0)}}{\\log(\\tfrac12+\\alpha)}'}</TeX>. Độ sâu tăng
        nhanh khi α → 1/4. Ví dụ với n⁽⁰⁾ = 10⁵: β ≈ 17 khi α = 0 nhưng ≈ 37 khi α = 0.24, tức số phép đo nhiều hơn
        khoảng 2.2 lần.
      </p>
    </Card>
  )
}

// ---------- Fig. 4: lỗi tổng theo độ sâu ----------
const FIG4_ALPHAS = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.2, 0.22, 0.24]

export function TotalErrorChart() {
  const [sigma, setSigma] = useState(0.2)
  const [n0, setN0] = useState('4096')
  const [nF, setNF] = useState(32)
  const [trials, setTrials] = useState('400')
  const mc = useMC()
  const p = useMemo(() => ({ ...DEFAULT_PARAMS, sigma }), [sigma])
  const theory = useMemo(
    () =>
      FIG4_ALPHAS.map((a) => {
        const r = peTotalTheory(+n0, 500, nF, a, p)
        return { alpha: a, beta: r.beta, theory: Math.max(r.total, 1e-12), label: `α=${a}` }
      }),
    [n0, nF, p],
  )
  // Không đếm được lỗi nào thì chỉ biết P_e < ~3/N (cận trên 95%, "rule of three"), nên vẽ riêng
  const upper = 3 / +trials
  const merged = theory.map((t) => {
    const r = mc.results?.find((x) => x.alpha === t.alpha)
    return {
      ...t,
      mc: r && r.overlap > 0 ? r.overlap : undefined,
      mcZero: r && r.overlap === 0 ? upper : undefined,
    }
  })
  const runMC = () =>
    mc.run({ n0: +n0, L0: 500, nFinal: nF, p, trials: +trials, alphas: FIG4_ALPHAS, seed: 7 })

  return (
    <Card title="Đồ thị D · Lỗi tổng P_e theo độ sâu β (tương ứng Fig. 4) và kiểm chứng Monte Carlo">
      <div className="grid md:grid-cols-5 gap-4 mb-3 items-end">
        <Slider label="σ" value={sigma} min={0.05} max={0.8} step={0.01} onChange={setSigma} format={(v) => v.toFixed(2)} />
        <Select
          label="n⁽⁰⁾"
          value={n0}
          onChange={setN0}
          options={['1024', '4096', '16384'].map((v) => ({ value: v, label: v }))}
        />
        <Slider label="n⁽ᵝ⁾" value={nF} min={1} max={256} step={1} onChange={setNF} />
        <Select
          label="Số lần thử MC / α"
          value={trials}
          onChange={setTrials}
          options={['200', '400', '1000', '3000'].map((v) => ({ value: v, label: v }))}
        />
        <div className="space-y-1">
          {mc.running ? (
            <Button variant="danger" onClick={mc.cancel}>
              Hủy
            </Button>
          ) : (
            <Button onClick={runMC}>▶ Chạy Monte Carlo</Button>
          )}
          {mc.running && <Progress done={mc.done} total={mc.total} />}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={merged} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="beta" type="number" domain={['dataMin - 1', 'dataMax + 1']} allowDecimals={false} label={{ value: 'Độ sâu β', position: 'insideBottom', offset: -10 }} />
          <YAxis scale="log" domain={['auto', 'auto']} allowDataOverflow tickFormatter={(v) => v.toExponential(0)} label={{ value: 'P_e', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(v, name) => (name.startsWith('MC: 0 lỗi') ? `< ${fmtP(v)}` : fmtP(v))}
            labelFormatter={(b) => `β = ${b}`}
          />
          {/* chữ chú giải mặc định lấy màu fill; chuỗi "0 lỗi" có fill nhạt nên đặt màu chữ cố định */}
          <Legend verticalAlign="top" formatter={(v) => <span style={{ color: '#334155' }}>{v}</span>} />
          <Line isAnimationActive={false} dataKey="theory" name="Lý thuyết Eq. (1) + Cor. 2" stroke="#dc2626" strokeWidth={2} dot={{ r: 4, fill: '#111' }}>
            <LabelList dataKey="label" position="top" fontSize={10} />
          </Line>
          <Scatter isAnimationActive={false} dataKey="mc" name="Monte Carlo" fill="#2563eb" shape="diamond" />
          <Scatter
            isAnimationActive={false}
            dataKey="mcZero"
            name="MC: 0 lỗi (cận trên 95% ≈ 3/N)"
            fill="#bfdbfe"
            stroke="#2563eb"
            strokeWidth={2}
            shape="triangle"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="text-sm text-slate-600 mt-2 space-y-2">
        <p>
          Mỗi điểm ứng với một giá trị α. Cảm biến đặt theo heuristic s = (L/2)(½ − α), các tham số còn lại theo Table
          II. Monte Carlo chọn mục tiêu ngẫu nhiên đều trên lưới, chạy trọn Algorithm 1 và đếm số lần mục tiêu bị loại.
          Nếu không đếm được lần lỗi nào, ta chỉ biết P<sub>e</sub> nhỏ hơn khoảng 3/N (cận trên 95%). Những điểm này được
          vẽ bằng tam giác xanh nhạt ở mức 3/N. Muốn kiểm chứng các α lớn thì cần tăng số lần thử.
        </p>
        <p>
          <b>Điều cần để ý:</b> (1) log P<sub>e</sub> giảm gần tuyến tính theo β, khớp với nhận xét của bài báo. (2)
          Monte Carlo lệch khỏi lý thuyết: cao hơn khi α nhỏ, và có thể thấp hơn khi α lớn (xem Demo 2b ở tab Thuật
          toán). Lý do là Eq. (1) nhân các P
          <sub>e</sub>
          <sup>t</sup> được tính với giả định prior <b>đều</b> trên H<sup>t−1</sup>. Thực tế, khi điều kiện hóa trên việc
          các bước trước đã đúng, phân phối của l<sub>T</sub> không còn đều. (3) Với n⁽⁰⁾ = 2¹⁴, n⁽ᵝ⁾ = 2⁷ như Table
          II, ta có β ∈ [7, 17] chứ không phải [14, 33] như Fig. 4 của bài báo. Bài báo không giải thích chỗ chênh lệch
          này.
        </p>
      </div>
    </Card>
  )
}
