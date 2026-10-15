import { useEffect, useState } from 'react'
import { Callout, Card, Prose, Section, TeX } from './components/ui'
import TreeDemo from './sections/TreeDemo'
import StepDemo from './sections/StepDemo'
import StepMCDemo from './sections/StepMCDemo'
import VoronoiDemo from './sections/VoronoiDemo'
import { DepthChart, DerivativeChart, PeAlphaChart, SensorPlacementChart, TotalErrorChart } from './sections/Charts'
import Review from './sections/Review'

const TABS = [
  { id: 'tong-quan', label: 'Tổng quan', Comp: Hero },
  { id: 'dong-luc', label: 'Động lực', Comp: Motivation },
  { id: 'bai-toan', label: 'Bài toán', Comp: Problem },
  { id: 'thuat-toan', label: 'Thuật toán', Comp: Algorithm },
  { id: 'voronoi', label: 'Voronoi & Thm 1', Comp: VoronoiSection },
  { id: 'phan-tich', label: 'Phân tích', Comp: Analysis },
  { id: 'review', label: 'Đánh giá', Comp: Review },
]

const tabFromHash = () => {
  const h = window.location.hash.slice(1)
  return TABS.some((t) => t.id === h) ? h : TABS[0].id
}

export default function App() {
  const [active, setActive] = useState(tabFromHash)
  // Tab đã mở thì giữ nguyên (chỉ ẩn đi) để demo không bị reset khi chuyển tab
  const [visited, setVisited] = useState(() => new Set([tabFromHash()]))

  useEffect(() => {
    const onHash = () => {
      const id = tabFromHash()
      setActive(id)
      setVisited((v) => new Set(v).add(id))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const idx = TABS.findIndex((t) => t.id === active)
  const prev = TABS[idx - 1]
  const next = TABS[idx + 1]

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4 overflow-x-auto">
          <a href="#tong-quan" className="font-bold text-indigo-700 whitespace-nowrap py-4 mr-2">
            Overlap Binary Search
          </a>
          {TABS.map((t, i) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={`text-sm whitespace-nowrap py-4 border-b-2 transition ${
                t.id === active
                  ? 'border-indigo-600 text-indigo-700 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-indigo-700'
              }`}
            >
              {i > 0 && <span className="font-mono text-xs text-slate-400 mr-1">{String(i).padStart(2, '0')}</span>}
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="flex-1">
        {TABS.map(({ id, Comp }) =>
          visited.has(id) ? (
            <div key={id} hidden={id !== active}>
              <Comp />
            </div>
          ) : null,
        )}
      </main>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex justify-between gap-4">
        {prev ? (
          <a href={`#${prev.id}`} className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm">
            ← {prev.label}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#${next.id}`} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">
            {next.label} →
          </a>
        )}
      </div>

      <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-200">
        Dựa trên: K. Buyukkalayci, M. Karakas, X. Li, C. Fragouli, “Enhancing Binary Search via Overlapping
        Partitions”, arXiv:2504.20513v2, 2025. Toàn bộ mô phỏng chạy trong trình duyệt.
      </footer>
    </div>
  )
}

function Hero() {
  return (
    <header className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-indigo-200 font-mono text-sm mb-3">arXiv:2504.20513 · UCLA · 2025</div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-4xl">
          Binary Search với phân hoạch chồng lấn
        </h1>
        <p className="mt-5 text-lg text-indigo-100 max-w-3xl leading-relaxed">
          Khi mỗi quyết định "trái hay phải" đều có thể sai do nhiễu, binary search cổ điển sẽ mất mục tiêu vĩnh viễn
          ngay ở lần sai đầu tiên. Bài báo đề xuất cho hai nửa <b>chồng lên nhau</b> một phần (tham số α). Như vậy ta
          đổi thêm vài bước tìm kiếm lấy độ bền vững trước nhiễu, và kiểm soát được trade-off này một cách tường minh.
        </p>
        <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl">
          {[
            ['Độ sâu β', 'số bước, tức độ trễ / số phép đo'],
            ['Xác suất lỗi Pₑ', 'xác suất mục tiêu bị loại khỏi vùng đầu ra'],
            ['Kích thước |Hᵝ|', 'số ứng viên còn lại ở đầu ra (list decoding)'],
          ].map(([a, b]) => (
            <div key={a} className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="font-semibold">{a}</div>
              <div className="text-sm text-indigo-100">{b}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a href="#dong-luc" className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg">
            Bắt đầu →
          </a>
          <a href="#thuat-toan" className="bg-white/10 border border-white/30 px-4 py-2 rounded-lg">
            Demo thuật toán
          </a>
          <a href="#review" className="bg-white/10 border border-white/30 px-4 py-2 rounded-lg">
            Đánh giá & hướng cải thiện
          </a>
        </div>
      </div>
    </header>
  )
}

function Motivation() {
  return (
    <Section
      id="dong-luc"
      num="01"
      title="Động lực: vì sao binary search dễ vỡ khi có nhiễu?"
      subtitle="Một lần chọn sai là đủ để mất mục tiêu. Chồng lấn tạo ra 'vùng an toàn' cho những mục tiêu nằm gần ranh giới."
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Prose>
          <p>
            Binary search chia tập n phần tử thành hai nửa <b>rời nhau</b> và giữ lại một nửa. Sau{' '}
            <TeX>{'\\log_2 n'}</TeX> bước ta có đúng một phần tử. Nếu phép so sánh luôn đúng thì đây là tối ưu.
          </p>
          <p>
            Trong thực tế, phép so sánh thường đến từ một phép đo có nhiễu: cường độ tín hiệu của cảm biến, kết quả xét
            nghiệm y khoa, câu trả lời của người dùng trong crowdsourcing... Khi đó:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Mục tiêu nằm <b>gần ranh giới</b> giữa hai nửa là khó phân biệt nhất, vì tín hiệu từ hai phía gần như
              nhau.
            </li>
            <li>
              Một khi chọn sai, mục tiêu đã nằm ngoài vùng tìm kiếm và <b>không bước nào sau đó cứu lại được</b>. Lỗi
              lan truyền tới đầu ra.
            </li>
          </ul>
        </Prose>
        <Prose>
          <p>
            <b>Ý tưởng của bài báo:</b> cho hai nửa giao nhau một đoạn có độ rộng tỉ lệ với α. Mỗi nửa chứa khoảng{' '}
            <TeX>{'(\\tfrac12+\\alpha)\\,n'}</TeX> phần tử.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Nếu mục tiêu nằm trong vùng giao <TeX>{'H_1\\cap H_2'}</TeX>, chọn nửa nào cũng đúng, nên{' '}
              <TeX>{'P_e^t=0'}</TeX>. Đây chính là những mục tiêu "gần ranh giới" vốn dễ sai nhất.
            </li>
            <li>
              Cái giá: mỗi bước chỉ co lại theo tỉ lệ <TeX>{'(\\tfrac12+\\alpha)'}</TeX> thay vì ½, nên cần nhiều bước
              hơn: <TeX>{'\\beta \\approx \\log n / \\log\\frac{1}{1/2+\\alpha}'}</TeX>.
            </li>
            <li>
              Bài báo giới hạn α &lt; ¼ để quy tắc làm tròn (Eq. 3) vẫn bảo đảm hội tụ khi n nhỏ.
            </li>
          </ul>
          <Callout type="info" title="Liên hệ với list decoding">
            Ta không nhất thiết phải tìm đúng một phần tử. Có thể dừng khi còn |H<sup>β</sup>| ứng viên và chỉ yêu cầu
            mục tiêu nằm trong danh sách đó.
          </Callout>
        </Prose>
      </div>
      <TreeDemo />
    </Section>
  )
}

function Problem() {
  return (
    <Section id="bai-toan" num="02" title="Bài toán: định vị mục tiêu bằng cảm biến có nhiễu">
      <div className="grid lg:grid-cols-2 gap-6">
        <Prose>
          <p>
            Một nguồn tín hiệu đứng yên tại vị trí chưa biết <TeX>{'l_T \\in \\mathcal H^0 \\subseteq \\mathbb R^d'}</TeX>.
            Nhiều cảm biến được rải trong vùng, và ở mỗi bước t ta <b>kích hoạt</b> một tập{' '}
            <TeX>{'S^t = \\{s^t_1,\\dots,s^t_{|S^t|}\\}'}</TeX>. Mỗi cảm biến đo được:
          </p>
          <TeX block>{'z^t_j = f\\big(\\lVert s^t_j - l_T\\rVert_2\\big) + \\eta^t_j,\\qquad \\eta^t_j\\sim\\mathcal N(0,\\sigma^2)'}</TeX>
          <p>
            Với mỗi giả thuyết k (một vị trí có thể của mục tiêu), vector đo kỳ vọng là{' '}
            <TeX>{'h_k^t = \\big(f(\\lVert s^t_i - k\\rVert)\\big)_i \\in \\mathbb R^{|S^t|}'}</TeX>.
          </p>
          <p>
            <b>Không gian rời rạc.</b> Vùng hình chữ nhật <TeX>{'L_x\\times L_y'}</TeX> được chia thành lưới{' '}
            <TeX>{'n_x\\times n_y'}</TeX> điểm:
          </p>
          <TeX block>{'\\mathcal H^0=\\Big\\{\\Big(\\tfrac{(2i-1)L_x}{2n_x},\\tfrac{(2j-1)L_y}{2n_y}\\Big)\\Big\\}_{i\\le n_x,\\ j\\le n_y}'}</TeX>
          <p>
            <b>Ba tiêu chí cần cân bằng:</b>
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Độ sâu tìm kiếm <TeX>{'\\beta'}</TeX>, tức số bước.
            </li>
            <li>
              Kích thước vùng đầu ra <TeX>{'|\\mathcal H^\\beta|'}</TeX>.
            </li>
            <li>
              Xác suất lỗi, tức xác suất mục tiêu bị loại:
              <TeX block>{'P_e = \\Pr\\{l_T\\notin\\mathcal H^\\beta\\} = 1-\\prod_{t=1}^{\\beta}\\big(1-P_e^t\\big),\\quad P_e^t=\\Pr\\{l_T\\notin\\mathcal H^t \\mid l_T\\in\\mathcal H^{t-1}\\}'}</TeX>
            </li>
          </ol>
        </Prose>
        <div className="space-y-4">
          <Callout type="warn" title="Lưu ý khi đọc Eq. (9)">
            Bài báo viết <TeX>{'10\\log_{10} f(d) = P_0 - 10\\eta\\log_{10}(d+\\epsilon)'}</TeX>, tức f ở miền tuyến tính
            và nhiễu cộng vào f. Trang này dùng đúng cách hiểu đó, và nó tái tạo được độ lớn P<sub>e</sub> trong Fig. 2.
            Nếu cộng nhiễu ở miền dB thì kết quả sẽ khác hẳn. Bài báo không nói rõ điểm này.
          </Callout>
        </div>
      </div>
    </Section>
  )
}

function Algorithm() {
  return (
    <Section
      id="thuat-toan"
      num="03"
      title="Algorithm 1: Overlapping Binary Search"
      subtitle="Mỗi bước gồm 4 thao tác: phân hoạch chồng lấn → đo → tính likelihood → giữ lại nửa có likelihood cao hơn."
    >
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="① Phân hoạch chồng lấn (Eq. 2–3)">
          <div className="text-sm space-y-2">
            <p>Chọn chiều dài nhất d<sup>t</sup> và điểm giữa m<sup>t</sup>, rồi lấy:</p>
            <TeX block>{'\\begin{aligned}H_1^t&=\\{k: k_{d^t}\\le m^t+\\delta^t\\Delta\\}\\\\ H_2^t&=\\{k: k_{d^t}\\ge m^t-\\delta^t\\Delta\\}\\end{aligned}'}</TeX>
            <p>δ<sup>t</sup> được chọn sao cho mỗi nửa có số điểm:</p>
            <TeX block>{'n^{(t)} = \\max\\!\\Big(\\mathrm{round}\\big((\\tfrac12+\\alpha)\\,n^{(t-1)}\\big),\\ \\big\\lceil\\tfrac12 n^{(t-1)}\\big\\rceil\\Big)'}</TeX>
            <p className="text-xs text-slate-500">
              round làm tròn tới số chẵn khi bằng .5. Hàm ceil bảo đảm mỗi nửa có ít nhất một nửa số điểm. α &lt; ¼ bảo
              đảm dãy n<sup>(t)</sup> giảm về 1.
            </p>
          </div>
        </Card>
        <Card title="② Đo và ③ Likelihood (Eq. 4)">
          <div className="text-sm space-y-2">
            <p>Kích hoạt cảm biến, nhận z<sup>t</sup>, rồi tính log-likelihood cho mọi giả thuyết còn lại:</p>
            <TeX block>{'\\ell(k)=\\sum_{j=1}^{|S^t|}\\log p(z_j^t\\mid l_T=k)= -\\frac{\\lVert z^t-h^t_k\\rVert^2}{2\\sigma^2}+\\text{const}'}</TeX>
            <p>
              Với nhiễu Gauss cùng phương sai, maximum likelihood chính là tìm <TeX>{'h_k'}</TeX>{' '}
              <b>gần z nhất</b> theo khoảng cách Euclid.
            </p>
          </div>
        </Card>
        <Card title="④ Chọn nửa (Eq. 5)">
          <div className="text-sm space-y-2">
            <TeX block>{'\\mathcal H^t=\\arg\\max_{i\\in\\{1,2\\}}\\Big\\{\\max_{k\\in H_i^t}\\ell(k)\\Big\\}'}</TeX>
            <p>
              Giữ lại nửa chứa giả thuyết giống phép đo nhất. Có thể thay "max" bằng tổng{' '}
              <TeX>{'\\sum_{k\\in H_i}\\ell(k)'}</TeX>, nhưng bài báo không đánh giá biến thể này.
            </p>
            <p>
              Lặp lại β bước và trả về <TeX>{'\\mathcal H^\\beta'}</TeX>. Lưu ý: likelihood được tính <b>lại từ đầu</b>{' '}
              ở mỗi bước, thông tin từ các bước trước bị bỏ đi.
            </p>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <StepDemo />
        <StepMCDemo />
      </div>
    </Section>
  )
}

function VoronoiSection() {
  return (
    <Section
      id="voronoi"
      num="04"
      title="Hình học của lỗi: ô Voronoi và Theorem 1"
      subtitle="Quyết định ML chia không gian đo thành các ô Voronoi. Khi cảm biến đặt đối xứng, biên quyết định thu về một siêu phẳng duy nhất và ta có công thức đóng."
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Prose>
          <p>
            <b>Lemma 1.</b> Giả sử mục tiêu thuộc <TeX>{'H_m^t'}</TeX> nhưng không thuộc vùng giao. Vì ML chọn{' '}
            <TeX>{'h_k'}</TeX> gần z nhất, mỗi giả thuyết sở hữu một ô Voronoi
          </p>
          <TeX block>{'V_k^t=\\{x\\in\\mathbb R^{|S^t|}:\\lVert x-h_k^t\\rVert\\le\\lVert x-h_{k\'}^t\\rVert,\\ \\forall k\'\\ne k\\}'}</TeX>
          <p>Lỗi xảy ra khi phép đo z rơi ra ngoài hợp các ô của nửa đúng:</p>
          <TeX block>{'P_e^t=\\Pr\\Big(z^t\\notin\\bigcup_{k\\in H_m^t}V_k^t\\Big)'}</TeX>
          <p>
            Trong trường hợp tổng quát, đây là tích phân Gauss nhiều chiều trên một đa diện, khó tính và chưa có công
            thức đóng.
          </p>
        </Prose>
        <Prose>
          <p>
            <b>Theorem 1.</b> Đặt 2 cảm biến <TeX>{'s_1,s_2'}</TeX> đối xứng quanh điểm giữa theo chiều cắt, và giả
            sử prior đều. Mỗi k ∈ H₁ có một "bạn đối xứng" k′ ∈ H₂ với{' '}
            <TeX>{'h_{k,1}=h_{k\',2}'}</TeX>, <TeX>{'h_{k,2}=h_{k\',1}'}</TeX>. Vì vậy biên quyết định là đường chéo{' '}
            <TeX>{'z_1=z_2'}</TeX>. Chiếu nhiễu lên pháp tuyến của nó thì được nhiễu Gauss 1 chiều:
          </p>
          <TeX block>{'P_e^t=\\frac{2}{n_x^{(t-1)}n_y^{(t-1)}}\\sum_{k\\in H_1^t\\setminus H_2^t}Q\\Big(\\frac{d_k}{\\sigma}\\Big),\\qquad d_k=\\tfrac12\\lVert h_k^t-h_{k\'}^t\\rVert_2'}</TeX>
          <p>
            Chỉ các điểm thuộc <TeX>{'H_1\\setminus H_2'}</TeX> (và phần đối xứng) mới góp vào lỗi. Tăng α thì tập này
            nhỏ lại, và các điểm có d<sub>k</sub> nhỏ nhất (gần ranh giới) bị loại khỏi tổng trước tiên.
          </p>
          <p>
            <b>Corollary 1.</b> Khi lưới dày, tổng trở thành tích phân:{' '}
            <TeX>{'P_e^t\\to\\frac{2}{L_xL_y}\\int_{H_1\\setminus H_2}Q\\big(\\tfrac{\\lVert h(x)-h(x\')\\rVert}{2\\sigma}\\big)dx'}</TeX>
          </p>
        </Prose>
      </div>
      <VoronoiDemo />
    </Section>
  )
}

function Analysis() {
  return (
    <Section
      id="phan-tich"
      num="05"
      title="Phân tích trade-off: α, độ sâu và xác suất lỗi"
      subtitle="Tái tạo các hình trong bài báo cho trường hợp 1D, kèm kiểm chứng bằng Monte Carlo."
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Prose>
          <p>
            <b>Corollary 2 (1D).</b> Với H<sup>t−1</sup> gồm n điểm trên đoạn dài L<sup>t−1</sup> và cảm biến tại{' '}
            <TeX>{'\\{s^t, L^{t-1}-s^t\\}'}</TeX>:
          </p>
          <TeX block>{'P_e^t=\\frac{2}{n}\\sum_{k\\le m^t-\\delta^t\\Delta}Q\\Big(\\frac{d_k}{\\sigma}\\Big)\\ \\xrightarrow{n\\to\\infty}\\ \\frac{2}{L^{t-1}}\\int_0^{L^{t-1}(\\frac12-\\alpha)}Q\\Big(\\frac{d(x)}{\\sigma}\\Big)dx'}</TeX>
        </Prose>
        <Prose>
          <p>
            <b>Remark 2.</b> Khi cảm biến cố định, lấy đạo hàm theo α:
          </p>
          <TeX block>{'\\frac{\\partial P_e^t}{\\partial\\alpha}=-2\\,Q\\Big(\\frac{d\\big(L^{t-1}(\\frac12-\\alpha)\\big)}{\\sigma}\\Big)'}</TeX>
          <p>
            Mức giảm lớn nhất xảy ra tại α = 0 (vì d(L/2) = 0, đạo hàm bằng −2Q(0) = −1), rồi nhỏ dần: overlap thêm thì
            lợi ích giảm dần. Lưu ý công thức này chỉ đúng khi s<sup>t</sup> <b>không</b> phụ thuộc α. Với heuristic s =
            (L/2)(½ − α) thì phải tính thêm số hạng ∂s/∂α.
          </p>
        </Prose>
      </div>
      <div className="space-y-6">
        <PeAlphaChart />
        <DerivativeChart />
        <SensorPlacementChart />
        <DepthChart />
        <TotalErrorChart />
      </div>
    </Section>
  )
}
