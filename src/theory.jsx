// Nội dung drawer lý thuyết của từng demo (mở bằng nút 📖). Mọi nội dung bám theo bài báo
// arXiv:2504.20513v2, có ghi mục / phương trình tương ứng. Những chỗ bài báo không nói rõ mà demo
// buộc phải chọn được liệt kê riêng trong mục "Giả định của demo".
import { Callout, DSection, TeX } from './components/ui'

const ASSUMPTIONS = {
  G1: (
    <>
      <b>Miền cộng nhiễu.</b> Mục II nói z có thể là cường độ tín hiệu tính bằng dB, còn Eq. (9) định nghĩa f qua{' '}
      <TeX>{'10\\log_{10} f(d) = P_0 - 10\\eta\\log_{10}(d+\\epsilon)'}</TeX>. Demo dùng f ở miền tuyến tính,{' '}
      <TeX>{'f(d)=10^{P_0/10}/(d+\\epsilon)^\\eta'}</TeX>, và cộng nhiễu vào f. Lý do: cách này cho độ lớn{' '}
      <TeX>{'P_e^t'}</TeX> khớp Fig. 2 (khoảng 0,17 tại α = 0).
    </>
  ),
  G2: (
    <>
      <b>Phá hòa.</b> Khi giả thuyết có ℓ lớn nhất nằm trong vùng chồng lấn, hai nửa ở Eq. (5) bằng điểm nhau; bài báo
      không nói cách chọn. Demo chọn <TeX>{'H_1'}</TeX> nếu <TeX>{'z_1 \\ge z_2'}</TeX>, ngược lại{' '}
      <TeX>{'H_2'}</TeX>, tức theo biên quyết định <TeX>{'w^\\top z = 0'}</TeX> trong chứng minh Theorem 1 (Phụ lục B).
    </>
  ),
  G3: (
    <>
      <b>Cảm biến trong 2D.</b> Phụ lục B chỉ cho <TeX>{'s_1=(u,v)'}</TeX> và <TeX>{'s_2'}</TeX> đối xứng với nó qua
      trục giữa của chiều cắt. Demo đặt tọa độ của chiều còn lại tại tâm vùng hiện tại.
    </>
  ),
  G4: (
    <>
      <b>Vị trí L/4, 3L/4 trên lưới rời rạc.</b> Bảng I ghi lưới rời rạc đặt cảm biến tại chỉ số{' '}
      <TeX>{'\\lfloor n/4\\rfloor, \\lfloor 3n/4\\rfloor'}</TeX> và trường hợp liên tục tại L/4, 3L/4. Demo dùng vị trí
      liên tục L/4, 3L/4 để cảm biến đối xứng đúng như Theorem 1 yêu cầu.
    </>
  ),
  G5: (
    <>
      <b>Chiều cắt khi hai chiều dài bằng nhau.</b> Bài báo không nêu; demo chọn chiều x.
    </>
  ),
  G6: (
    <>
      <b>Tham số 2D.</b> Bài báo không có thực nghiệm 2D; demo dùng lưới vuông với{' '}
      <TeX>{'L_x = L_y = 500'}</TeX> (L của Bảng I).
    </>
  ),
  G7: (
    <>
      <b>σ của Fig. 5.</b> Bài báo không ghi; demo dùng chung σ với Fig. 2 (Bảng I: <TeX>{'\\sigma = 1/\\sqrt2'}</TeX>).
    </>
  ),
}

function Assumptions({ ids }) {
  return (
    <DSection title="Giả định của demo (bài báo không nói rõ)">
      <ul className="list-disc ml-5 space-y-2">
        {ids.map((id) => (
          <li key={id}>{ASSUMPTIONS[id]}</li>
        ))}
      </ul>
    </DSection>
  )
}

