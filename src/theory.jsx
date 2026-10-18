// Nội dung lý thuyết hiển thị trong drawer của từng demo (mở bằng nút 📖 ở góc demo).
import { Callout, DSection, TeX } from './components/ui'

// ---------------- Demo 1: cây phân hoạch ----------------
function Demo1Theory() {
  return (
    <>
      <DSection title="Vì sao binary search dễ vỡ khi có nhiễu?">
        <p>
          Binary search chia tập n phần tử thành hai nửa <b>rời nhau</b> và giữ lại một nửa. Sau{' '}
          <TeX>{'\\log_2 n'}</TeX> bước ta có đúng một phần tử; nếu phép so sánh luôn đúng thì đây là tối ưu.
        </p>
        <p>
          Trong thực tế, phép so sánh thường đến từ một phép đo có nhiễu: cường độ tín hiệu của cảm biến, kết quả xét
          nghiệm y khoa, câu trả lời của người dùng trong crowdsourcing. Khi đó:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Mục tiêu nằm <b>gần ranh giới</b> giữa hai nửa khó phân biệt nhất, vì tín hiệu từ hai phía gần như nhau, nên
            xác suất chọn sai gần ½.
          </li>
          <li>
            Một khi chọn sai, mục tiêu đã nằm ngoài vùng tìm kiếm và <b>không bước nào sau đó cứu lại được</b>: lỗi lan
            truyền tới đầu ra (error propagation), với{' '}
            <TeX>{'1-P_e=\\prod_{t=1}^{\\beta}(1-P_e^t)'}</TeX>.
          </li>
        </ul>
      </DSection>
      <DSection title="Ý tưởng: phân hoạch chồng lấn">
        <p>
          Cho hai nửa giao nhau một đoạn có độ rộng tỉ lệ với α; mỗi nửa chứa khoảng{' '}
          <TeX>{'(\\tfrac12+\\alpha)\\,n'}</TeX> phần tử.
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Mục tiêu trong vùng giao <TeX>{'H_1\\cap H_2'}</TeX> không thể bị loại: chọn nửa nào cũng đúng, nên{' '}
            <TeX>{'P_e^t=0'}</TeX>. Đây chính là những mục tiêu gần ranh giới vốn dễ sai nhất.
          </li>
          <li>
            Cái giá: mỗi bước chỉ co lại theo tỉ lệ <TeX>{'\\tfrac12+\\alpha'}</TeX> thay vì ½, nên cần nhiều bước hơn:
            <TeX block>{'\\beta \\approx \\frac{\\log n^{(\\beta)}-\\log n^{(0)}}{\\log(\\tfrac12+\\alpha)}'}</TeX>
            tức số bước tăng theo hệ số <TeX>{'c(\\alpha)=\\log 2/\\log\\frac{1}{1/2+\\alpha}'}</TeX> (ví dụ 1,36 lần khi
            α = 0,1 và 2,41 lần khi α = 0,25).
          </li>
          <li>Bài báo giới hạn α &lt; ¼ để quy tắc làm tròn (Eq. 3) vẫn bảo đảm thu về được 1 phần tử.</li>
        </ul>
      </DSection>
      <DSection title="Ba đại lượng đánh đổi">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <b>Độ sâu β</b>: số bước, tức độ trễ và số phép đo.
          </li>
          <li>
            <b>Xác suất lỗi Pₑ</b>: xác suất mục tiêu bị loại khỏi vùng đầu ra.
          </li>
          <li>
            <b>Kích thước |Hᵝ|</b>: số ứng viên còn lại ở đầu ra.
          </li>
        </ul>
        <Callout type="info" title="Liên hệ với list decoding">
          Không nhất thiết phải tìm đúng một phần tử: có thể dừng khi còn |H<sup>β</sup>| ứng viên và chỉ yêu cầu mục
          tiêu nằm trong danh sách đó.
        </Callout>
      </DSection>
      <DSection title="Cách đọc Demo 1">
        <p>
          Đường <span className="text-emerald-700 font-semibold">xanh lá</span> là các nhánh vẫn giữ được mục tiêu. Với
          α = 0 chỉ có <b>đúng một</b> đường đúng, nên mọi quyết định sai đều không sửa được. Khi có chồng lấn, các nút ở
          mỗi mức dùng chung phần tử (ví dụ <span className="font-mono">ABC</span> và{' '}
          <span className="font-mono">CDE</span> cùng chứa <span className="font-mono">C</span>), nên có <b>nhiều</b>{' '}
          đường dẫn tới mục tiêu, và ở những bước mục tiêu nằm trong vùng giao thì chọn nhánh nào cũng đúng. Cái giá là
          cây sâu hơn.
        </p>
        <p className="text-slate-500">
          Số đường được đếm trên cây đầy đủ (mọi đường từ gốc tới lá), còn hình vẽ gộp các nút trùng nhau ở cùng mức.
        </p>
      </DSection>
    </>
  )
}

