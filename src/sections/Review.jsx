import { Card, Section } from '../components/ui'

const STRENGTHS = [
  'Ý tưởng đơn giản, dễ cài đặt, vẫn giữ cấu trúc đệ quy của bisection. Chỉ có một tham số α điều khiển trade-off.',
  'Cách nhìn lỗi qua ô Voronoi trong không gian đo rất trực quan. Chứng minh Theorem 1 bằng lập luận đối xứng/phản xạ gọn và đúng.',
  'log Pₑ giảm gần tuyến tính theo β (Fig. 4), nên trade-off mượt và dự đoán được.',
  'Heuristic đặt cảm biến "giữa vùng riêng" có trực giác tốt và bám sát điểm tối ưu.',
]

const WEAKNESSES = [
  {
    group: 'Thực nghiệm',
    items: [
      ['Không có baseline', 'Bài báo nói vượt các phương pháp lặp truy vấn, Horstein/PBA, Karp–Kleinberg nhưng không so sánh với phương pháp nào.'],
      ['Ngân sách đo không đồng đều', 'Fig. 4 so α = 0.25 (33 bước) với α = 0 (14 bước), tức số phép đo khác nhau khoảng 2.4 lần.'],
      ['Không có Monte Carlo', 'Mọi số liệu đều tính từ chính công thức giải tích. Demo 2b (tab Thuật toán) cho thấy từ bước 2, P_e^t thực tế lệch khỏi lý thuyết theo cả hai chiều.'],
      ['Chỉ có 1D', 'Bài toán được đặt ra và phân tích cho 2D, nhưng toàn bộ thực nghiệm chỉ làm 1D.'],
      ['Số liệu Fig. 4 khó hiểu', 'Với n⁽⁰⁾ = 2¹⁴ và n⁽ᵝ⁾ = 2⁷, theo Eq. (3) thì β ∈ [7, 17], không phải [14, 33].'],
      ['Phạm vi α không nhất quán', 'α được định nghĩa trong [0, ¼) nhưng Fig. 2, 5 vẽ tới 0.5. Khi α → 0.5, Pₑ → 0 là kết quả tầm thường.'],
      ['EA không cần thiết', 'Bài toán đặt cảm biến đối xứng chỉ có 1 biến, quét lưới là đủ và cho đúng tối ưu toàn cục.'],
    ],
  },
  {
    group: 'Lý thuyết',
    items: [
      ['Giả định prior đều ở mỗi bước', 'Khi điều kiện hóa trên việc các bước trước đã đúng, posterior không còn đều. Vì vậy Eq. (1) chỉ là xấp xỉ, không phải cận trên cũng không phải cận dưới.'],
      ['Không có bộ nhớ', 'Likelihood được tính lại từ đầu ở mỗi bước, bỏ phí thông tin analog từ các phép đo trước. Probabilistic Bisection (Horstein) giữ posterior nên tận dụng được thông tin này.'],
      ['Closed form rất hẹp', 'Chỉ có cho 2 cảm biến đối xứng. Trường hợp tổng quát chỉ còn Lemma 1, phải tính tích phân trên đa diện Voronoi.'],
      ['Giả định biết hết', 'f(·), σ và vị trí cảm biến đều được giả định biết chính xác, và cảm biến đặt được ở bất kỳ đâu. Bài không phân tích trường hợp mô hình sai.'],
      ['Remark 2 bị giới hạn', 'Đạo hàm chỉ đúng khi cảm biến cố định. Với vị trí phụ thuộc α thì thiếu số hạng ∂s/∂α.'],
      ['Không có kết quả tối ưu', 'Bài không trả lời α* là gì cho ngân sách cho trước, cũng không so với cận thông tin (Burnashev–Zigangirov).'],
    ],
  },
  {
    group: 'Trình bày',
    items: [
      ['Thiếu tài liệu liên quan', 'Feige et al. (1994, backtracking), Ben-Or & Hassidim (2008), Waeber–Frazier–Henderson (PBA, 2013), Jedynak–Frazier–Sznitman (Twenty Questions with Noise).'],
      ['Eq. (9) mơ hồ', 'Không rõ nhiễu được cộng ở miền dB hay miền tuyến tính, mà hai cách cho kết quả rất khác nhau.'],
      ['Phụ thuộc appendix', 'Phần lớn chi tiết nằm ở appendix và được tham chiếu tới chính bản arXiv [19].'],
    ],
  },
]