// ---------------- Demo 1: cây phân hoạch (mục I, Fig. 1) ----------------
function Demo1Theory() {
  return (
    <>
      <DSection title="Vấn đề (Tóm tắt, mục I)">
        <p>
          Bài báo xét binary search khi các quyết định bị nhiễu, với ví dụ ứng dụng như chẩn đoán y khoa, đọc cảm biến,
          hệ thống gợi ý và crowdsourcing. Khi có nhiễu, cách chia thành hai nửa <b>rời nhau</b> của binary search dễ bị{' '}
          <b>lan truyền lỗi</b> (error propagation).
        </p>
        <p>
          Các công trình trước chống nhiễu bằng lặp truy vấn hoặc cập nhật xác suất, nhưng theo bài báo thường thiếu cơ
          chế tường minh để điều khiển đánh đổi giữa xác suất lỗi và độ phức tạp tìm kiếm, và một số chỉ có bảo đảm
          tiệm cận.
        </p>
      </DSection>
      <DSection title="Ý tưởng: phân hoạch chồng lấn (mục I, III)">
        <p>
          Bài báo cho hai phần được xét ở mỗi bước <b>chồng lấn</b> nhau. Nhờ đó mục tiêu ít bị loại do nhiễu hơn, đổi lại
          cần thêm bước tìm kiếm. Ví dụ ở Fig. 1 với n = 8: không chồng lấn thì độ sâu cây là{' '}
          <TeX>{'\\log_2 8 = 3'}</TeX>; chồng lấn như Fig. 1b thì độ sâu tăng lên 4.
        </p>
        <p>Mức chồng lấn được điều khiển bởi α qua quy tắc (3):</p>
        <TeX block>{'n^{(t)}_{d^t} = \\max\\!\\Big(\\mathrm{round}\\big((\\tfrac12+\\alpha)\\,n^{(t-1)}_{d^t}\\big),\\ \\mathrm{ceil}\\big(\\tfrac12 n^{(t-1)}_{d^t}\\big)\\Big),\\qquad \\alpha\\in[0,\\tfrac14)'}</TeX>
        <p>
          round làm tròn tới số nguyên gần nhất, khi cách đều thì về số chẵn; điều kiện α &lt; ¼ bảo đảm hội tụ khi
          n<sup>(t)</sup> nhỏ. Độ sâu cây xấp xỉ theo (6) (mục V):
        </p>
        <TeX block>{'\\beta \\approx \\mathrm{round}\\left(\\frac{\\log n^{(\\beta)}-\\log n^{(0)}}{\\log(\\tfrac12+\\alpha)}\\right)'}</TeX>
      </DSection>
      <DSection title="Ba đại lượng đánh đổi (mục I, II)">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <b>Độ sâu β</b>: số bước quyết định, tức độ sâu cây.
          </li>
          <li>
            <b>Kích thước |Hᵝ|</b>: số ứng viên còn lại ở đầu ra. Bài báo so sánh với list decoding: có thể chỉ cần thu
            hẹp vị trí mục tiêu về một tập ứng viên.
          </li>
          <li>
            <b>Xác suất lỗi Pₑ</b>: xác suất mục tiêu bị loại khỏi Hᵝ, theo Eq. (1):{' '}
            <TeX>{'P_e = 1-\\prod_{t=1}^{\\beta}(1-P_e^t)'}</TeX>.
          </li>
        </ul>
      </DSection>
      <DSection title="Cách đọc Demo 1">
        <p>
          Các nút chứa mục tiêu được tô <span className="text-emerald-700 font-semibold">xanh lá</span>. "Bước an toàn"
          là bước mà mục tiêu nằm trong vùng chồng lấn <TeX>{'H_1\\cap H_2'}</TeX>; theo ghi chú sau Lemma 1, khi đó{' '}
          <TeX>{'P_e^t = 0'}</TeX>. Các nút trùng nhau ở cùng mức được vẽ gộp lại như Fig. 1b.
        </p>
        <Callout type="warn" title="Giả định của demo">
          Bài báo chỉ cho ví dụ n = 8 ở Fig. 1. Demo dựng cây cho mọi n, α bằng quy tắc (3); với n = 8 và α trong
          khoảng (0,0625; 0,1875), cây trùng với Fig. 1b.
        </Callout>
      </DSection>
    </>
  )
}

