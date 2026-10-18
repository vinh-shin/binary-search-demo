import { Section } from '../components/ui'

// Nhược điểm của Algorithm 1 và hướng cải thiện tương ứng (không đánh giá cách trình bày của bài báo).
const SEVERITY = {
  'Nghiêm trọng': 'bg-rose-100 text-rose-800',
  'Trung bình': 'bg-amber-100 text-amber-800',
  Nhỏ: 'bg-slate-200 text-slate-700',
}

const GROUPS = [
  {
    title: 'Nhược điểm về cơ chế hoạt động',
    items: [
      {
        name: 'Không có bộ nhớ, bỏ phí thông tin của phép đo',
        severity: 'Nghiêm trọng',
        priority: 1,
        problem:
          'Hàm hợp lý (4) chỉ dùng phép đo của bước hiện tại. Sau β bước có β·|S| phép đo nhưng mỗi quyết định chỉ dựa trên |S| phép đo. Mỗi phép đo là một giá trị analog chứa nhiều thông tin về vị trí, nhưng chỉ được dùng để quyết định 1 bit (trái hay phải) rồi bị bỏ đi.',
        evidence: ['Demo 2', '#thuat-toan', 'likelihood được tính lại từ đầu ở mỗi bước'],
        fix: 'Duy trì phân phối hậu nghiệm trên toàn lưới, π^t(k) ∝ π^(t−1)(k)·p(z^t | k), và cộng dồn bằng chứng qua các bước như chia đôi xác suất (Horstein).',
      },
      {
        name: 'Quyết định cứng, không sửa được lỗi',
        severity: 'Nghiêm trọng',
        priority: 1,
        problem:
          'Một khi mục tiêu bị loại khỏi H^t thì không thể quay lại. Chồng lấn chỉ giảm xác suất loại oan, không khôi phục được khi đã sai; mọi bước sau đó đều vô nghĩa.',
        evidence: ['Demo 2', '#thuat-toan', 'bảng ghi "đã mất ở bước t", các bước sau không thể sửa'],
        fix: 'Thay vùng ứng viên bằng tập tin cậy nhỏ nhất có xác suất hậu nghiệm ≥ 1 − ε_t: vị trí bị loại vẫn còn xác suất khác 0 nên có thể quay lại, và P_e ≲ Σ ε_t. Có thể thêm bước kiểm chứng và quay lui lên nút cha như các thuật toán tìm kiếm nhị phân có nhiễu.',
      },
      {
        name: 'Quy tắc chọn nửa không tối ưu, chưa xác định cách phá hòa',
        severity: 'Trung bình',
        priority: 2,
        problem:
          'Quy tắc (5) giữ nửa chứa điểm hợp lý cực đại. Để cực tiểu Pr(l_T ∉ H^t) thì cần chọn nửa có tổng xác suất hậu nghiệm lớn hơn. Khi điểm hợp lý cực đại nằm trong vùng chồng lấn, hai nửa hòa nhau mà thuật toán không nói cách phá hòa.',
        evidence: ['Demo 3', '#voronoi', 'các ô Voronoi của điểm vùng giao (màu tím) nằm cả hai phía đường chéo'],
        fix: 'Chọn H^t = argmax_i Σ_{k∈H_i} π(k)·p(z^t | k). Quy tắc này tối ưu Bayes cho từng bước, không còn trường hợp hòa (vùng chồng lấn được cộng cho cả hai nửa), và chi phí tính toán không đổi.',
      },
      {
        name: 'Độ chồng lấn α cố định cho mọi bước',
        severity: 'Trung bình',
        priority: 2,
        problem:
          'Cùng một α được dùng từ đầu đến cuối, trong khi khả năng phân biệt thay đổi theo kích thước vùng: ở các bước cuối vùng nhỏ, các giả thuyết cho phép đo gần giống nhau nên dễ sai hơn.',
        evidence: ['Demo 2b', '#thuat-toan', 'P_e^t tăng trở lại ở các bước cuối'],
        fix: 'Chọn α_t theo từng bước bằng cách cân bằng lượng lỗi giảm được trên mỗi bit thông tin giữa các bước (điều kiện tối ưu dựa trên Remark 2); hoặc quyết định độ chồng lấn sau khi đo theo tỉ số log hợp lý giữa hai phần riêng, đo thêm khi còn mơ hồ (kiểm định tuần tự của Wald).',
      },
      {
        name: 'Phụ thuộc mạnh vào vị trí cảm biến và mô hình lý tưởng',
        severity: 'Trung bình',
        priority: 3,
        problem:
          'Hiệu quả của chồng lấn đổi hẳn theo cách đặt cảm biến: cảm biến cố định tạo ra đoạn nằm ngang, tăng α không giảm lỗi. Thuật toán còn giả định đặt được cảm biến ở đúng vị trí đối xứng, biết chính xác f, P₀, η, σ, nhiễu độc lập Gauss và mục tiêu đứng yên.',
        evidence: ['Demo 4', '#voronoi', 'đoạn nằm ngang khi cảm biến cố định; Demo 3 chế độ cảm biến lệch'],
        fix: 'Tối ưu đồng thời α và vị trí cảm biến (do đối xứng chỉ còn một biến, quét lưới là đủ); khi cảm biến rải cố định, chọn cảm biến sẵn có gần vị trí lý tưởng nhất; dùng hiệu z₁ − z₂ để triệt tiêu P₀ chưa biết.',
      },
    ],
  },
  {
    title: 'Hạn chế về phân tích lỗi',
    items: [
      {
        name: 'Không dự đoán chính xác được lỗi tổng',
        severity: 'Trung bình',
        priority: 3,
        problem:
          'Công thức (1) nhân các P_e^t tính với phân phối đều trên H^(t−1), chỉ đúng ở bước đầu. Từ bước 2, lỗi thật lệch tới +49% hoặc −32% theo cả hai chiều tùy α, nên (1) không phải cận trên cũng không phải cận dưới.',
        evidence: ['Demo 2b', '#thuat-toan', 'bước 1 khớp, từ bước 2 lệch theo cả hai chiều'],
        fix: 'Theo dõi phân bố có điều kiện thật của mục tiêu qua các bước bằng truy hồi ρ^t(k) ∝ ρ^(t−1)(k)·(1 − Pr(loại k ở bước t)), hoặc chứng minh cận trên và cận dưới cho sai lệch.',
      },
      {
        name: 'Công thức đóng chỉ cho hai cảm biến đối xứng',
        severity: 'Trung bình',
        priority: 3,
        problem:
          'Định lý 1 cần đúng hai cảm biến đặt đối xứng. Với nhiều cảm biến hơn hoặc đặt lệch, chỉ còn Bổ đề 1, tức tích phân Gauss trên hợp các ô Voronoi, không có công thức và không có cận.',
        evidence: ['Demo 3', '#voronoi', 'chế độ cảm biến lệch: biên quyết định thành đường gấp khúc'],
        fix: 'Dùng cận hợp theo cặp: P_e^t ≤ (2/|H|)·Σ_{k∈H₁∖H₂} Σ_{k″∈H₂∖H₁} Q(‖h_k − h_k″‖ / 2σ), đúng với số cảm biến và vị trí bất kỳ, tính được trong O(|H|²).',
      },
      {
        name: 'Lợi ích của chồng lấn không giảm đều theo α',
        severity: 'Nhỏ',
        priority: 3,
        problem:
          'Remark 2 cho đạo hàm −2Q(·), lớn nhất tại α = 0, nhưng đạo hàm không đơn điệu: gần bằng 0 quanh α ≈ ¼ (mép phần riêng đi qua cảm biến) rồi tăng lại. Công thức cũng không áp dụng được khi cảm biến dịch theo α.',
        evidence: ['Demo 4', '#voronoi', 'đường đạo hàm gần 0 quanh α = ¼'],
        fix: 'Khi cảm biến cố định, tránh chọn α trong vùng phẳng; khi cảm biến dịch theo α, tính lại đạo hàm có thêm số hạng ∂s/∂α và dùng nó trong bài toán chọn α_t ở trên.',
      },
    ],
  },
]