const IMPROVEMENTS = [
  {
    group: 'Thuật toán',
    items: [
      ['α thích nghi theo bước', 'Chọn αₜ theo SNR, theo margin của likelihood, hoặc theo kích thước còn lại. Các bước cuối có thể cần overlap nhiều hơn.'],
      ['Overlap + posterior Bayes', 'Giữ posterior qua các bước thay vì ML độc lập ở từng bước.'],
      ['Số phép đo thích nghi (SPRT)', 'Đo tiếp cho tới khi đủ tự tin rồi mới cắt.'],
      ['Backtracking', 'Cho phép mở rộng lại vùng khi phép đo mới mâu thuẫn với vùng hiện tại.'],
      ['Phân hoạch k-ary chồng lấn', 'Chia thành nhiều hơn 2 phần, hoặc dùng α khác nhau cho từng chiều.'],
      ['Quy tắc chọn khác', 'Dùng tổng likelihood hoặc MAP thay cho max.'],
      ['Tối ưu đồng thời', 'Tối ưu cùng lúc α, vị trí và số cảm biến dưới ràng buộc năng lượng.'],
    ],
  },
  {
    group: 'Lý thuyết',
    items: [
      ['α* tối ưu', 'Tìm α* cho bài toán min Pₑ với tổng số phép đo cố định, và so với cận thông tin.'],
      ['Pₑ chính xác', 'Dùng posterior thực thay cho prior đều, hoặc đưa ra cận trên/dưới cho Pₑ.'],
      ['Mở rộng mô hình', 'Nhiều cặp cảm biến, nhiễu tương quan, nhiễu non-Gaussian, cấu hình không đối xứng.'],
    ],
  },
  {
    group: 'Thực nghiệm',
    items: [
      ['Kiểm chứng MC', 'Chạy Monte Carlo để kiểm chứng Theorem 1 và Corollary 2 (Demo 3 và Đồ thị D đã làm).'],
      ['Baseline cùng ngân sách', 'So với lặp phép đo, PBA và Karp–Kleinberg ở cùng số phép đo.'],
      ['2D thực tế', 'Cảm biến cố định trên lưới, có sai lệch mô hình (η, σ không đúng).'],
      ['Pareto 3 chiều', 'Vẽ đường biên Pareto giữa (β, |Hᵝ|, Pₑ).'],
    ],
  },
]

export default function Review() {
  return (
    <Section
      id="review"
      num="06"
      title="Đánh giá: điểm mạnh, điểm yếu và hướng cải thiện"
      subtitle="Nhận xét phản biện về bài báo, kèm các hướng có thể phát triển tiếp."
    >
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="✅ Điểm mạnh" className="lg:col-span-1">
          <ul className="space-y-2 text-sm text-slate-700 list-disc ml-4">
            {STRENGTHS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
        <Card title="🎯 Tóm tắt" className="lg:col-span-2 bg-indigo-50 border-indigo-200">
          <p className="text-sm text-slate-700 leading-relaxed">
            Ý tưởng đơn giản và có phân tích hình học đẹp. Điểm yếu lớn nhất là bài <b>không có baseline</b> và{' '}
            <b>không so sánh ở cùng ngân sách phép đo</b>, nên chưa thể kết luận overlap tốt hơn việc dùng chính số phép đo đó
            để lặp lại truy vấn hoặc cập nhật posterior. Ngoài ra, Algorithm 1 chỉ lấy 1 bit từ mỗi phép đo
            analog rồi bỏ đi. Hướng cải tiến có giá trị nhất là <b>α thích nghi kết hợp cập nhật posterior</b>, đánh
            giá ở cùng ngân sách đo so với PBA.
          </p>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-3">⚠️ Điểm yếu và hạn chế</h3>
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {WEAKNESSES.map((g) => (
          <Card key={g.group} title={g.group}>
            <ul className="space-y-3 text-sm">
              {g.items.map(([t, d]) => (
                <li key={t}>
                  <div className="font-semibold text-rose-800">{t}</div>
                  <div className="text-slate-600">{d}</div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-3">🚀 Hướng cải thiện</h3>
      <div className="grid lg:grid-cols-3 gap-6">
        {IMPROVEMENTS.map((g) => (
          <Card key={g.group} title={g.group}>
            <ul className="space-y-3 text-sm">
              {g.items.map(([t, d]) => (
                <li key={t}>
                  <div className="font-semibold text-emerald-800">{t}</div>
                  <div className="text-slate-600">{d}</div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