// ---------------- Demo 2: bài toán (mục II) + Algorithm 1 (mục III) ----------------
function Demo2Theory() {
  return (
    <>
      <DSection title="Bài toán: định vị vùng chứa mục tiêu (mục II)">
        <p>
          Một nguồn tín hiệu đứng yên tại vị trí chưa biết <TeX>{'l_T \\in \\mathcal H^0 \\subseteq \\mathbb R^d'}</TeX>.
          Nhiều cảm biến được rải trong vùng; ở mỗi bước t có thể kích hoạt một tập{' '}
          <TeX>{'S^t = \\{s^t_1,\\dots,s^t_{|S^t|}\\}'}</TeX>, với |S<sup>t</sup>| có thể bị giới hạn bởi tài nguyên.
          Mỗi cảm biến đo được:
        </p>
        <TeX block>{'z^t_j = f\\big(\\lVert s^t_j - l_T\\rVert_2\\big) + \\eta^t_j,\\qquad \\eta^t_j\\sim\\mathcal N(0,\\sigma^2)'}</TeX>
        <p>
          Với mỗi giả thuyết k (một vị trí có thể của mục tiêu), <TeX>{'h_{k,i}^t = f(\\lVert s^t_i - k\\rVert_2)'}</TeX>{' '}
          là phép đo kỳ vọng của cảm biến i. Bài báo làm việc trên lưới 2D:
        </p>
        <TeX block>{'\\mathcal H^0=\\Big\\{\\Big(\\tfrac{(2i-1)L^0_x}{2n^{(0)}_x},\\tfrac{(2j-1)L^0_y}{2n^{(0)}_y}\\Big)\\Big\\}'}</TeX>
        <p>
          Thuật toán chạy β bước hoặc tới khi vùng đủ nhỏ. Xác suất lỗi tổng, với{' '}
          <TeX>{'P_e^t=\\Pr\\{l_T\\notin\\mathcal H^t \\mid l_T\\in\\mathcal H^{t-1}\\}'}</TeX>:
        </p>
        <TeX block>{'P_e = \\Pr\\{l_T\\notin\\mathcal H^\\beta\\} = 1-\\prod_{t=1}^{\\beta}\\big(1-P_e^t\\big)\\qquad(1)'}</TeX>
      </DSection>
      <DSection title="Algorithm 1 (mục III)">
        <p>
          <b>Dòng 3: phân hoạch.</b> Chọn chiều dài nhất <TeX>{'d^t'}</TeX> của <TeX>{'\\mathcal H^{t-1}'}</TeX> và điểm
          giữa <TeX>{'m^t_{d^t}'}</TeX> theo chiều đó, rồi tạo hai nửa chồng lấn:
        </p>
        <TeX block>{'\\begin{aligned}H_1^t&=\\{k\\in\\mathcal H^{t-1}: k_{d^t}\\le m^t_{d^t}+\\delta^t\\Delta_{d^t}\\}\\\\ H_2^t&=\\{k\\in\\mathcal H^{t-1}: k_{d^t}\\ge m^t_{d^t}-\\delta^t\\Delta_{d^t}\\}\\end{aligned}\\qquad(2)'}</TeX>
        <p>
          với <TeX>{'\\Delta_{d^t}=L^0_{d^t}/n^{(0)}_{d^t}'}</TeX> là bước lưới và <TeX>{'\\delta^t'}</TeX> chọn theo quy
          tắc (3).
        </p>
        <p>
          <b>Dòng 4: đo.</b> Kích hoạt cảm biến và thu <TeX>{'z^t'}</TeX>. Mục IV-C kích hoạt hai cảm biến đối xứng tại{' '}
          <TeX>{'\\{s^t, L^{t-1}-s^t\\}'}</TeX>; mục V dùng <TeX>{'s^t=\\tfrac{L^{t-1}}{2}(\\tfrac12-\\alpha)'}</TeX>, còn Fig. 2
          dùng <TeX>{'s^t = L^{t-1}/4'}</TeX>.
        </p>
        <p>
          <b>Dòng 5: likelihood (Eq. 4)</b> cho mọi <TeX>{'k\\in\\mathcal H^{t-1}'}</TeX>:
        </p>
        <TeX block>{'\\ell(k)=\\sum_{j=1}^{|S^t|}\\log p(z_j^t\\mid l_T=k)'}</TeX>
        <p>
          Với nhiễu Gauss độc lập cùng phương sai, cực đại ℓ(k) tương đương tìm <TeX>{'h^t_k'}</TeX> gần{' '}
          <TeX>{'z^t'}</TeX> nhất theo khoảng cách Euclid (Phụ lục A).
        </p>
        <p>
          <b>Dòng 6: chọn nửa (Eq. 5):</b>
        </p>
        <TeX block>{'\\mathcal H^t=\\arg\\max_{i\\in\\{1,2\\}}\\Big\\{\\max_{k\\in H_i^t}\\ell(k)\\Big\\}'}</TeX>
        <p>
          Bài báo ghi chú có thể dùng tiêu chí khác, ví dụ <TeX>{'\\arg\\max_i \\sum_{k\\in H^t_i}\\ell(k)'}</TeX>. Đầu ra là{' '}
          <TeX>{'\\mathcal H^\\beta'}</TeX>.
        </p>
      </DSection>
      <DSection title="Cách đọc Demo 2">
        <p>
          Mỗi bước được tách thành 4 pha tương ứng dòng 3–6 của Algorithm 1; dòng đang thực hiện được tô sáng. Cột "P_e^t
          lý thuyết" trong bảng tính theo Theorem 1, tức giả định prior đều trên <TeX>{'\\mathcal H^{t-1}'}</TeX>. Ở hình
          2D, chấm càng đậm thì ℓ(k) càng lớn; vòng xanh và cam đánh dấu giả thuyết có ℓ lớn nhất trong H₁ và H₂.
        </p>
      </DSection>
      <Assumptions ids={['G1', 'G2', 'G3', 'G4', 'G5', 'G6']} />
    </>
  )
}

