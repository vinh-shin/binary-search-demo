import { Section } from '../components/ui'

// Vấn đề của phương pháp (mỗi vấn đề có căn cứ trong bài báo arXiv:2504.20513v2) và các hướng cải thiện,
// gắn nhãn nguồn: bài báo tự nêu, phương pháp từ tài liệu khác, hoặc đề xuất của nhóm (chưa kiểm chứng).
const SRC = {
  paper: { label: 'Bài báo', cls: 'bg-indigo-100 text-indigo-800' },
  other: { label: 'Phương pháp khác', cls: 'bg-amber-100 text-amber-900' },
  team: { label: 'Nhóm đề xuất', cls: 'bg-emerald-100 text-emerald-800' },
}

const GROUPS = [
  {
    title: 'Vấn đề về cơ chế hoạt động',
    items: [
      {
        name: 'Mỗi quyết định chỉ dùng phép đo của bước hiện tại',
        basis:
          'Eq. (4) tính ℓ(k) = Σⱼ log p(zⱼᵗ | l_T = k) chỉ từ phép đo zᵗ của bước t; quyết định ở Eq. (5) dựa trên ℓ(k) này.',
        demo: ['Demo 2', '#thuat-toan'],
        fixes: [
          ['paper', 'Dùng số phép đo thích nghi ở mỗi bước (mục VI).'],
          [
            'other',
            'Chia đôi xác suất (probabilistic bisection; Horstein 1963; Waeber, Frazier, Henderson 2013): giữ phân phối hậu nghiệm trên toàn không gian, truy vấn tại trung vị hậu nghiệm và cập nhật Bayes sau mỗi phép đo, nên không bỏ phí phép đo cũ.',
          ],
          [
            'team',
            'Giữ cấu trúc chồng lấn của Algorithm 1 nhưng cộng dồn bằng chứng: πᵗ(k) ∝ πᵗ⁻¹(k)·p(zᵗ | k) trên toàn lưới H⁰, và dùng πᵗ thay cho ℓ(k) ở Eq. (5). Đánh đổi: mỗi bước tốn O(|H⁰|) phép tính thay vì O(|Hᵗ⁻¹|).',
          ],
        ],
      },
      {
        name: 'Không khôi phục được khi đã loại mục tiêu',
        basis:
          'Mục III: mỗi bước thu hẹp vùng thành Hᵗ ⊆ Hᵗ⁻¹. Nếu l_T ∉ Hᵗ thì mục tiêu không còn trong các vùng sau; Eq. (1) tính lỗi tổng theo đúng cách này.',
        demo: ['Demo 2', '#thuat-toan'],
        fixes: [
          ['paper', 'Bài báo không đề xuất cơ chế khôi phục; chỉ giảm xác suất loại sai bằng cách tăng α.'],
          [
            'other',
            'Tìm kiếm có quay lui trên cây (Feige, Raghavan, Peleg, Upfal 1994; Karp, Kleinberg 2007): trước khi đi xuống, kiểm tra lại xem mục tiêu có thật sự nằm trong nút hiện tại; nếu không thì quay lên nút cha.',
          ],
          [
            'team',
            'Thay vùng ứng viên bằng tập tin cậy: Hᵗ là tập nhỏ nhất có tổng xác suất hậu nghiệm ≥ 1 − εₜ. Vị trí đã bị loại vẫn có xác suất khác 0 nên có thể quay lại; nếu tập đầu ra có tổng hậu nghiệm ≥ 1 − ε thì xác suất lỗi (trung bình theo prior) ≤ ε. Cần bộ nhớ như đề xuất ở vấn đề 1.',
          ],
        ],
      },
      {
        name: 'Quy tắc chọn nửa chưa được so sánh, chưa xác định cách phá hòa',
        basis:
          'Eq. (5) chọn nửa chứa giả thuyết có ℓ lớn nhất; bài báo ghi có thể dùng argmaxᵢ Σ_{k∈Hᵢᵗ} ℓ(k) nhưng không phân tích. Khi giả thuyết tốt nhất nằm trong H₁ ∩ H₂, hai nửa bằng điểm và bài báo không nói cách chọn.',
        demo: ['Demo 3', '#voronoi'],
        fixes: [
          ['paper', 'Tiêu chí thay thế: tổng log hợp lý trên mỗi nửa (mục III).'],
          [
            'team',
            'Chọn nửa có tổng xác suất hậu nghiệm lớn hơn: Hᵗ = argmaxᵢ Σ_{k∈Hᵢᵗ} πᵗ⁻¹(k)·p(zᵗ | k). Quy tắc này cực tiểu Pr(l_T ∉ Hᵗ | zᵗ) ở từng bước; vùng chồng lấn được cộng cho cả hai nửa nên quyết định chỉ còn phụ thuộc hai phần riêng.',
          ],
        ],
      },
      {
        name: 'Độ chồng lấn α cố định cho mọi bước',
        basis: 'Algorithm 1 nhận một α duy nhất làm đầu vào (dòng 1) và dùng cho mọi bước qua quy tắc (3).',
        demo: ['Demo 2', '#thuat-toan'],
        fixes: [
          ['paper', 'Điều chỉnh α động theo độ tin cậy hoặc mức nhiễu, kèm số phép đo thích nghi (mục VI).'],
          [
            'other',
            'Kiểm định tuần tự (SPRT; Wald 1947): quyết định độ chồng lấn sau khi đo, dựa trên tỉ số log hợp lý giữa hai phần riêng; tin cậy thì thu hẹp mạnh, còn mơ hồ thì giữ chồng lấn lớn hoặc đo thêm.',
          ],
          [
            'team',
            'Chọn (α₁, …, α_β) cực tiểu Σₜ Pₑᵗ(αₜ) (cận trên của Pₑ) với ràng buộc Σₜ log₂ 1/(½ + αₜ) ≥ log₂ n⁽⁰⁾/n⁽ᵝ⁾. Dùng Remark 2 (cảm biến cố định), điều kiện tối ưu là 2Q(dₜ(Lᵗ⁻¹(½ − αₜ))/σ)·(½ + αₜ)·ln 2 = λ với mọi t: bước khó phân biệt hơn nhận αₜ lớn hơn.',
          ],
        ],
      },
      {
        name: 'Hiệu quả phụ thuộc vào vị trí cảm biến và mô hình nhiễu',
        basis:
          'Mục V: đoạn gần phẳng ở Fig. 2 là do cấu hình đặt cảm biến và hàm truyền f(·), và lỗi giảm đều có thể đạt được khi đặt cảm biến theo α (Fig. 5). Mục II giả định nhiễu Gauss trắng cộng.',
        demo: ['Demo 4', '#voronoi'],
        fixes: [
          [
            'paper',
            'Đặt cảm biến theo sᵗ = (Lᵗ⁻¹/2)(½ − α), xấp xỉ tốt vị trí tối ưu tìm bằng giải thuật tiến hóa (mục V); khảo sát mô hình nhiễu không Gauss, không log-chuẩn và tương quan (mục VI).',
          ],
          [
            'other',
            'Chọn cảm biến theo tiêu chí thông tin trong mạng cảm biến lớn (ví dụ Shen, Liu, Varshney 2014, tài liệu [15] của bài báo), thay cho giả định đặt được cảm biến ở vị trí tùy ý.',
          ],
          [
            'team',
            'Tối ưu đồng thời α và vị trí cảm biến; do đối xứng chỉ còn một biến s nên quét lưới là đủ. Với hai cảm biến đối xứng, biên quyết định là z₁ = z₂ nên có thể quyết định theo dấu của z₁ − z₂ mà không cần biết hệ số P₀ của mô hình (9).',
          ],
        ],
      },
    ],
  },
  {
    title: 'Vấn đề về phân tích lỗi',
    items: [
      {
        name: 'Lỗi tổng được tính với giả định prior đều ở mọi bước',
        basis:
          'Theorem 1 giả định "uniform prior on Hᵗ⁻¹"; Eq. (1) nhân các Pₑᵗ của từng bước. Bài báo không phân tích phân bố của l_T trong Hᵗ⁻¹ ở các bước sau, khi đã biết mục tiêu chưa bị loại ở các bước trước.',
        demo: ['Demo 2', '#thuat-toan'],
        fixes: [
          ['paper', 'Bài báo không đề cập.'],
          [
            'team',
            'Tính Pₑ chính xác bằng quy hoạch động trên cây phân hoạch: với mỗi vị trí mục tiêu k, lan truyền xác suất đi tới từng nút qua các bước (theo xác suất chọn mỗi nhánh tại nút đó), rồi lấy trung bình theo k xác suất kết thúc ở nút không chứa k. Trong 1D, số nút khác nhau ở mỗi mức không vượt quá n nên tính được.',
          ],
        ],
      },
      {
        name: 'Công thức đóng chỉ cho hai cảm biến đặt đối xứng',
        basis:
          'Theorem 1 yêu cầu Sᵗ = {s₁ᵗ, s₂ᵗ} đặt đối xứng quanh điểm giữa. Trường hợp tổng quát chỉ còn Lemma 1, tức tích phân Gauss nhiều chiều trên hợp các ô Voronoi (Remark 1).',
        demo: ['Demo 3', '#voronoi'],
        fixes: [
          [
            'paper',
            'Tính số hoặc xấp xỉ bằng thuật toán hình học tính toán (Remark 1); mở rộng bảo đảm lý thuyết cho cảm biến không đối xứng và cho không gian nhiều chiều (mục VI).',
          ],
          [
            'team',
            'Cận hợp theo cặp, đúng với số cảm biến và vị trí bất kỳ: Pₑᵗ ≤ (2/|Hᵗ⁻¹|)·Σ_{k∈H₁∖H₂} Σ_{k″∈H₂∖H₁} Q(‖h_k − h_k″‖/(2σ)). Lập luận: lỗi chỉ xảy ra khi z gần h_k″ của phần riêng bên kia hơn h_k (theo cách phá hòa của Lemma 1). Tính được trong O(|H|²).',
          ],
        ],
      },
    ],
  },
]