// ---------------- Demo 2: bài toán + Algorithm 1 ----------------
function Demo2Theory() {
  return (
    <>
      <DSection title="Bài toán: định vị mục tiêu bằng cảm biến có nhiễu">
        <p>
          Một nguồn tín hiệu đứng yên tại vị trí chưa biết <TeX>{'l_T \\in \\mathcal H^0 \\subseteq \\mathbb R^d'}</TeX>.
          Nhiều cảm biến được rải trong vùng; ở mỗi bước t ta <b>kích hoạt</b> một tập{' '}
          <TeX>{'S^t = \\{s^t_1,\\dots,s^t_{|S^t|}\\}'}</TeX>. Mỗi cảm biến đo được:
        </p>
        <TeX block>{'z^t_j = f\\big(\\lVert s^t_j - l_T\\rVert_2\\big) + \\eta^t_j,\\qquad \\eta^t_j\\sim\\mathcal N(0,\\sigma^2)'}</TeX>
        <p>
          Với mỗi giả thuyết k (một vị trí có thể của mục tiêu), vector đo kỳ vọng là{' '}
          <TeX>{'h_k^t = \\big(f(\\lVert s^t_i - k\\rVert)\\big)_i \\in \\mathbb R^{|S^t|}'}</TeX>. Vùng{' '}
          <TeX>{'L_x\\times L_y'}</TeX> được chia thành lưới <TeX>{'n_x\\times n_y'}</TeX> điểm:
        </p>
        <TeX block>{'\\mathcal H^0=\\Big\\{\\Big(\\tfrac{(2i-1)L_x}{2n_x},\\tfrac{(2j-1)L_y}{2n_y}\\Big)\\Big\\}_{i\\le n_x,\\ j\\le n_y}'}</TeX>
        <p>Xác suất lỗi tổng được phân rã theo từng bước:</p>
        <TeX block>{'P_e = 1-\\prod_{t=1}^{\\beta}\\big(1-P_e^t\\big),\\qquad P_e^t=\\Pr\\{l_T\\notin\\mathcal H^t \\mid l_T\\in\\mathcal H^{t-1}\\}\\qquad(1)'}</TeX>
        <Callout type="warn" title="Lưu ý khi đọc Eq. (9)">
          Bài báo viết <TeX>{'10\\log_{10} f(d) = P_0 - 10\\eta\\log_{10}(d+\\epsilon)'}</TeX>, tức f ở miền tuyến tính và
          nhiễu cộng vào f. Trang này dùng đúng cách hiểu đó, và nó tái tạo được độ lớn P<sub>e</sub> trong Fig. 2. Bài báo
          không nói rõ điểm này.
        </Callout>
      </DSection>
      <DSection title="Algorithm 1: bốn thao tác mỗi bước">
        <p>
          <b>① Phân hoạch chồng lấn (Eq. 2–3).</b> Chọn chiều dài nhất d<sup>t</sup> và điểm giữa m<sup>t</sup>:
        </p>
        <TeX block>{'\\begin{aligned}H_1^t&=\\{k: k_{d^t}\\le m^t+\\delta^t\\Delta\\}\\\\ H_2^t&=\\{k: k_{d^t}\\ge m^t-\\delta^t\\Delta\\}\\end{aligned}'}</TeX>
        <p>δ<sup>t</sup> được chọn sao cho mỗi nửa có số điểm theo chiều cắt:</p>
        <TeX block>{'n^{(t)} = \\max\\!\\Big(\\mathrm{round}\\big((\\tfrac12+\\alpha)\\,n^{(t-1)}\\big),\\ \\big\\lceil\\tfrac12 n^{(t-1)}\\big\\rceil\\Big)'}</TeX>
        <p className="text-slate-500">
          round làm tròn tới số chẵn khi bằng .5; ceil bảo đảm mỗi nửa có ít nhất một nửa số điểm.
        </p>
        <p>
          <b>② Đo.</b> Kích hoạt hai cảm biến đối xứng quanh điểm giữa theo chiều cắt, thu{' '}
          <TeX>{'z^t'}</TeX>. Thực nghiệm đặt cảm biến ở tâm phần riêng: <TeX>{'s^t=\\tfrac{L^{t-1}}{2}(\\tfrac12-\\alpha)'}</TeX>.
        </p>
        <p>
          <b>③ Likelihood (Eq. 4)</b> cho mọi giả thuyết còn lại:
        </p>
        <TeX block>{'\\ell(k)=\\sum_{j=1}^{|S^t|}\\log p(z_j^t\\mid l_T=k)= -\\frac{\\lVert z^t-h^t_k\\rVert^2}{2\\sigma^2}+\\text{const}'}</TeX>
        <p>
          Với nhiễu Gauss cùng phương sai, maximum likelihood chính là tìm <TeX>{'h_k'}</TeX> <b>gần z nhất</b>.
        </p>
        <p>
          <b>④ Chọn nửa (Eq. 5):</b>
        </p>
        <TeX block>{'\\mathcal H^t=\\arg\\max_{i\\in\\{1,2\\}}\\Big\\{\\max_{k\\in H_i^t}\\ell(k)\\Big\\}'}</TeX>
        <p>
          Lặp lại β bước và trả về <TeX>{'\\mathcal H^\\beta'}</TeX>. Likelihood được tính <b>lại từ đầu</b> ở mỗi bước,
          thông tin từ các bước trước bị bỏ đi. Mỗi bước tốn <TeX>{'O(|\\mathcal H^{t-1}|\\,|S^t|)'}</TeX> phép tính.
        </p>
      </DSection>
      <DSection title="Cách đọc Demo 2">
        <p>
          Mỗi bước được tách thành 4 pha tương ứng 4 thao tác trên; dòng pseudocode đang thực hiện được tô sáng. Bảng
          bên dưới ghi lại từng bước và <TeX>{'P_e^t'}</TeX> lý thuyết theo Theorem 1 (prior đều trên{' '}
          <TeX>{'\\mathcal H^{t-1}'}</TeX>).
        </p>
        <p>
          <b>Hình 2D:</b> ở pha Likelihood, chấm càng <b>đậm và to</b> thì ℓ(k) càng cao (độ đậm là{' '}
          <TeX>{'e^{\\ell(k)-\\max\\ell}'}</TeX>, tức xác suất hậu nghiệm tương đối). Ở pha Chọn vùng, vòng xanh và cam đánh
          dấu điểm có ℓ lớn nhất trong H₁ và H₂. Hai cảm biến nằm trên cùng đường giữa của chiều còn lại nên ℓ đối xứng qua
          đường đó; điều này không ảnh hưởng quyết định vì H₁ và H₂ chỉ khác nhau theo <b>chiều đang cắt</b>. Thuật toán
          cắt xen kẽ theo x và y.
        </p>
      </DSection>
    </>
  )
}