// ---------------- Demo 3: Lemma 1, Theorem 1, Corollary 1 (mục IV-A, IV-B) ----------------
function Demo3Theory() {
  return (
    <>
      <DSection title="Lemma 1: hình học của sự kiện lỗi (mục IV-A)">
        <p>
          Với <TeX>{'l_T \\notin H^t_1\\cap H^t_2'}</TeX>, gọi <TeX>{'H_m^t'}</TeX> là nửa chứa mục tiêu. Khi đó
        </p>
        <TeX block>{'P_e^t=\\Pr\\Big(z^t\\notin\\bigcup_{k\\in H_m^t}V_k^t\\Big),\\qquad V_k^t=\\{x\\in\\mathbb R^{|S^t|}:\\lVert x-h_k^t\\rVert_2\\le\\lVert x-h_{k\'}^t\\rVert_2,\\ \\forall k\'\\ne k\\}'}</TeX>
        <p>
          trong đó <TeX>{'V^t_k'}</TeX> là ô Voronoi của <TeX>{'h^t_k'}</TeX>. Nếu{' '}
          <TeX>{'l_T\\in H^t_1\\cap H^t_2'}</TeX> thì chọn nửa nào cũng đúng, nên <TeX>{'P_e^t=0'}</TeX>.
        </p>
        <p>
          <b>Remark 1.</b> Các ô Voronoi là đa diện lồi; có thể dùng thuật toán hình học tính toán (tài liệu [20]–[23] của bài báo) để xác định
          biên của hợp các ô rồi tích phân mật độ Gauss của z trên đó. Biên tuyến tính từng mảnh nên đây vẫn là tích phân
          Gauss nhiều chiều, có thể tính số hoặc xấp xỉ.
        </p>
      </DSection>
      <DSection title="Theorem 1: công thức đóng khi đặt cảm biến đối xứng (mục IV-B, Phụ lục B)">
        <p>
          Cho <TeX>{'S^t=\\{s^t_1,s^t_2\\}'}</TeX> đặt đối xứng quanh <TeX>{'m^t_{d^t}'}</TeX> theo chiều{' '}
          <TeX>{'d^t'}</TeX>, và prior đều trên <TeX>{'\\mathcal H^{t-1}'}</TeX>:
        </p>
        <TeX block>{'P_e^t=\\frac{2}{n_x^{(t-1)}n_y^{(t-1)}}\\sum_{k\\in H_1^t\\setminus H_2^t}Q\\Big(\\frac{d_k}{\\sigma}\\Big)'}</TeX>
        <p>
          với <TeX>{'d_k'}</TeX> là khoảng cách từ <TeX>{'h_k'}</TeX> tới biên quyết định, bằng nửa khoảng cách từ{' '}
          <TeX>{'h_k'}</TeX> tới <TeX>{'h_{k\'}'}</TeX>, trong đó k′ là điểm đối xứng của k theo chiều{' '}
          <TeX>{'d^t'}</TeX>: <TeX>{'d_k = \\lVert h^t_k - h^t_{k\'}\\rVert_2/2'}</TeX>.
        </p>
        <p>
          Chứng minh (Phụ lục B): do đối xứng, <TeX>{'h_{k,1}=h_{k\',2}'}</TeX> và <TeX>{'h_{k,2}=h_{k\',1}'}</TeX>, nên
          biên quyết định giữa hai nửa là siêu phẳng <TeX>{'w^\\top z=0'}</TeX> với{' '}
          <TeX>{'w=\\tfrac{1}{\\sqrt2}[1,-1]^\\top'}</TeX> (Fig. 6). Chiếu nhiễu lên pháp tuyến cho{' '}
          <TeX>{'\\eta_\\perp=w^\\top\\eta\\sim\\mathcal N(0,\\sigma^2)'}</TeX>, nên{' '}
          <TeX>{'\\Pr(l_T\\notin\\mathcal H^t\\mid l_T=k)=Q(d_k/\\sigma)'}</TeX>, và bằng 0 với k trong vùng chồng lấn. Lấy
          trung bình theo prior đều và cộng hai phần riêng đối xứng cho hệ số 2.
        </p>
      </DSection>
      <DSection title="Corollary 1: giới hạn liên tục (mục IV-B, Phụ lục C)">
        <TeX block>{'P_e^t=\\frac{2}{L^{t-1}_xL^{t-1}_y}\\int_{H_1^t\\setminus H_2^t}Q\\Big(\\frac{\\lVert h^t(x)-h^t(x\')\\rVert_2}{2\\sigma}\\Big)dx'}</TeX>
        <p>với x′ là điểm đối xứng của x theo chiều cắt và h<sup>t</sup>(x) là mở rộng liên tục của h<sup>t</sup><sub>k</sub>.</p>
      </DSection>
      <DSection title="Cách đọc Demo 3">
        <p>
          Demo dùng không gian 1D với hai cảm biến, nên không gian đo là mặt phẳng <TeX>{'(z_1,z_2)'}</TeX> như Fig. 6. Mỗi
          chấm to là một <TeX>{'h_k'}</TeX>; màu nền là miền quyết định, vạch trắng là biên các ô Voronoi, đường đỏ đứt là{' '}
          <TeX>{'z_1=z_2'}</TeX>, đoạn đen là <TeX>{'d_k'}</TeX>. Đám mây 350 điểm là các phép đo minh họa{' '}
          <TeX>{'z=h_k+\\eta'}</TeX> của giả thuyết đang chọn, dùng để thấy sự kiện lỗi của Lemma 1 (z rơi vào ô của một
          giả thuyết ngoài nửa đúng).
        </p>
      </DSection>
      <Assumptions ids={['G1', 'G2', 'G4']} />
    </>
  )
}

