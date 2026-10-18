// Trang "Đọc hiểu bài báo": diễn giải tiếng Việt theo từng mục của arXiv:2504.20513v2 (không phải bản dịch
// nguyên văn), giữ nguyên công thức và đánh số của bài báo, kèm ví dụ số tính sẵn trong figs.jsx.
import { useEffect, useState } from 'react'
import { Callout, TeX } from '../components/ui'
import { DEFAULT_PARAMS, f, nextSize, peStepContinuous, Q, roundHalfEven } from '../lib/model'
import { EX, fx, Ladder, Legend, MeasureSpace, NumberLine, QFig, RiemannFig, sizeChain } from './figs'

const TOC = [
  ['gd-doc', 'Cách đọc trang này'],
  ['gd-1', 'I. Giới thiệu'],
  ['gd-2', 'II. Phát biểu bài toán'],
  ['gd-3', 'III. Thuật toán chồng lấn'],
  ['gd-4a', 'IV-A. Lemma 1: ô Voronoi'],
  ['gd-4b', 'IV-B. Theorem 1, Corollary 1'],
  ['gd-4c', 'IV-C. Trường hợp 1D'],
  ['gd-5', 'V. Đánh giá số'],
  ['gd-6', 'VI. Kết luận'],
  ['gd-pa', 'Phụ lục A: chứng minh Lemma 1'],
  ['gd-pb', 'Phụ lục B: chứng minh Theorem 1'],
  ['gd-pc', 'Phụ lục C: chứng minh Corollary 1'],
  ['gd-pd', 'Phụ lục D: tham số thực nghiệm'],
]

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export default function PaperGuide() {
  const [cur, setCur] = useState(TOC[0][0])

  // Đánh dấu mục đang đọc trong mục lục
  useEffect(() => {
    const els = TOC.map(([id]) => document.getElementById(id)).filter(Boolean)
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setCur(vis[0].target.id)
      },
      { rootMargin: '-64px 0px -70% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
      <aside className="hidden lg:block">
        <nav className="sticky top-20 text-sm">
          <div className="font-semibold text-slate-900 mb-2">Mục lục</div>
          <ul className="space-y-0.5 border-l border-slate-200">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className={`cursor-pointer block w-full text-left pl-3 py-1 -ml-px border-l-2 transition ${
                    cur === id
                      ? 'border-indigo-600 text-indigo-700 font-medium'
                      : 'border-transparent text-slate-600 hover:text-indigo-700'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <a href="#tong-quan" className="inline-block mt-5 text-indigo-700 hover:underline">
            ← Quay lại các demo
          </a>
        </nav>
      </aside>

      <article className="min-w-0 text-slate-700 leading-relaxed">
        <header className="mb-6">
          <div className="text-indigo-600 font-mono text-sm font-semibold">Đọc hiểu bài báo</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Enhancing Binary Search via Overlapping Partitions</h1>
          <p className="text-slate-500 mt-2">
            K. Buyukkalayci, M. Karakas, X. Li, C. Fragouli (UCLA) · arXiv:2504.20513v2 · 2025
          </p>
        </header>

        <details className="lg:hidden mb-6 border border-slate-200 rounded-lg bg-white">
          <summary className="px-4 py-2 cursor-pointer font-medium text-slate-800">Mục lục</summary>
          <ul className="px-4 pb-3 space-y-1 text-sm">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => scrollTo(id)} className="cursor-pointer text-indigo-700 hover:underline text-left">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </details>

        <ReadMe />
        <Sec1 />
        <Sec2 />
        <Sec3 />
        <Sec4A />
        <Sec4B />
        <Sec4C />
        <Sec5 />
        <Sec6 />
        <AppA />
        <AppB />
        <AppC />
        <AppD />
      </article>
    </div>
  )
}

// ---------------- Khối trình bày dùng chung ----------------

function Sec({ id, kicker, title, children }) {
  return (
    <section id={id} className="scroll-mt-20 pt-8 pb-4 border-t border-slate-200 first:border-t-0">
      {kicker && <div className="text-indigo-600 font-mono text-xs font-semibold uppercase tracking-wide">{kicker}</div>}
      <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function H3({ children }) {
  return <h3 className="text-lg font-semibold text-slate-900 pt-3">{children}</h3>
}

// Công thức đánh số theo bài báo
function Eq({ tex, n }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 overflow-x-auto">
      <div className="flex-1 min-w-0">
        <TeX block>{tex}</TeX>
      </div>
      {n && <div className="shrink-0 font-mono text-sm text-slate-500">({n})</div>}
    </div>
  )
}

function Idea({ children }) {
  return (
    <Callout type="info" title="💡 Ý tưởng bằng lời thường">
      {children}
    </Callout>
  )
}

function Example({ title, children }) {
  return (
    <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-4 my-4">
      <div className="font-semibold text-emerald-800 mb-2">✏️ Ví dụ: {title}</div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

// Bảng ký hiệu: [[TeX, mô tả], …]
function Symbols({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full border border-slate-200 rounded-lg overflow-hidden">
        <tbody>
          {rows.map(([s, d], i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50">
              <td className="px-3 py-1.5 whitespace-nowrap align-top w-1">
                <TeX>{s}</TeX>
              </td>
              <td className="px-3 py-1.5">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full border border-slate-200">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-1.5 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50 border-t border-slate-200">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-1.5 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DemoLink({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm hover:bg-indigo-100"
    >
      ▶ {children}
    </a>
  )
}

const T = ({ children }) => <TeX>{children}</TeX>
// Số thập phân trong công thức KaTeX: dấu phẩy phải bọc {,} để không bị giãn cách
const tx = (...a) => fx(...a).replace(',', '{,}')

// ---------------- Nội dung ----------------

function ReadMe() {
  return (
    <Sec id="gd-doc" title="Cách đọc trang này">
      <p>
        Trang này đi lần lượt theo các mục I–VI và Phụ lục A–D của bài báo. Mỗi mục gồm: ý chính diễn giải bằng tiếng
        Việt, công thức giữ nguyên ký hiệu và số thứ tự của bài báo, giải thích từng ký hiệu, và một ví dụ số tính tay.
      </p>
      <Callout type="warn" title="Lưu ý">
        <p>
          Đây là bản <b>diễn giải</b> của nhóm, không phải bản dịch nguyên văn. Bài báo được phát hành trên arXiv theo
          giấy phép phân phối không độc quyền, không cho phép tự do dịch và đăng lại toàn văn. Khi cần trích dẫn chính
          xác, hãy đọc bản gốc tại arxiv.org/abs/2504.20513.
        </p>
      </Callout>
      <p>
        Để dễ theo dõi, mọi ví dụ dùng chung <b>một cấu hình nhỏ</b>: đoạn thẳng dài <T>{'L = 500'}</T>, chia thành{' '}
        <T>{'n = 8'}</T> điểm lưới, hai cảm biến đặt ở <T>{'L/4 = 125'}</T> và <T>{'3L/4 = 375'}</T>, độ lệch chuẩn nhiễu{' '}
        <T>{'\\sigma = 1/\\sqrt2'}</T>, mô hình tín hiệu Eq. (9) với <T>{'P_0 = 20, \\eta = 1, \\epsilon = 10'}</T> (tham số
        Bảng I của bài báo). Mục tiêu thật nằm ở <b>điểm số 4</b>.
      </p>
    </Sec>
  )
}

function Sec1() {
  const c0 = sizeChain(8, 0)
  const c1 = sizeChain(8, 0.1)
  return (
    <Sec id="gd-1" kicker="Mục I" title="Giới thiệu: vì sao cần chồng lấn?">
      <p>
        Binary search cổ điển chia tập n phần tử thành hai nửa <b>rời nhau</b>, hỏi "mục tiêu ở nửa nào?", rồi bỏ hẳn nửa
        kia. Sau <T>{'\\log_2 n'}</T> bước là tìm xong. Cách này chỉ đúng khi câu trả lời luôn đúng. Trong thực tế (đọc cảm
        biến, chẩn đoán y khoa, hệ gợi ý, câu trả lời của người trong crowdsourcing) câu trả lời có thể sai do nhiễu.
      </p>
      <p>
        Vấn đề là: <b>chỉ cần sai một lần</b> là mục tiêu đã bị loại, và mọi bước sau chỉ tìm trong vùng không còn chứa
        mục tiêu. Bài báo gọi đây là <b>lan truyền lỗi</b>.
      </p>
      <Idea>
        <p>
          Cho hai nửa <b>chồng lên nhau một phần</b>. Mục tiêu nằm ở vùng giữa (nơi khó phân biệt nhất, dễ trả lời sai
          nhất) thì thuộc cả hai nửa, nên chọn nửa nào cũng không mất mục tiêu. Cái giá: mỗi bước chỉ thu nhỏ vùng tìm
          kiếm còn khoảng <T>{'(\\tfrac12+\\alpha)'}</T> thay vì <T>{'\\tfrac12'}</T>, nên cần nhiều bước hơn.
        </p>
        <p>
          Tham số <T>{'\\alpha'}</T> là "núm vặn" điều khiển trực tiếp đánh đổi giữa <b>độ tin cậy</b> và <b>tốc độ</b>.
          Bài báo cho rằng các cách chống nhiễu trước đó (lặp lại câu hỏi, cập nhật xác suất) thiếu một núm vặn tường minh
          như vậy, và một số chỉ có bảo đảm khi số bước tiến ra vô hạn.
        </p>
      </Idea>
      <Example title="cây n = 8 (tương ứng Fig. 1 của bài báo)">
        <p>
          Đi theo đường tới mục tiêu (điểm 4, chấm đỏ), không có nhiễu. Mỗi hàng là một bước; ô xanh là H₁, cam là H₂,
          tím là phần thuộc cả hai.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <div className="font-medium mb-1">α = 0: rời nhau</div>
            <Ladder alpha={0} />
            <p className="text-slate-600">
              Kích thước: {c0.join(' → ')}, tức <b>{c0.length - 1} bước</b> = log₂8.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1">α = 0,1: chồng lấn</div>
            <Ladder alpha={0.1} />
            <p className="text-slate-600">
              Kích thước: {c1.join(' → ')}, tức <b>{c1.length - 1} bước</b>.
            </p>
          </div>
        </div>
        <Legend />
        <p>
          Với α = 0, ở bước đầu điểm 4 nằm ngay sát ranh giới giữa hai nửa: đây là chỗ nhiễu dễ làm chọn sai nhất. Với α =
          0,1, điểm 4 và 5 thuộc cả hai nửa (ô tím), nên dù nhiễu khiến thuật toán chọn nửa nào thì điểm 4 vẫn còn. Đổi
          lại cây sâu thêm 1 bước.
        </p>
      </Example>
      <H3>Ba đại lượng mô tả kết quả</H3>
      <p>
        Bài báo không đòi tìm đúng một phần tử; có thể chỉ cần thu hẹp mục tiêu vào một tập ứng viên nhỏ (giống ý tưởng
        list decoding trong lý thuyết mã). Do đó kết quả được mô tả bằng ba đại lượng:
      </p>
      <Symbols
        rows={[
          ['P_e', 'xác suất lỗi: mục tiêu không nằm trong tập đầu ra'],
          ['\\beta', 'số bước quyết định, tức độ sâu của cây đã đi qua'],
          ['|\\mathcal H^\\beta|', 'kích thước tập ứng viên còn lại ở đầu ra'],
        ]}
      />
      <H3>Bài báo đặt mình ở đâu so với các công trình khác</H3>
      <ul className="list-disc ml-5 space-y-1">
        <li>
          <b>Chia đôi xác suất</b> (Horstein; Burnashev và Zigangirov): tối ưu tiệm cận về số bước kỳ vọng cho bài toán một
          chiều; sau được mở rộng cho không gian tổng quát (Nowak). Theo bài báo, các cơ chế này không cho điều khiển đánh
          đổi giữa độ sâu và xác suất lỗi khi số bước hữu hạn.
        </li>
        <li>
          <b>Vùng quyết định chồng lấn</b> (Javdani và cộng sự): có chồng lấn nhưng các vùng quyết định cố định từ trước.
        </li>
        <li>
          <b>Lặp lại truy vấn</b> trên các phần rời nhau (Karp và Kleinberg; Anderson và Ferris; Nowak).
        </li>
        <li>
          <b>Định vị bằng xử lý tín hiệu</b> (tối ưu thông tin Fisher, cực tiểu MSE, hình học cảm biến): nhắm tới vị trí
          chính xác chứ không phải một vùng, và không dùng cơ chế binary search.
        </li>
      </ul>
      <H3>Ba đóng góp chính</H3>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Khung binary search với phân hoạch chồng lấn, áp dụng vào bài toán định vị vùng chứa mục tiêu.</li>
        <li>Công thức xác suất lỗi cho cả không gian rời rạc và liên tục, dựa trên ô Voronoi trong không gian phép đo.</li>
        <li>Khảo sát số về đánh đổi giữa độ chồng lấn, xác suất lỗi và độ trễ (số bước).</li>
      </ol>
      <p>
        <DemoLink href="#tong-quan">Demo 1: cây phân hoạch</DemoLink>
      </p>
    </Sec>
  )
}

function Sec2() {
  const pT = 0.05
  const beta = 10
  return (
    <Sec id="gd-2" kicker="Mục II" title="Phát biểu bài toán">
      <p>
        Một nguồn phát tín hiệu đứng yên ở vị trí chưa biết <T>{'l_T'}</T> trong vùng <T>{'\\mathcal H^0 \\subseteq \\mathbb R^d'}</T>.
        Trong vùng có rất nhiều cảm biến; ở mỗi bước t ta được bật một nhóm cảm biến để đo, rồi dùng kết quả đo để thu
        hẹp vùng nghi ngờ.
      </p>
      <H3>Mô hình đo</H3>
      <Eq tex={'z_j^t = f\\big(\\lVert s_j^t - l_T \\rVert_2\\big) + \\eta_j^t,\\qquad \\eta_j^t \\sim \\mathcal N(0,\\sigma^2)'} />
      <Symbols
        rows={[
          ['S^t = \\{s_1^t,\\dots,s^t_{|S^t|}\\}', 'vị trí các cảm biến được bật ở bước t (số lượng có thể bị giới hạn)'],
          ['f(\\cdot)', 'mức tín hiệu kỳ vọng theo khoảng cách tới mục tiêu: càng xa càng yếu'],
          ['\\eta_j^t', 'nhiễu Gauss trắng cộng, độc lập giữa các cảm biến, cùng phương sai σ²'],
          ['\\boldsymbol z^t', 'vector gom phép đo của mọi cảm biến ở bước t'],
          ['\\boldsymbol h_k^t,\\ h_{k,i}^t = f(\\lVert s_i^t - k\\rVert_2)', 'phép đo "lẽ ra phải thấy" nếu mục tiêu ở đúng vị trí k (không nhiễu)'],
        ]}
      />
      <p>
        Bài báo lưu ý: nếu z là cường độ tín hiệu tính bằng dB và f là suy hao theo log khoảng cách, mô hình này cũng bao
        gồm trường hợp nhiễu log-chuẩn, thường gặp khi định vị bằng sóng vô tuyến ngoài trời. Dạng cụ thể của f dùng
        trong thực nghiệm là Eq. (9) ở Phụ lục D:
      </p>
      <Eq tex={'10\\log_{10} f(d) = P_0 - \\eta\\cdot 10\\log_{10}(d+\\epsilon)'} n="9" />
      <Example title="tính vector hₖ">
        <p>
          Với <T>{'P_0 = 20,\\ \\eta = 1,\\ \\epsilon = 10'}</T>: <T>{'f(d) = 10^{2}/(d+10) = 100/(d+10)'}</T>.
        </p>
        <p>
          Điểm 4 ở x = {EX.XS[3]}. Khoảng cách tới hai cảm biến là {EX.XS[3] - EX.S[0]} và {EX.S[1] - EX.XS[3]}, nên{' '}
          <T>{`\\boldsymbol h_4 = \\big(f(${EX.XS[3] - EX.S[0]}),\\ f(${EX.S[1] - EX.XS[3]})\\big) = (${tx(EX.H[3][0])},\\ ${tx(EX.H[3][1])})`}</T>.
        </p>
        <p>
          Đọc trực quan: cảm biến 1 gần hơn nên "nghe to hơn". Nếu không có nhiễu, mỗi vị trí k cho đúng một cặp số{' '}
          <T>{'\\boldsymbol h_k'}</T>; nhiễu làm phép đo thật <T>{'\\boldsymbol z'}</T> lệch khỏi cặp số đó một chút. (Giả định
          của demo: nhiễu cộng vào f ở miền tuyến tính, xem drawer lý thuyết của Demo 2.)
        </p>
      </Example>

      <H3>Lưới giả thuyết</H3>
      <p>
        Để phân tích, bài báo làm việc trên vùng chữ nhật 2D được chia lưới, và nói phương pháp mở rộng trực tiếp cho
        không gian d chiều liên tục. Vùng ban đầu là tâm các ô lưới:
      </p>
      <Eq
        tex={
          '\\mathcal H^0 = \\left\\{ \\boldsymbol k = \\left(\\frac{(2i-1)L_x^0}{2n_x^{(0)}},\\ \\frac{(2j-1)L_y^0}{2n_y^{(0)}}\\right) :\\ i\\in[n_x^{(0)}],\\ j\\in[n_y^{(0)}] \\right\\}'
        }
      />
      <Symbols
        rows={[
          ['(L_x^t, L_y^t)', 'chiều dài hai cạnh của vùng ứng viên sau bước t'],
          ['(n_x^{(t)}, n_y^{(t)})', 'số điểm lưới theo mỗi chiều; chọn n lớn thì lưới mịn'],
          ['\\mathcal H^t \\subseteq \\mathcal H^{t-1}', 'vùng ứng viên chỉ co lại qua từng bước'],
        ]}
      />
      <Example title="lưới 1D">
        <p>
          Với L = 500, n = 8: các điểm là <T>{'(2i-1)\\cdot 500/16'}</T>, tức {EX.XS.map((x) => fx(x, 2)).join('; ')}. Mỗi điểm
          là tâm một ô rộng 62,5.
        </p>
      </Example>

      <H3>Tiêu chí đánh giá và Eq. (1)</H3>
      <p>
        Bài báo đánh đổi giữa độ sâu β, kích thước đầu ra |Hᵝ| và xác suất lỗi. Lỗi tổng được tách thành lỗi từng bước:
      </p>
      <Eq tex={'P_e = \\Pr\\{l_T \\notin \\mathcal H^\\beta\\} = 1 - \\prod_{t=1}^{\\beta}\\big(1 - P_e^t\\big),\\qquad P_e^t = \\Pr\\{l_T\\notin\\mathcal H^t \\mid l_T \\in \\mathcal H^{t-1}\\}'} n="1" />
      <p>
        Cách hiểu: muốn không lỗi thì phải "sống sót" qua <b>mọi</b> bước. Nếu bước t giữ được mục tiêu với xác suất{' '}
        <T>{'1-P_e^t'}</T> thì xác suất giữ được qua cả β bước là tích các số đó.
      </p>
      <Example title="lỗi tích lũy">
        <p>
          Giả sử mỗi bước chỉ sai {fx(pT * 100, 0)}% (<T>{`P_e^t = ${tx(pT, 2)}`}</T>) và đi {beta} bước:{' '}
          <T>{`P_e = 1 - ${tx(1 - pT, 2)}^{${beta}} \\approx ${tx(1 - (1 - pT) ** beta, 2)}`}</T>. Mỗi bước trông có vẻ đáng tin,
          nhưng gần 40% số lần chạy sẽ mất mục tiêu. Đây chính là lan truyền lỗi.
        </p>
        <p>
          Chồng lấn làm tăng β (thêm thừa số trong tích) nhưng giảm mạnh từng <T>{'P_e^t'}</T>. Mục V cho thấy hiệu ứng thứ
          hai thắng.
        </p>
      </Example>
    </Sec>
  )
}

function Sec3() {
  const rows = [
    [8, 0.1],
    [5, 0.1],
    [3, 0.1],
    [2, 0.1],
    [5, 0],
    [2, 0.25],
  ].map(([n, a]) => {
    const raw = (0.5 + a) * n
    return [
      n,
      fx(a, 2),
      `${fx(raw, 2)} → ${roundHalfEven(raw)}`,
      Math.ceil(n / 2),
      <b key="r">{nextSize(n, a)}</b>,
    ]
  })
  const d2 = EX.dist2
  return (
    <Sec id="gd-3" kicker="Mục III" title="Thuật toán: binary search với phân hoạch chồng lấn">
      <p>
        Mỗi bước t của Algorithm 1 làm bốn việc: (1) chọn chiều để cắt, (2) chia vùng hiện tại thành hai nửa chồng lấn, (3)
        bật cảm biến lấy phép đo, (4) giữ lại nửa có khả năng chứa mục tiêu cao nhất. Lặp lại β lần, hoặc tới khi vùng đủ
        nhỏ.
      </p>
      <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <div className="text-slate-400">Algorithm 1 · Overlapping Binary Search (diễn giải)</div>
        <div>Vào: H⁰, độ chồng lấn α, số bước β, hàm truyền f(·)</div>
        <div>for t = 1 … β:</div>
        <div className="pl-4">chia Hᵗ⁻¹ thành hai nửa chồng lấn {'{H₁ᵗ, H₂ᵗ}'} theo (2)</div>
        <div className="pl-4">bật |Sᵗ| cảm biến, đo được zᵗ</div>
        <div className="pl-4">tính log-likelihood ℓ(k) cho mọi k ∈ Hᵗ⁻¹ theo (4)</div>
        <div className="pl-4">Hᵗ ← nửa chứa giả thuyết có ℓ lớn nhất, theo (5)</div>
        <div>Ra: Hᵝ</div>
      </div>

      <H3>Bước 1: chọn chiều cắt và điểm giữa</H3>
      <p>Cắt theo chiều dài nhất của vùng hiện tại, tại điểm giữa theo chiều đó:</p>
      <Eq
        tex={
          'd^t = \\arg\\max_{i\\in\\{1,2\\}}\\Big(\\max_{\\boldsymbol k\\in\\mathcal H^{t-1}} k_i - \\min_{\\boldsymbol k\\in\\mathcal H^{t-1}} k_i\\Big),\\qquad m^t_{d^t} = \\tfrac12\\Big(\\max_{\\boldsymbol k\\in\\mathcal H^{t-1}} k_{d^t} + \\min_{\\boldsymbol k\\in\\mathcal H^{t-1}} k_{d^t}\\Big)'
        }
      />
      <H3>Bước 2: hai nửa chồng lấn</H3>
      <Eq
        tex={
          '\\mathcal H_1^t = \\{\\boldsymbol k\\in\\mathcal H^{t-1} \\mid k_{d^t} \\le m^t_{d^t} + \\delta^t\\Delta_{d^t}\\},\\qquad \\mathcal H_2^t = \\{\\boldsymbol k\\in\\mathcal H^{t-1} \\mid k_{d^t} \\ge m^t_{d^t} - \\delta^t\\Delta_{d^t}\\}'
        }
        n="2"
      />
      <p>
        H₁ là "nửa trái kéo dài thêm một đoạn", H₂ là "nửa phải kéo dài thêm một đoạn" về phía bên kia. Đoạn kéo dài bằng{' '}
        <T>{'\\delta^t'}</T> lần bước lưới <T>{'\\Delta_{d^t} = L^0_{d^t}/n^{(0)}_{d^t}'}</T>, và <T>{'\\delta^t'}</T> được chọn
        sao cho mỗi nửa có đúng số điểm cho bởi quy tắc (3):
      </p>
      <Eq
        tex={
          'n^{(t)}_{d^t} = \\max\\Big(\\mathrm{round}\\big((\\tfrac12+\\alpha)\\,n^{(t-1)}_{d^t}\\big),\\ \\mathrm{ceil}\\big(\\tfrac12\\,n^{(t-1)}_{d^t}\\big)\\Big),\\qquad \\alpha\\in[0,\\tfrac14)'
        }
        n="3"
      />
      <Symbols
        rows={[
          ['\\alpha', 'độ chồng lấn: mỗi nửa chiếm khoảng (½ + α) vùng cũ; α = 0 là binary search thường'],
          ['\\mathrm{round}', 'làm tròn tới số nguyên gần nhất; khi đúng ,5 thì làm tròn về số chẵn'],
          ['\\mathrm{ceil}', 'bảo đảm mỗi nửa có ít nhất một nửa số điểm (khi n lẻ)'],
        ]}
      />
      <Example title="quy tắc (3) với vài giá trị n, α">
        <Table head={['n⁽ᵗ⁻¹⁾', 'α', 'round((½+α)n)', 'ceil(n/2)', 'n⁽ᵗ⁾']} rows={rows} />
        <p>
          Hai dòng cuối giải thích các chi tiết kỹ thuật. Với n = 5, α = 0: 2,5 làm tròn về số chẵn là 2, nhưng hai nửa 2
          điểm không phủ hết 5 điểm, nên cần ceil(2,5) = 3. Với n = 2, α = 0,25: 1,5 làm tròn về số chẵn là 2, tức vùng
          không bao giờ co lại dưới 2 điểm. Đó là lý do bài báo yêu cầu <T>{'\\alpha < \\tfrac14'}</T> để thuật toán đi được
          tới n = 1.
        </p>
      </Example>
      <Example title="hai nửa trên trục số (α = 0,1)">
        <NumberLine alpha={0.1} />
        <p>
          n = 8 nên mỗi nửa có {EX.m1} điểm: H₁ = {'{1,…,5}'}, H₂ = {'{4,…,8}'}. Điểm giữa m = 250, bước lưới Δ = 62,5. H₁
          phải chứa tới điểm 5 (x = 281,25), nên <T>{'\\delta\\Delta = 31{,}25'}</T>, tức <T>{'\\delta = 0{,}5'}</T>. Vùng
          chồng lấn là {'{4, 5}'}: hai điểm sát ranh giới nhất.
        </p>
      </Example>

      <H3>Bước 3–4: chọn nửa bằng Maximum Likelihood</H3>
      <p>Với mỗi vị trí ứng viên k, cộng log-xác suất của từng phép đo nếu mục tiêu thật sự ở k:</p>
      <Eq tex={'\\ell(\\boldsymbol k) = \\sum_{j=1}^{|S^t|} \\log p\\big(z_j^t \\mid l_T = \\boldsymbol k\\big),\\qquad \\forall \\boldsymbol k\\in\\mathcal H^{t-1}'} n="4" />
      <p>Rồi giữ nửa chứa ứng viên "khớp nhất" với phép đo:</p>
      <Eq tex={'\\mathcal H^t = \\arg\\max_{i\\in\\{1,2\\}}\\ \\max_{\\boldsymbol k\\in\\mathcal H_i^t} \\ell(\\boldsymbol k)'} n="5" />
      <p>
        Bài báo ghi chú có thể dùng tiêu chí khác, ví dụ chọn nửa có tổng <T>{'\\sum_{\\boldsymbol k\\in\\mathcal H_i^t}\\ell(\\boldsymbol k)'}</T>{' '}
        lớn hơn, nhưng không phân tích thêm. Với nhiễu Gauss cùng phương sai, ℓ(k) lớn nhất đúng bằng{' '}
        <T>{'\\lVert \\boldsymbol z - \\boldsymbol h_k\\rVert'}</T> nhỏ nhất (Phụ lục A), tức ứng viên có phép đo kỳ vọng gần
        phép đo thật nhất.
      </p>
      <Example title="chồng lấn cứu một quyết định sai">
        <p>
          Mục tiêu ở điểm 4, <T>{`\\boldsymbol h_4 = (${tx(EX.H[3][0])},\\ ${tx(EX.H[3][1])})`}</T>. Nhiễu{' '}
          <T>{`\\boldsymbol\\eta = (${tx(EX.noise[0], 2)},\\ ${tx(EX.noise[1], 2)})`}</T> cho phép đo{' '}
          <T>{`\\boldsymbol z = (${tx(EX.z[0])},\\ ${tx(EX.z[1])})`}</T>. Vì <T>{'\\sigma^2 = \\tfrac12'}</T> nên, bỏ hằng số,{' '}
          <T>{'\\ell(\\boldsymbol k) = -\\lVert\\boldsymbol z - \\boldsymbol h_k\\rVert^2'}</T>:
        </p>
        <Table
          head={['k', ...EX.XS.map((_, i) => i + 1)]}
          rows={[['‖z − hₖ‖²', ...d2.map((v, i) => (i === EX.best ? <b key={i} className="text-rose-600">{fx(v)}</b> : fx(v)))]]}
        />
        <p>
          Ứng viên khớp nhất là <b>điểm {EX.best + 1}</b>, không phải điểm 4: nhiễu đã làm phép đo trông giống mục tiêu ở
          điểm 5 hơn.
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <b>α = 0</b>: H₂ = {'{5,…,8}'} thắng. Điểm 4 bị loại, <span className="text-rose-600 font-semibold">lỗi</span>, và
            không bao giờ quay lại được.
          </li>
          <li>
            <b>α = 0,1</b>: H₂ = {'{4,…,8}'} thắng. Điểm 4 vẫn còn,{' '}
            <span className="text-emerald-700 font-semibold">không lỗi</span>.
          </li>
        </ul>
      </Example>
      <p>
        <DemoLink href="#thuat-toan">Demo 2: chạy Algorithm 1 từng bước</DemoLink>
      </p>
    </Sec>
  )
}

function Sec4A() {
  return (
    <Sec id="gd-4a" kicker="Mục IV-A" title="Lemma 1: lỗi nhìn trong không gian phép đo">
      <p>
        Để tính <T>{'P_e^t'}</T>, bài báo chuyển góc nhìn: thay vì nhìn bản đồ vị trí, hãy nhìn <b>không gian phép đo</b>.
        Với 2 cảm biến, mỗi phép đo là một điểm <T>{'(z_1, z_2)'}</T> trên mặt phẳng; mỗi ứng viên k ứng với một điểm{' '}
        <T>{'\\boldsymbol h_k'}</T>. Quy tắc ML "chọn <T>{'\\boldsymbol h_k'}</T> gần z nhất" chia mặt phẳng thành các vùng,
        mỗi vùng gồm các điểm gần <T>{'\\boldsymbol h_k'}</T> hơn mọi <T>{'\\boldsymbol h_{k\'}'}</T> khác. Đó là{' '}
        <b>ô Voronoi</b>.
      </p>
      <Eq
        tex={
          'V_k^t = \\Big\\{\\boldsymbol x\\in\\mathbb R^{|S^t|} \\ \\Big|\\ \\lVert \\boldsymbol x - \\boldsymbol h_k^t\\rVert_2 \\le \\lVert \\boldsymbol x - \\boldsymbol h_{k\'}^t\\rVert_2,\\ \\forall k\'\\neq k\\in\\mathcal H^{t-1}\\Big\\}'
        }
      />
      <p>
        <b>Lemma 1.</b> Nếu mục tiêu không ở vùng chồng lấn và nằm trong nửa <T>{'\\mathcal H_m^t'}</T> (nửa đúng), thì
      </p>
      <Eq tex={'P_e^t = \\Pr\\Big(\\boldsymbol z^t \\notin \\bigcup_{\\boldsymbol k\\in\\mathcal H_m^t} V_k^t\\Big)'} />
      <p>
        Tức là: lỗi xảy ra khi và chỉ khi phép đo rơi vào ô của một ứng viên <b>không</b> thuộc nửa đúng. Nếu mục tiêu nằm
        trong vùng chồng lấn <T>{'\\mathcal H_1^t\\cap\\mathcal H_2^t'}</T> thì chọn nửa nào cũng đúng, nên{' '}
        <T>{'P_e^t = 0'}</T>.
      </p>
      <Example title="vẽ 8 ô Voronoi">
        <div className="grid md:grid-cols-[minmax(0,380px)_1fr] gap-4 items-start">
          <MeasureSpace alpha={0.1} />
          <div className="space-y-2">
            <p>
              Tám điểm <T>{'\\boldsymbol h_1,\\dots,\\boldsymbol h_8'}</T> và ô Voronoi của chúng (α = 0,1). Màu: xanh là chỉ
              thuộc H₁ = {'{1,2,3}'} phần riêng, tím là phần chung {'{4,5}'}, cam là chỉ thuộc H₂.
            </p>
            <p>
              Giả sử mục tiêu ở điểm 2 (chỉ thuộc H₁). Theo Lemma 1, lỗi khi z rơi vào ô của 6, 7 hoặc 8 (ô cam). Vì{' '}
              <T>{'\\boldsymbol h_2'}</T> nằm xa vùng cam, xác suất này nhỏ.
            </p>
            <p>
              Ngôi sao đỏ là phép đo ở ví dụ mục III: mục tiêu ở điểm 4 nhưng z rơi vào ô của điểm 5. Vì 5 thuộc phần
              chung, kết quả vẫn đúng khi α = 0,1.
            </p>
          </div>
        </div>
      </Example>
      <H3>Remark 1: tính xác suất này thế nào?</H3>
      <p>
        Mỗi ô Voronoi được giới hạn bởi các đường trung trực, nên là một đa diện lồi. Hợp các ô của nửa đúng là vùng "quyết
        định đúng". Muốn có <T>{'P_e^t'}</T> phải tìm biên của hợp này (bằng thuật toán hình học tính toán như của Fortune
        hoặc Guibas–Stolfi) rồi lấy tích phân mật độ Gauss của z trên phần bù. Dù nhiễu giữa các cảm biến độc lập, biên
        quyết định gấp khúc nên vẫn là tích phân Gauss nhiều chiều; trong thực tế phải tính số hoặc xấp xỉ. Mục IV-B tìm một
        trường hợp đặc biệt mà biên trở thành một đường thẳng duy nhất.
      </p>
      <p>
        <DemoLink href="#voronoi">Demo 3: ô Voronoi và Theorem 1</DemoLink>
      </p>
    </Sec>
  )
}

function Sec4B() {
  const k4 = EX.D[3] / EX.P.sigma
  const k2 = EX.D[1] / EX.P.sigma
  const H = EX.H
  return (
    <Sec id="gd-4b" kicker="Mục IV-B" title="Theorem 1: công thức đóng khi hai cảm biến đối xứng">
      <p>
        Đặt đúng <b>hai cảm biến đối xứng</b> nhau qua điểm giữa của chiều cắt. Khi đó mỗi ứng viên k có một "bạn đối xứng"
        k′ ở nửa bên kia, và cảm biến 1 nhìn k giống hệt cảm biến 2 nhìn k′:
      </p>
      <Eq tex={"h_{k,1} = h_{k',2},\\qquad h_{k,2} = h_{k',1}"} />
      <p>
        Trong mặt phẳng phép đo, <T>{'\\boldsymbol h_k'}</T> và <T>{"\\boldsymbol h_{k'}"}</T> là ảnh gương của nhau qua đường
        chéo <T>{'z_1 = z_2'}</T>. Vì vậy đường chéo trở thành biên quyết định duy nhất giữa hai nửa: <T>{'z_1 > z_2'}</T> thì
        mục tiêu "gần cảm biến 1 hơn" và chọn H₁, ngược lại chọn H₂.
      </p>
      <p>
        <b>Theorem 1.</b> Với hai cảm biến đối xứng và prior đều trên <T>{'\\mathcal H^{t-1}'}</T>:
      </p>
      <Eq
        tex={
          'P_e^t = \\frac{2}{n_x^{(t-1)}\\, n_y^{(t-1)}} \\sum_{\\boldsymbol k\\in\\mathcal H_1^t\\setminus\\mathcal H_2^t} Q\\!\\left(\\frac{d_k}{\\sigma}\\right),\\qquad d_k = \\frac{\\lVert \\boldsymbol h_k - \\boldsymbol h_{k\'}\\rVert_2}{2}'
        }
      />
      <Symbols
        rows={[
          ['Q(x)', 'xác suất một biến chuẩn tắc vượt quá x (diện tích đuôi phải). Q(0) = 0,5; Q(1) ≈ 0,159; Q(2) ≈ 0,023; Q(3) ≈ 0,001'],
          ['d_k', 'khoảng cách từ h_k tới đường chéo, bằng nửa khoảng cách tới ảnh gương h_k′'],
          ['\\mathcal H_1^t\\setminus\\mathcal H_2^t', 'phần riêng của H₁; điểm ở vùng chồng lấn có lỗi 0 nên không xuất hiện'],
          ['2 / (n_x n_y)', 'prior đều: mỗi điểm có xác suất 1/|H^{t−1}|; nhân 2 vì phần riêng của H₂ cho tổng bằng hệt do đối xứng'],
        ]}
      />
      <Idea>
        <p>
          Nhiễu chỉ gây lỗi khi nó đẩy z vượt qua đường chéo. Thành phần nhiễu vuông góc với đường chéo vẫn là Gauss với độ
          lệch chuẩn σ, nên xác suất vượt qua một khoảng <T>{'d_k'}</T> là <T>{'Q(d_k/\\sigma)'}</T>. Điểm càng xa đường chéo
          (cảm biến phân biệt được rõ) thì càng ít lỗi. Điểm gần ranh giới vị trí thường cũng gần đường chéo, và đó chính
          là các điểm mà chồng lấn đưa vào vùng chung để loại khỏi tổng.
        </p>
      </Idea>
      <Example title="tính Pₑᵗ bằng tay cho n = 8">
        <Table
          head={['k', 'x', 'hₖ', 'bạn k′', 'dₖ', 'Q(dₖ/σ)']}
          rows={EX.XS.map((x, i) => [
            i + 1,
            fx(x, 2),
            `(${fx(H[i][0])}; ${fx(H[i][1])})`,
            8 - i,
            fx(EX.D[i]),
            fx(EX.QK[i], 4),
          ])}
        />
        <p>
          Cặp 4 và 5 có d nhỏ nhất ({fx(EX.D[3])}): chúng sát ranh giới, rất dễ nhầm sang nhau.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <QFig t={k4} />
            <p className="text-slate-600">Điểm 4: d/σ = {fx(k4, 2)}, đuôi lớn, Q ≈ {fx(EX.QK[3], 3)}.</p>
          </div>
          <div>
            <QFig t={k2} />
            <p className="text-slate-600">Điểm 2: d/σ = {fx(k2, 2)}, đuôi nhỏ, Q ≈ {fx(EX.QK[1], 3)}.</p>
          </div>
        </div>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <b>α = 0</b>: phần riêng của H₁ là {'{1,2,3,4}'}:{' '}
            <T>{`P_e^t = \\tfrac{2}{8}(${EX.QK.slice(0, 4).map((q) => tx(q, 4)).join(' + ')}) \\approx ${tx(EX.pe0, 3)}`}</T>
          </li>
          <li>
            <b>α = 0,1</b>: phần riêng còn {'{1,2,3}'}; điểm 4 có Q lớn nhất đã vào vùng chung:{' '}
            <T>{`P_e^t = \\tfrac{2}{8}(${EX.QK.slice(0, 3).map((q) => tx(q, 4)).join(' + ')}) \\approx ${tx(EX.pe1, 3)}`}</T>
          </li>
        </ul>
        <p>Chồng lấn chỉ thêm 1 điểm mỗi bên nhưng giảm lỗi của bước này hơn một nửa.</p>
      </Example>
      <Example title="dₖ là khoảng cách tới đường chéo">
        <div className="grid md:grid-cols-[minmax(0,380px)_1fr] gap-4 items-start">
          <MeasureSpace alpha={0.1} showZ={false} showCells={false} showD={3} />
          <p>
            Đoạn đỏ là <T>{'d_4'}</T>: từ <T>{'\\boldsymbol h_4'}</T> vuông góc xuống đường chéo. Các cặp (1,8), (2,7), (3,6),
            (4,5) đối xứng nhau qua đường chéo, đúng như ý chứng minh ở Phụ lục B (bài báo minh họa điều này ở Fig. 6 với 16
            giả thuyết).
          </p>
        </div>
      </Example>

      <H3>Corollary 1: lưới rất mịn</H3>
      <p>
        Khi lưới đủ dày, tổng ở Theorem 1 thành tổng Riemann và hội tụ về tích phân trên phần riêng của H₁:
      </p>
      <Eq
        tex={
          'P_e^t = \\frac{2}{L_x^{t-1}L_y^{t-1}} \\int_{\\mathcal H_1^t\\setminus\\mathcal H_2^t} Q\\!\\left(\\frac{\\lVert \\boldsymbol h^t(\\boldsymbol x) - \\boldsymbol h^t(\\boldsymbol x\')\\rVert_2}{2\\sigma}\\right) d\\boldsymbol x'
        }
      />
      <p>
        Ở đây <T>{"\\boldsymbol x'"}</T> là điểm đối xứng của x theo chiều cắt và <T>{'\\boldsymbol h^t(\\boldsymbol x)'}</T> là
        bản liên tục của <T>{'\\boldsymbol h_k^t'}</T>. Ý nghĩa: kể cả với vùng liên tục, lỗi vẫn chỉ là tích phân một chiều
        của hàm Q, không cần tích phân Gauss nhiều chiều. Ví dụ hình học xem ở mục IV-C.
      </p>
    </Sec>
  )
}

function Sec4C() {
  const p = DEFAULT_PARAMS
  const cont = (a) => peStepContinuous(500, a, p, 'quarter')
  const dAtHalf = (a) => {
    const x = 500 * (0.5 - a)
    return Math.abs(f(Math.abs(125 - x), p) - f(Math.abs(375 - x), p)) / Math.SQRT2
  }
  return (
    <Sec id="gd-4c" kicker="Mục IV-C" title="Trường hợp một chiều: Corollary 2 và Remark 2">
      <p>
        Bài báo thu Algorithm 1 về một chiều để dễ hình dung. <T>{'\\mathcal H^0'}</T> là n điểm cách đều trên đoạn dài L,
        H₁ là các điểm <T>{'k \\le m^t + \\delta^t\\Delta'}</T>, H₂ là các điểm <T>{'k \\ge m^t - \\delta^t\\Delta'}</T>, với{' '}
        <T>{'\\Delta = L^0/n^{(0)}'}</T>. Hai cảm biến đặt đối xứng tại <T>{'\\{s^t,\\ L^{t-1}-s^t\\}'}</T>, với{' '}
        <T>{'L^{t-1}'}</T> là độ dài đoạn ở đầu bước t (tọa độ tính từ đầu đoạn).
      </p>
      <H3>Corollary 2 (a): lưới rời rạc</H3>
      <Eq
        tex={
          'P_e^t = \\frac{2}{n^{(t-1)}} \\sum_{k\\in\\mathcal H_1^t\\setminus\\mathcal H_2^t} Q\\!\\left(\\frac{d_k}{\\sigma}\\right) = \\frac{2}{n^{(t-1)}} \\sum_{k \\le m^t - \\delta^t\\Delta} Q\\!\\left(\\frac{d_k}{\\sigma}\\right),\\qquad d_k = \\tfrac12\\lVert \\boldsymbol h_k - \\boldsymbol h_{(L^{t-1}-k)}\\rVert_2'
        }
      />
      <p>
        Đây chính là Theorem 1 với <T>{'n_y = 1'}</T>; "bạn đối xứng" của k là <T>{'L^{t-1}-k'}</T>. Ví dụ ở mục IV-B là
        một trường hợp của công thức này.
      </p>
      <H3>Corollary 2 (b): giới hạn liên tục</H3>
      <Eq
        tex={
          'P_e^t = \\frac{2}{L^{t-1}} \\int_0^{L^{t-1}(\\frac12-\\alpha)} Q\\!\\left(\\frac{\\lVert \\boldsymbol h^t(x) - \\boldsymbol h^t(L^{t-1}-x)\\rVert_2}{2\\sigma}\\right) dx,\\qquad L^t = (\\tfrac12+\\alpha)L^{t-1}'
        }
      />
      <p>
        Phần riêng của H₁ là đoạn <T>{'[0,\\ L^{t-1}(\\tfrac12-\\alpha)]'}</T>. Tăng α làm cận trên của tích phân lùi về
        trái, cắt bỏ phần sát điểm giữa, nơi hàm Q lớn nhất.
      </p>
      <Example title="tổng rời rạc và tích phân (α = 0,1)">
        <RiemannFig alpha={0.1} />
        <p>
          Đường xanh là <T>{'Q(d(x)/\\sigma)'}</T> trên nửa trái đoạn [0, 250]; nó cao gần x = 250 (điểm giữa: hai cảm biến nhận
          tín hiệu gần bằng nhau), khá cao gần x = 0 (xa cả hai cảm biến nên tín hiệu đều yếu, chênh lệch nhỏ), và thấp
          gần cảm biến 1 tại x = 125. Vùng tô xanh là phần lấy tích phân
          (tới 200); ba khung cam là ba số hạng của tổng rời rạc với n = 8.
        </p>
        <p>
          Liên tục: <T>{`P_e^t \\approx ${tx(cont(0.1), 4)}`}</T>. Rời rạc n = 8: <T>{`P_e^t \\approx ${tx(EX.pe1, 4)}`}</T>. Hai
          số khác nhau vì 8 điểm còn quá thưa; khi n tăng, tổng tiến về tích phân (Corollary 1).
        </p>
      </Example>
      <H3>Remark 2: tăng α thêm một chút thì lợi bao nhiêu?</H3>
      <p>Giữ cảm biến cố định và lấy đạo hàm theo α (đạo hàm cận trên của tích phân):</p>
      <Eq tex={'\\frac{\\partial P_e^t}{\\partial \\alpha} = -2\\,Q\\!\\left(\\frac{d\\big(L^{t-1}(\\tfrac12-\\alpha)\\big)}{\\sigma}\\right),\\qquad d(x) = \\frac{\\lVert \\boldsymbol h(x) - \\boldsymbol h(L^{t-1}-x)\\rVert_2}{2}'} />
      <p>
        Vì <T>{'d(x)\\ge 0'}</T>, đạo hàm luôn âm: thêm chồng lấn không bao giờ làm lỗi một bước tăng lên. Mức giảm mạnh nhất
        ở α = 0, khi điểm cắt nằm đúng điểm giữa, <T>{'d = 0'}</T>, và đạo hàm bằng <T>{'-2Q(0) = -1'}</T>. Sau đó các điểm
        bị cắt bỏ ngày càng xa ranh giới (d lớn, Q nhỏ), nên lợi ích giảm dần.
      </p>
      <Example title="độ dốc theo α (cảm biến L/4, 3L/4)">
        <Table
          head={['α', 'Pₑᵗ (liên tục)', 'd tại điểm cắt', 'độ dốc −2Q(d/σ)']}
          rows={[0, 0.05, 0.1, 0.15, 0.2].map((a) => [
            fx(a, 2),
            fx(cont(a), 4),
            fx(dAtHalf(a)),
            fx(-2 * Q(dAtHalf(a) / p.sigma), 3),
          ])}
        />
        <p>
          Từ α = 0 lên 0,05, <T>{'P_e^t'}</T> giảm khoảng 0,045; từ 0,15 lên 0,2 chỉ giảm khoảng 0,005. Một chút chồng lấn đã
          đem lại phần lớn lợi ích.
        </p>
      </Example>
      <p>
        <DemoLink href="#voronoi">Demo 4: Pₑᵗ theo α</DemoLink>
      </p>
    </Sec>
  )
}

function Sec5() {
  const beta = (a) => (Math.log(1) - Math.log(1e5)) / Math.log(0.5 + a)
  const sim = (a) => sizeChain(1e5, a).length - 1
  const p = DEFAULT_PARAMS
  return (
    <Sec id="gd-5" kicker="Mục V" title="Đánh giá số">
      <p>Phần thực nghiệm tập trung vào trường hợp 1D, với bốn câu hỏi.</p>
      <H3>1. Chồng lấn và lỗi một bước (Fig. 2)</H3>
      <p>
        Vẽ <T>{'P_e^t'}</T> theo α với n = 8, 16, …, 128 và cảm biến cố định ở <T>{'L^{t-1}/4'}</T>, <T>{'3L^{t-1}/4'}</T>.
        Lỗi giảm khi α tăng, nhưng có một đoạn ở giữa gần như <b>phẳng</b>. Bài báo giải thích đoạn phẳng đến từ cách đặt
        cảm biến và hàm truyền f, và cho thấy lỗi giảm đều nếu đặt cảm biến theo α (câu hỏi 4).
      </p>
      <H3>2. Chồng lấn và độ sâu cây (Eq. 6, Fig. 7)</H3>
      <p>
        Mỗi bước giữ khoảng <T>{'(\\tfrac12+\\alpha)'}</T> số điểm, nên sau β bước còn{' '}
        <T>{'n^{(0)}(\\tfrac12+\\alpha)^\\beta \\approx n^{(\\beta)}'}</T>. Lấy log hai vế:
      </p>
      <Eq tex={'\\beta \\approx \\mathrm{round}\\left(\\frac{\\log n^{(\\beta)} - \\log n^{(0)}}{\\log(\\frac12+\\alpha)}\\right)'} n="6" />
      <p>
        Bản liên tục: <T>{'\\beta = \\dfrac{\\log L^\\beta - \\log L}{\\log(\\frac12+\\alpha)}'}</T>. Fig. 7 cho thấy xấp xỉ
        này khớp tốt với số bước thật khi chạy quy tắc (3) với <T>{'n^{(0)} = 100\\,000'}</T> và <T>{'n^{(\\beta)} = 1'}</T>.
      </p>
      <Example title="n⁽⁰⁾ = 100 000, đi tới 1 điểm">
        <Table
          head={['α', 'công thức (6) trước khi làm tròn', 'β theo (6)', 'β chạy quy tắc (3)']}
          rows={[0, 0.1, 0.2].map((a) => [fx(a, 1), fx(beta(a), 2), Math.round(beta(a)), sim(a)])}
        />
        <p>
          α = 0,1 tốn thêm khoảng 6 bước so với binary search thường (17 bước); α = 0,2 gần gấp đôi. Đây là giá phải trả
          cho độ tin cậy.
        </p>
      </Example>
      <H3>3. Lỗi tổng và độ sâu (Fig. 4)</H3>
      <p>
        Kết hợp Eq. (1) với cảm biến đặt theo <T>{'s^t = \\frac{L^{t-1}}{2}(\\frac12-\\alpha)'}</T>, đi từ{' '}
        <T>{'n^{(0)} = 2^{14}'}</T> tới <T>{'n^{(\\beta)} = 2^7'}</T>. Với mỗi β mong muốn, α được chỉnh tương ứng. Có hai
        lực ngược nhau: thêm bước là thêm thừa số trong tích (1), tức thêm cơ hội sai; nhưng mỗi <T>{'P_e^t'}</T> giảm mạnh.
        Kết quả: chỉ một chút chồng lấn đã giảm nhanh lỗi tổng, và lỗi tổng giảm đều theo dạng log khi độ sâu tăng.
      </p>
      <H3>4. Đặt cảm biến ở đâu là tốt nhất? (Fig. 3, Fig. 5)</H3>
      <p>
        <T>{'P_e^t'}</T> không trơn theo vị trí cảm biến, nên bài báo dùng giải thuật tiến hóa (EA) để tìm vị trí tối ưu, rồi
        so với một luật đơn giản: đặt mỗi cảm biến ở <b>giữa phần riêng</b> của mỗi nửa, tức trong các đoạn{' '}
        <T>{'[0,\\ L^{t-1}(\\frac12-\\alpha)]'}</T> và <T>{'[L^{t-1}(\\frac12+\\alpha),\\ L^{t-1}]'}</T>:
      </p>
      <Eq tex={'s^t = \\frac{L^{t-1}}{2}\\left(\\frac12 - \\alpha\\right)'} />
      <p>
        Luật này xấp xỉ tốt kết quả EA, nhất là khi α lớn. Với luật này, <T>{'P_e^t'}</T> giảm đều theo α, không còn đoạn
        phẳng (Fig. 5).
      </p>
      <Example title="cảm biến cố định và cảm biến theo α (liên tục, L = 500)">
        <Table
          head={['α', 'cảm biến L/4, 3L/4', 's = (L/2)(½ − α)', 'vị trí s']}
          rows={[0, 0.05, 0.1, 0.15, 0.2].map((a) => [
            fx(a, 2),
            fx(peStepContinuous(500, a, p, 'quarter'), 4),
            fx(peStepContinuous(500, a, p, 'exclusive'), 4),
            fx(250 * (0.5 - a), 1),
          ])}
        />
        <p>
          Khi α tăng, phần riêng co lại về phía mép, và cảm biến "đi theo" phần riêng đó nên vẫn phân biệt tốt các điểm còn
          phải phân biệt. Tại α = 0,2, lỗi chỉ còn khoảng một nửa so với cảm biến cố định. (Ví dụ dùng σ = 1/√2 của Bảng I;
          bài báo không ghi σ của Fig. 5, xem giả định G7 trong drawer của Demo 4.)
        </p>
      </Example>
      <p className="flex flex-wrap gap-2">
        <DemoLink href="#voronoi">Demo 4: so sánh hai cách đặt cảm biến</DemoLink>
      </p>
    </Sec>
  )
}

function Sec6() {
  return (
    <Sec id="gd-6" kicker="Mục VI" title="Kết luận và hướng mở">
      <p>
        Bài báo đề xuất binary search với phân hoạch chồng lấn: giữ nguyên cấu trúc chia đôi đệ quy, nhưng cho các phần giao
        nhau có kiểm soát để giảm quyết định sai; α là tham số cân bằng giữa độ bền với nhiễu và hiệu quả. Phương pháp áp
        dụng cho các bài toán quyết định tuần tự có nhiễu, được minh họa bằng định vị trong mạng cảm biến, và có thể dùng cho
        chẩn đoán y khoa hay crowdsourcing.
      </p>
      <p>Các hướng mở bài báo nêu:</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>số phép đo thích nghi ở mỗi bước;</li>
        <li>mở rộng cho không gian nhiều chiều với ràng buộc tính toán;</li>
        <li>điều chỉnh α động theo độ tin cậy hoặc mức nhiễu;</li>
        <li>bảo đảm lý thuyết cho cảm biến đặt không đối xứng;</li>
        <li>mô hình nhiễu tổng quát hơn: không Gauss, không log-chuẩn, có tương quan.</li>
      </ul>
      <p>
        <DemoLink href="#review">Tab Đánh giá: vấn đề và hướng cải thiện</DemoLink>
      </p>
    </Sec>
  )
}

function AppA() {
  return (
    <Sec id="gd-pa" kicker="Phụ lục A" title="Chứng minh Lemma 1: từ ML tới ô Voronoi">
      <p>
        <b>Bước 1.</b> Nhiễu độc lập, Gauss, cùng σ, nên hàm hợp lý là tích các mật độ chuẩn:
      </p>
      <Eq tex={'p(\\boldsymbol z^t\\mid l_T = \\boldsymbol k) = \\prod_{j=1}^{|S^t|} \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\!\\left(-\\frac{(z_j^t - h_{k,j}^t)^2}{2\\sigma^2}\\right)'} />
      <p>
        <b>Bước 2.</b> Lấy log, tích thành tổng:
      </p>
      <Eq tex={'\\ell(\\boldsymbol k) = -\\frac{1}{2\\sigma^2}\\sum_{j=1}^{|S^t|}\\big(z_j^t - h_{k,j}^t\\big)^2 - \\frac{|S^t|}{2}\\log(2\\pi\\sigma^2)'} />
      <p>
        <b>Bước 3.</b> Số hạng thứ hai không phụ thuộc k, và <T>{'-1/(2\\sigma^2) < 0'}</T>, nên ℓ lớn nhất khi tổng bình
        phương nhỏ nhất:
      </p>
      <Eq tex={'\\boldsymbol k^t_{\\mathrm{ML}} = \\arg\\min_{\\boldsymbol k\\in\\mathcal H^{t-1}} \\lVert \\boldsymbol z^t - \\boldsymbol h_k^t\\rVert_2^2'} />
      <p>
        <b>Bước 4.</b> "Chọn <T>{'\\boldsymbol h_k'}</T> gần z nhất" chính là định nghĩa ô Voronoi. Khai triển{' '}
        <T>{"\\lVert \\boldsymbol x - \\boldsymbol h_k\\rVert^2 \\le \\lVert \\boldsymbol x - \\boldsymbol h_{k'}\\rVert^2"}</T>, số
        hạng <T>{'\\lVert\\boldsymbol x\\rVert^2'}</T> triệt tiêu, còn lại một bất đẳng thức tuyến tính theo x, tức một nửa mặt
        phẳng:
      </p>
      <Eq tex={"V_k^t = \\Big\\{\\boldsymbol x \\ \\Big|\\ \\boldsymbol x^\\top(\\boldsymbol h_k^t - \\boldsymbol h_{k'}^t) \\ge \\tfrac12\\big(\\lVert \\boldsymbol h_k^t\\rVert_2^2 - \\lVert \\boldsymbol h_{k'}^t\\rVert_2^2\\big),\\ \\forall k'\\neq k\\Big\\}"} />
      <p>
        <b>Bước 5.</b> Quyết định đúng khi ứng viên ML thuộc nửa đúng <T>{'\\mathcal H_m^t'}</T>, tức z rơi vào hợp các ô của
        nửa đó. Lấy phần bù được Lemma 1.
      </p>
      <Example title="kiểm tra bước 4 với hai điểm">
        <p>
          Với <T>{'\\boldsymbol h_4'}</T> và <T>{'\\boldsymbol h_5'}</T> (ảnh gương của nhau), vế phải bằng 0 vì hai vector cùng độ
          dài, và <T>{`\\boldsymbol h_4 - \\boldsymbol h_5 = (${tx(EX.H[3][0] - EX.H[4][0])},\\ ${tx(EX.H[3][1] - EX.H[4][1])})`}</T>{' '}
          tỉ lệ với (1, −1). Nửa mặt phẳng là <T>{'z_1 - z_2 \\ge 0'}</T>: biên giữa hai ô chính là đường chéo. Hình Voronoi ở
          mục IV-A được vẽ đúng bằng cách cắt lần lượt theo các nửa mặt phẳng này.
        </p>
      </Example>
    </Sec>
  )
}

function AppB() {
  return (
    <Sec id="gd-pb" kicker="Phụ lục B" title="Chứng minh Theorem 1: chiếu nhiễu lên một phương">
      <p>
        <b>Bước 1: đối xứng.</b> Nếu <T>{'s_1 = (u, v)'}</T> thì cảm biến 2 là ảnh gương qua trục giữa của chiều cắt:
      </p>
      <Eq tex={'s_2 = \\begin{cases}(u,\\ L_y^t - v) & d^t = y\\\\ (L_x^t - u,\\ v) & d^t = x\\end{cases}'} />
      <p>Mỗi ứng viên k = (u, v) có bạn đối xứng k′ theo cùng quy tắc, và bạn này luôn tồn tại, duy nhất do lưới đều:</p>
      <Eq tex={"\\boldsymbol k' = \\begin{cases}(u,\\ L_y^t - v) & d^t = y\\\\ (L_x^t - u,\\ v) & d^t = x\\end{cases},\\qquad h_{k,1} = h_{k',2},\\ \\ h_{k,2} = h_{k',1}"} n="7" />
      <p>
        <b>Bước 2: biên là một siêu phẳng.</b> Do tính đối xứng, biên giữa H₁ và H₂ là trục đối xứng{' '}
        <T>{'\\boldsymbol w^\\top \\boldsymbol z = b'}</T> với <T>{'\\boldsymbol w = \\tfrac{1}{\\sqrt2}[1,\\ -1]^\\top,\\ b = 0'}</T>,
        tức đường chéo <T>{'z_1 = z_2'}</T>.
      </p>
      <p>
        <b>Bước 3: một chiều hóa.</b> Nếu mục tiêu ở k thì <T>{'\\boldsymbol z = \\boldsymbol h_k + \\boldsymbol\\eta'}</T>,{' '}
        <T>{'\\boldsymbol\\eta\\sim\\mathcal N(0,\\sigma^2 I)'}</T>. Chỉ thành phần nhiễu theo phương <T>{'\\boldsymbol w'}</T>{' '}
        mới đẩy z qua biên; thành phần này là <T>{'\\eta_\\perp = \\boldsymbol w^\\top\\boldsymbol\\eta \\sim \\mathcal N(0,\\sigma^2)'}</T>{' '}
        vì w có độ dài 1. Khoảng cách từ <T>{'\\boldsymbol h_k'}</T> tới biên là <T>{"d_k = \\lVert \\boldsymbol h_k - \\boldsymbol h_{k'}\\rVert_2/2"}</T>,
        nên:
      </p>
      <Eq tex={'\\Pr(l_T\\notin\\mathcal H^t \\mid l_T = \\boldsymbol k) = \\Pr(\\eta_\\perp \\ge d_k) = Q\\!\\left(\\frac{d_k}{\\sigma}\\right)'} />
      <p>(hoặc <T>{'\\eta_\\perp \\le -d_k'}</T>, tùy <T>{'\\boldsymbol h_k'}</T> nằm phía nào của biên; xác suất như nhau).</p>
      <p>
        <b>Bước 4: lấy trung bình theo prior đều.</b> Điểm trong vùng chồng lấn có lỗi 0. Phần riêng của H₂ cho tổng bằng
        phần riêng của H₁ do đối xứng, nên:
      </p>
      <Eq
        tex={
          'P_e^t = \\frac{1}{|\\mathcal H^{t-1}|}\\Big(\\sum_{\\mathcal H_1\\setminus\\mathcal H_2} + \\sum_{\\mathcal H_2\\setminus\\mathcal H_1}\\Big) Q\\!\\left(\\frac{d_k}{\\sigma}\\right) = \\frac{2}{n_x^{(t-1)} n_y^{(t-1)}}\\sum_{\\boldsymbol k\\in\\mathcal H_1^t\\setminus\\mathcal H_2^t} Q\\!\\left(\\frac{d_k}{\\sigma}\\right)'
        }
      />
      <Example title="kiểm tra dₖ = khoảng cách tới đường chéo">
        <p>
          Khoảng cách từ điểm <T>{'(a, b)'}</T> tới đường <T>{'z_1 = z_2'}</T> là <T>{'|a - b|/\\sqrt2'}</T>. Với{' '}
          <T>{`\\boldsymbol h_4 = (${tx(EX.H[3][0])},\\ ${tx(EX.H[3][1])})`}</T>:{' '}
          <T>{`|${tx(EX.H[3][0])} - ${tx(EX.H[3][1])}|/\\sqrt2 \\approx ${tx(Math.abs(EX.H[3][0] - EX.H[3][1]) / Math.SQRT2)}`}</T>.
          Còn <T>{`\\lVert\\boldsymbol h_4 - \\boldsymbol h_5\\rVert/2 = \\sqrt{2}\\,|${tx(EX.H[3][0])} - ${tx(EX.H[3][1])}|/2`}</T>{' '}
          cũng bằng {fx(EX.D[3])}. Hai cách tính trùng nhau.
        </p>
      </Example>
    </Sec>
  )
}

function AppC() {
  return (
    <Sec id="gd-pc" kicker="Phụ lục C" title="Chứng minh Corollary 1: tổng Riemann">
      <p>
        Xét chiều cắt là y (chiều x tương tự). Khi lưới đủ mịn, quy tắc (3) gần như{' '}
        <T>{'n^{(t)}_{d^t} = (\\tfrac12+\\alpha)n^{(t-1)}_{d^t}'}</T>, nên phần riêng của H₁ chiếm{' '}
        <T>{'(\\tfrac12-\\alpha)n_y^{(t-1)}'}</T> hàng. Nhân và chia cho diện tích một ô{' '}
        <T>{'\\Delta k_x\\Delta k_y = \\frac{L_x^{t-1}}{n_x^{(t-1)}}\\cdot\\frac{L_y^{t-1}}{n_y^{(t-1)}}'}</T>:
      </p>
      <Eq
        tex={
          'P_e^t = \\frac{2}{L_x^{t-1}L_y^{t-1}} \\sum_{k_x=0}^{n_x^{(t-1)}} \\ \\sum_{k_y=0}^{(\\frac12-\\alpha)n_y^{(t-1)}} Q\\!\\left(\\frac{d(\\boldsymbol k)}{\\sigma}\\right)\\Delta k_x\\,\\Delta k_y'
        }
        n="8"
      />
      <p>
        Đây là tổng Riemann: mỗi số hạng là "chiều cao × diện tích ô". Với f đủ đều, d liên tục, bị chặn và khả tích, nên
        khi số điểm lưới tiến ra vô cùng tổng hội tụ về tích phân:
      </p>
      <Eq
        tex={
          '\\lim P_e^t = \\frac{2}{L_x^{t-1}L_y^{t-1}} \\int_0^{L_x^{t-1}}\\!\\!\\int_0^{(\\frac12-\\alpha)L_y^{t-1}} Q\\!\\left(\\frac{d(\\boldsymbol k)}{\\sigma}\\right) dk_y\\, dk_x'
        }
      />
      <p>
        Trong hình ở mục IV-C, mỗi khung cam là một số hạng của (8) trong 1D; khi n tăng, các khung hẹp lại và ôm sát vùng
        dưới đường cong.
      </p>
    </Sec>
  )
}

function AppD() {
  return (
    <Sec id="gd-pd" kicker="Phụ lục D" title="Tham số thực nghiệm">
      <p>Mọi thực nghiệm dùng hàm truyền (9). Ba bảng tham số của bài báo, viết lại:</p>
      <H3>Bảng I: Fig. 2 (lỗi một bước theo α)</H3>
      <Table
        head={['Tham số', 'Giá trị', 'Ý nghĩa']}
        rows={[
          ['L^{t−1}', '500', 'độ dài vùng tìm kiếm'],
          ['n', '8, 16, 32, 64, 128', 'số giả thuyết còn lại ở bước t'],
          ['P₀', '20', 'cường độ tham chiếu (dB)'],
          ['η', '1', 'số mũ suy hao'],
          ['σ', '1/√2', 'độ lệch chuẩn nhiễu'],
          ['ϵ', '10', 'hằng số tránh log(0)'],
          ['α', '[0; 0,5]', 'lấy mẫu đều'],
          ['Sᵗ (rời rạc)', '⌊n/4⌋, ⌊3n/4⌋', 'chỉ số điểm đặt cảm biến'],
          ['Sᵗ (liên tục)', 'L/4, 3L/4', 'khi n → ∞'],
        ]}
      />
      <p>
        Bài báo lưu ý: α &lt; ¼ chỉ cần để quy tắc (3) đi tới được n = 1; bản thân Theorem 1 đúng với α ∈ [0; 0,5], nên Fig.
        2 và Fig. 5 vẽ trên khoảng này.
      </p>
      <H3>Bảng II: Fig. 4 (lỗi tổng theo độ sâu)</H3>
      <Table
        head={['Tham số', 'Giá trị', 'Ý nghĩa']}
        rows={[
          ['P₀, η, ϵ', '20; 1; 10', 'như Bảng I'],
          ['σ', '0,2', 'độ lệch chuẩn nhiễu'],
          ['n⁽⁰⁾ → n⁽ᵝ⁾', '2¹⁴ → 2⁷', 'kích thước đầu và cuối'],
          ['β', '[14; 33]', 'khoảng độ sâu'],
          ['L⁰', '500', 'độ dài ban đầu'],
          ['Sᵗ', '⌊(½ − α)n⁽ᵗ⁻¹⁾⌋, ⌊(3/2 + α)n⁽ᵗ⁻¹⁾⌋ (ghi như trong bảng)', 'đổi theo α'],
        ]}
      />
      <p className="text-sm text-slate-500">
        Biểu thức Sᵗ của Bảng II không khớp trực tiếp với luật <T>{'s^t = \\frac{L^{t-1}}{2}(\\frac12-\\alpha)'}</T> nêu ở mục
        V; trang này chỉ ghi lại đúng như bảng.
      </p>
      <H3>Bảng III: Fig. 3 (tối ưu vị trí cảm biến bằng EA)</H3>
      <Table
        head={['Tham số', 'Giá trị']}
        rows={[
          ['L^{t−1}; P₀; η', '500; 20; 1'],
          ['σ', '1'],
          ['ϵ', '10⁻⁴'],
          ['Quần thể; số thế hệ', '50; 50'],
          ['Đột biến', 'Gauss (μ = 0, σ = 10), xác suất 0,2, xác suất mỗi gen 0,2'],
          ['Lai ghép', 'Blend (alpha 0,5), xác suất 0,5'],
          ['Chọn lọc', 'Tournament, kích thước 3'],
        ]}
      />
      <H3>Fig. 7</H3>
      <p>
        So sánh độ sâu β tính bằng cách chạy quy tắc (3) từ <T>{'n^{(0)} = 100\\,000'}</T> với xấp xỉ (6); xem ví dụ ở mục V.
      </p>
      <Callout type="info">
        Các ví dụ trên trang này dùng mô hình và tham số Bảng I. Những chỗ bài báo không nói rõ mà demo phải tự chọn được
        liệt kê trong mục "Giả định của demo" ở drawer lý thuyết của từng demo.
      </Callout>
    </Sec>
  )
}