// ---------------- Demo 2b: Monte Carlo theo bước ----------------
function Demo2bTheory() {
  return (
    <>
      <DSection title="Câu hỏi kiểm chứng">
        <p>
          Theorem 1 tính <TeX>{'P_e^t'}</TeX> với giả định mục tiêu phân bố <b>đều</b> trên{' '}
          <TeX>{'\\mathcal H^{t-1}'}</TeX>, rồi Eq. (1) nhân các bước lại. Giả định này chỉ đúng ở bước đầu. Bài báo không
          cho biết Eq. (1) lệch theo hướng nào.
        </p>
      </DSection>
      <DSection title="Phương pháp">
        <p>
          Chạy Algorithm 1 nhiều lần với mục tiêu chọn đều, đếm số mục tiêu bị loại ở mỗi bước, rồi tính tỉ lệ lỗi{' '}
          <b>có điều kiện</b>:
        </p>
        <TeX block>{'\\hat P_e^t=\\frac{\\#\\{\\text{bị loại ở bước } t\\}}{\\#\\{\\text{còn trong vùng trước bước } t\\}}'}</TeX>
        <p>
          Khoảng tin cậy 95%: <TeX>{'\\hat P_e^t \\pm 1{,}96\\sqrt{\\hat P_e^t(1-\\hat P_e^t)/N_t}'}</TeX>. Cảm biến đặt theo
          heuristic s = (L/2)(½ − α); mô phỏng chạy trong Web Worker.
        </p>
      </DSection>
      <DSection title="Cách đọc kết quả">
        <p>
          <b>Bước 1:</b> MC khớp lý thuyết, vì lúc này mục tiêu thực sự phân bố đều (với 200 000 lần chạy, tỉ số 1,00 ±
          0,01). Với vài nghìn lần chạy, lệch vài phần trăm là dao động thống kê.
        </p>
        <p>
          <b>Từ bước 2:</b> MC lệch khỏi lý thuyết. Ở mỗi bước, các mục tiêu nằm sát mép trong của vùng riêng (gần điểm
          cắt) dễ bị chọn sai nhất và đã bị loại một phần, nên vùng đó bị "hao hụt". Chiều lệch phụ thuộc chỗ vùng hao
          hụt rơi vào trong khoảng mới:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <b>α nhỏ</b> (0 hoặc 0,1): vùng hao hụt rơi vào chỗ an toàn (mép khoảng mới, hoặc vùng giao), nên tỉ lệ mục
            tiêu ở chỗ dễ sai tăng lên và <b>MC cao hơn</b> lý thuyết, từ +5% tới +50%.
          </li>
          <li>
            <b>α lớn</b> (0,2 với σ = 1): vùng hao hụt trùng với chỗ dễ sai của bước mới, nên <b>MC thấp hơn</b> lý
            thuyết, có bước thấp hơn tới 30%.
          </li>
        </ul>
        <Callout type="warn" title="Hệ quả">
          Eq. (1) chỉ là xấp xỉ, <b>không phải cận trên cũng không phải cận dưới</b> của lỗi thật.
        </Callout>
      </DSection>
    </>
  )
}