function WeaknessCard({ idx, w }) {
  const [demo, href, note] = w.evidence
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-slate-900">
          <span className="font-mono text-slate-400 mr-1">{idx}.</span>
          {w.name}
        </h4>
        <div className="flex gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY[w.severity]}`}>{w.severity}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Ưu tiên {w.priority}</span>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{w.problem}</p>
      <p className="text-xs text-slate-500">
        Bằng chứng:{' '}
        <a href={href} className="text-indigo-700 font-medium hover:underline">
          {demo}
        </a>{' '}
        ({note})
      </p>
      <div className="mt-auto rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-950">
        <span className="font-semibold">Hướng cải thiện: </span>
        {w.fix}
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
      title="Đánh giá thuật toán: nhược điểm và hướng cải thiện"
      subtitle="Mỗi nhược điểm của Algorithm 1 đi kèm bằng chứng từ các demo và một hướng cải thiện tương ứng."
    >
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 mb-8 text-sm text-indigo-950 leading-relaxed">
        <b>Thứ tự ưu tiên.</b> (1) Thêm bộ nhớ và quyết định mềm: hai nhược điểm nghiêm trọng nhất có chung một lời
        giải, giữ phân phối hậu nghiệm và dùng tập tin cậy, khi đó vùng chồng lấn tự co giãn theo độ mơ hồ của phép đo.
        (2) Đổi quy tắc chọn nửa sang tổng xác suất hậu nghiệm và chọn α thích nghi theo bước. (3) Các cải tiến về cảm
        biến và về phân tích lỗi. Mọi cải tiến nên được so sánh với thuật toán gốc ở <b>cùng tổng số phép đo</b>, vì α
        lớn hơn luôn tốn thêm bước.
      </div>
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-10">
          <h3 className="text-xl font-bold text-slate-900 mb-4">{g.title}</h3>
          <div className="grid lg:grid-cols-2 gap-5">
            {g.items.map((w) => (
              <WeaknessCard key={w.name} idx={++n} w={w} />
            ))}
          </div>
        </div>
      ))}
    </Section>
  )
}