function ProblemCard({ idx, w }) {
  const [demo, href] = w.demo
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <h4 className="font-semibold text-slate-900">
        <span className="font-mono text-slate-400 mr-1">{idx}.</span>
        {w.name}
      </h4>
      <div className="text-sm text-slate-700 leading-relaxed">
        <span className="font-semibold text-slate-900">Căn cứ trong bài báo: </span>
        {w.basis}{' '}
        <a href={href} className="text-indigo-700 text-xs font-medium hover:underline whitespace-nowrap">
          (xem {demo})
        </a>
      </div>
      <div className="mt-1">
        <div className="text-sm font-semibold text-slate-900 mb-2">Hướng cải thiện</div>
        <ul className="space-y-2">
          {w.fixes.map(([src, text], i) => (
            <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-2">
              <span className={`shrink-0 h-fit text-xs px-2 py-0.5 rounded-full ${SRC[src].cls}`}>{SRC[src].label}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Review() {
  let n = 0
  return (
    <Section
      id="review"
      num="04"
      title="Đánh giá phương pháp: vấn đề và hướng cải thiện"
      subtitle="Mỗi vấn đề của Algorithm 1 có căn cứ trong bài báo. Hướng cải thiện được gắn nhãn theo nguồn."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-8 text-sm text-slate-700 flex flex-wrap gap-x-6 gap-y-2">
        {Object.entries(SRC).map(([k, s]) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
            {k === 'paper' && 'hướng do chính bài báo nêu'}
            {k === 'other' && 'phương pháp đã có trong tài liệu khác'}
            {k === 'team' && 'đề xuất của nhóm, chưa được kiểm chứng bằng thực nghiệm'}
          </span>
        ))}
      </div>
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-10">
          <h3 className="text-xl font-bold text-slate-900 mb-4">{g.title}</h3>
          <div className="grid lg:grid-cols-2 gap-5">
            {g.items.map((w) => (
              <ProblemCard key={w.name} idx={++n} w={w} />
            ))}
          </div>
        </div>
      ))}
    </Section>
  )
}