// ---------------- Demo 3: Voronoi, Lemma 1, Theorem 1 ----------------
function Demo3Theory() {
  return (
    <>
      <DSection title="Lemma 1: hình học của sự kiện lỗi">
        <p>
          Giả sử mục tiêu thuộc <TeX>{'H_m^t'}</TeX> nhưng không thuộc vùng giao. Vì ML chọn <TeX>{'h_k'}</TeX> gần z
          nhất, mỗi giả thuyết sở hữu một ô Voronoi trong không gian đo:
        </p>
        <TeX block>{'V_k^t=\\{x\\in\\mathbb R^{|S^t|}:\\lVert x-h_k^t\\rVert\\le\\lVert x-h_{k\'}^t\\rVert,\\ \\forall k\'\\ne k\\}'}</TeX>
        <p>Lỗi xảy ra khi phép đo z rơi ra ngoài hợp các ô của nửa đúng:</p>
        <TeX block>{'P_e^t=\\Pr\\Big(z^t\\notin\\bigcup_{k\\in H_m^t}V_k^t\\Big)'}</TeX>
        <p>
          Trong trường hợp tổng quát, đây là tích phân Gauss nhiều chiều trên một đa diện không lồi, không có công thức
          đóng.
        </p>
      </DSection>
      <DSection title="Theorem 1: công thức đóng khi đặt cảm biến đối xứng">
        <p>
          Đặt 2 cảm biến <TeX>{'s_1,s_2'}</TeX> đối xứng quanh điểm giữa theo chiều cắt, prior đều. Mỗi k ∈ H₁ có một "bạn
          đối xứng" k′ ∈ H₂ với <TeX>{'h_{k,1}=h_{k\',2}'}</TeX>, <TeX>{'h_{k,2}=h_{k\',1}'}</TeX>, nên{' '}
          <TeX>{'h_{k\'}'}</TeX> là ảnh phản chiếu của <TeX>{'h_k'}</TeX> qua đường chéo <TeX>{'z_1=z_2'}</TeX>, cũng là
          biên quyết định. Chiếu nhiễu lên pháp tuyến của nó được nhiễu Gauss 1 chiều:
        </p>
        <TeX block>{'P_e^t=\\frac{2}{n_x^{(t-1)}n_y^{(t-1)}}\\sum_{k\\in H_1^t\\setminus H_2^t}Q\\Big(\\frac{d_k}{\\sigma}\\Big),\\qquad d_k=\\tfrac12\\lVert h_k^t-h_{k\'}^t\\rVert_2'}</TeX>
        <p>
          Chỉ các điểm thuộc <TeX>{'H_1\\setminus H_2'}</TeX> (và phần đối xứng) góp vào lỗi. Tăng α làm tập này nhỏ lại,
          và các điểm có <TeX>{'d_k'}</TeX> nhỏ nhất (gần ranh giới, <TeX>{'Q\\approx\\tfrac12'}</TeX>) bị loại khỏi tổng
          trước tiên.
        </p>
      </DSection>
      <DSection title="Corollary 1: giới hạn liên tục">
        <p>Khi lưới dày, tổng trở thành tích phân:</p>
        <TeX block>{'P_e^t\\to\\frac{2}{L_xL_y}\\int_{H_1\\setminus H_2}Q\\Big(\\frac{\\lVert h(x)-h(x\')\\rVert}{2\\sigma}\\Big)dx'}</TeX>
      </DSection>
      <DSection title="Cách đọc Demo 3">
        <p>
          Mỗi chấm to là một vector <TeX>{'h_k=(f(|s_1-k|), f(|s_2-k|))'}</TeX>. Đám mây nhỏ là 350 phép đo{' '}
          <TeX>{'z=h_k+\\eta'}</TeX> của giả thuyết đang chọn: chấm xanh là quyết định đúng, chấm đỏ là lỗi. Màu nền là
          miền quyết định ML, vạch trắng là biên các ô Voronoi, đường đỏ đứt là <TeX>{'z_1=z_2'}</TeX>. Đoạn thẳng đen là{' '}
          <TeX>{'d_k'}</TeX>, khoảng cách từ <TeX>{'h_k'}</TeX> tới biên quyết định.
        </p>
        <p>
          <b>Chế độ cảm biến lệch:</b> biên quyết định không còn là đường chéo mà thành một đường gấp khúc ghép từ các cạnh
          Voronoi. Theorem 1 không còn đúng, chỉ còn Lemma 1 và phải ước lượng bằng Monte Carlo.
        </p>
      </DSection>
    </>
  )
}