// ---------------- Demo 4: Corollary 2 và Remark 2 (mục IV-C, V) ----------------
function Demo4Theory() {
  return (
    <>
      <DSection title="Corollary 2: trường hợp 1D (mục IV-C)">
        <p>
          Lưới <TeX>{'\\mathcal H^0=\\{(2i-1)L/(2n^{(0)})\\}'}</TeX>, cảm biến tại{' '}
          <TeX>{'\\{s^t, L^{t-1}-s^t\\}'}</TeX>. (a) Lưới rời rạc với <TeX>{'|\\mathcal H^{t-1}| = n^{(t-1)}'}</TeX>:
        </p>
        <TeX block>{'P_e^t=\\frac{2}{n^{(t-1)}}\\sum_{k\\le m^t-\\delta^t\\Delta}Q\\Big(\\frac{d_k}{\\sigma}\\Big),\\qquad d_k=\\tfrac12\\lVert h^t_k-h^t_{(L^{t-1}-k)}\\rVert_2'}</TeX>
        <p>(b) Giới hạn liên tục khi n → ∞, với <TeX>{'L^t=(\\tfrac12+\\alpha)L^{t-1}'}</TeX>:</p>
        <TeX block>{'P_e^t=\\frac{2}{L^{t-1}}\\int_0^{L^{t-1}(\\frac12-\\alpha)}Q\\Big(\\frac{\\lVert h^t(x)-h^t(L^{t-1}-x)\\rVert_2}{2\\sigma}\\Big)dx'}</TeX>
      </DSection>
      <DSection title="Remark 2: phụ thuộc vào lượng chồng lấn (mục IV-C)">
        <p>Khi vị trí cảm biến cố định, đạo hàm theo α:</p>
        <TeX block>{'\\frac{\\partial P_e^t}{\\partial\\alpha}=-2\\,Q\\Big(\\frac{d\\big(L^{t-1}(\\frac12-\\alpha)\\big)}{\\sigma}\\Big),\\qquad d(x)=\\lVert h(x)-h(L^{t-1}-x)\\rVert_2/2'}</TeX>
        <p>
          Theo bài báo: vì <TeX>{'d(x)\\ge0'}</TeX>, mức giảm tức thời lớn nhất xảy ra tại α = 0 và bằng{' '}
          <TeX>{'-2Q(0)=-1'}</TeX>, sau đó chồng lấn thêm cho lợi ích giảm dần.
        </p>
      </DSection>
      <DSection title="Liên hệ với Fig. 2 và Fig. 5 (mục V)">
        <p>
          Fig. 2 vẽ <TeX>{'P_e^t'}</TeX> theo α với cảm biến cố định <TeX>{'s^t=L^{t-1}/4'}</TeX>. Bài báo giải thích đoạn
          gần phẳng ở khoảng α giữa là do cấu hình đặt cảm biến và hàm truyền f(·), và cho thấy lỗi giảm đều khi đặt cảm
          biến theo α. Fig. 5 vẽ lại với <TeX>{'s^t=\\tfrac{L^{t-1}}{2}(\\tfrac12-\\alpha)'}</TeX>.
        </p>
        <p>
          Tham số (Bảng I): L = 500, P₀ = 20 dB, η = 1, σ = 1/√2, ε = 10, α ∈ [0; 0,5]. Phụ lục D-A ghi α được định
          nghĩa trong [0, ¼) để bảo đảm hội tụ, nhưng Theorem 1 đúng với α ∈ [0; 0,5], là khoảng dùng cho Fig. 2 và Fig.
          5.
        </p>
      </DSection>
      <Assumptions ids={['G1', 'G7']} />
    </>
  )
}

export const THEORY = {
  demo1: { key: 'demo1', title: 'Demo 1 · Vấn đề và ý tưởng chồng lấn', content: <Demo1Theory /> },
  demo2: { key: 'demo2', title: 'Demo 2 · Bài toán và Algorithm 1', content: <Demo2Theory /> },
  demo3: { key: 'demo3', title: 'Demo 3 · Lemma 1, Theorem 1, Corollary 1', content: <Demo3Theory /> },
  demo4: { key: 'demo4', title: 'Demo 4 · Corollary 2 và Remark 2', content: <Demo4Theory /> },
}