// ---------------- Demo 4: Corollary 2 + Remark 2 ----------------
function Demo4Theory() {
  return (
    <>
      <DSection title="Corollary 2: trường hợp 1D">
        <p>
          Với H<sup>t−1</sup> gồm n điểm trên đoạn dài L<sup>t−1</sup> và cảm biến tại{' '}
          <TeX>{'\\{s^t, L^{t-1}-s^t\\}'}</TeX>:
        </p>
        <TeX block>{'P_e^t=\\frac{2}{n}\\sum_{k\\le m^t-\\delta^t\\Delta}Q\\Big(\\frac{d_k}{\\sigma}\\Big)\\ \\xrightarrow{n\\to\\infty}\\ \\frac{2}{L^{t-1}}\\int_0^{L^{t-1}(\\frac12-\\alpha)}Q\\Big(\\frac{d(x)}{\\sigma}\\Big)dx'}</TeX>
        <p>
          với <TeX>{'d(x)=\\tfrac12\\lVert h(x)-h(L^{t-1}-x)\\rVert_2'}</TeX>. Cận trên của tích phân là mép trong của
          phần riêng; tăng α thì cận này lùi về 0, cắt bỏ phần gần điểm giữa.
        </p>
      </DSection>
      <DSection title="Remark 2: độ nhạy theo α">
        <p>Khi cảm biến cố định, lấy đạo hàm theo α (quy tắc Leibniz):</p>
        <TeX block>{'\\frac{\\partial P_e^t}{\\partial\\alpha}=-2\\,Q\\Big(\\frac{d\\big(L^{t-1}(\\frac12-\\alpha)\\big)}{\\sigma}\\Big)\\in[-1,0]'}</TeX>
        <p>
          Tăng α thì điểm cắt <TeX>{'x=L(\\tfrac12-\\alpha)'}</TeX> lùi lại, và lượng lỗi giảm đi đúng bằng mức lỗi của
          các giả thuyết vừa được đưa vào vùng giao. Tại α = 0, d(L/2) = 0 nên đạo hàm bằng −2Q(0) = −1, là mức giảm
          nhanh nhất. Bài báo kết luận "overlap thêm thì lợi ích giảm dần".
        </p>
      </DSection>
      <DSection title="Kết quả kiểm chứng">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Đường đỏ (công thức) và đường đen đứt (đạo hàm số) trùng nhau: Remark 2 <b>đúng</b> khi cảm biến cố định.
          </li>
          <li>
            Nhưng đạo hàm <b>không</b> giảm đơn điệu về 0: nó gần bằng 0 quanh α = ¼, khi điểm cắt đi qua vị trí cảm biến
            (d lớn nhất), rồi lại tăng. Đây chính là nguyên nhân của <b>đoạn nằm ngang</b> ở đồ thị bên trái (Fig. 2 của
            bài báo), nên nhận định "lợi ích giảm dần" chỉ đúng một phần.
          </li>
          <li>
            Khi cảm biến dịch theo α (đường xanh), đoạn nằm ngang biến mất (Fig. 5) nhưng công thức không còn áp dụng
            được, vì thiếu số hạng ∂s/∂α.
          </li>
        </ul>
        <p className="text-slate-500">
          Tham số theo Table I của bài báo: L = 500, P₀ = 20, η = 1, ε = 10, σ = 1/√2. Đường đen bên trái tái tạo Fig. 2
          (0,17 tại α = 0, đoạn nằm ngang ≈ 0,07).
        </p>
      </DSection>
    </>
  )
}

export const THEORY = {
  demo1: { key: 'demo1', title: 'Demo 1 · Động lực và ý tưởng chồng lấn', content: <Demo1Theory /> },
  demo2: { key: 'demo2', title: 'Demo 2 · Bài toán và Algorithm 1', content: <Demo2Theory /> },
  demo2b: { key: 'demo2b', title: 'Demo 2b · Kiểm chứng giả định prior đều', content: <Demo2bTheory /> },
  demo3: { key: 'demo3', title: 'Demo 3 · Lemma 1, Theorem 1, Corollary 1', content: <Demo3Theory /> },
  demo4: { key: 'demo4', title: 'Demo 4 · Corollary 2 và Remark 2', content: <Demo4Theory /> },
}
