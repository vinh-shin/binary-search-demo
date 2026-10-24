import { Section, TeX } from '../components/ui'

// Hai vấn đề chính của Algorithm 1, giải pháp và giả thuyết của nhóm (chưa kiểm chứng), khớp Chương 4 của báo cáo.
const PROBLEMS = [
  {
    name: 'Bỏ phí bằng chứng của các bước trước',
    demo: ['Demo 2', '#thuat-toan'],
    problem: (
      <>
        <p>
          Algorithm 1 giống một người hỏi đường nhưng chỉ nhớ câu trả lời mới nhất. Ở bước <TeX>t</TeX>, điểm của mỗi vị
          trí chỉ phụ thuộc vào phép đo của chính bước đó:
        </p>
        <TeX block>{'\\ell(k) = \\log p\\left(z^t \\mid l_T = k\\right)'}</TeX>
        <p>
          Các phép đo <TeX>{'z^1, \\dots, z^{t-1}'}</TeX> không được dùng lại. Sau khi chọn nửa, nửa còn lại bị loại hẳn,
          nên chỉ cần một phép đo bị nhiễu nặng là mục tiêu có thể bị loại và không bước nào sau đó sửa được. Ngoài ra,
          khi vị trí có điểm cao nhất nằm trong vùng chồng lấn thì hai nửa bằng điểm, và quy tắc chọn nửa không cho biết
          nên chọn nửa nào.
        </p>
      </>
    ),
    solution:
      'Cộng dồn bằng chứng qua các bước. Giữ nguyên cách chia hai nửa chồng lấn, nhưng lưu một xác suất cho mọi vị trí trên toàn lưới. Sau mỗi bước, xác suất của từng vị trí được nhân với độ khớp của nó với phép đo mới. Khi chọn nửa, so tổng xác suất của mỗi nửa và giữ nửa có tổng lớn hơn. Cái giá là mỗi bước phải tính trên toàn lưới.',
    hypothesis:
      'Nếu cộng dồn bằng chứng và chọn nửa có tổng xác suất lớn hơn, thì một phép đo nhiễu khó làm mất mục tiêu, nên với cùng số phép đo, lỗi tổng sẽ thấp hơn Algorithm 1. Lý do: theo quy tắc Bayes, bằng chứng tích lũy từ nhiều phép đo độc lập đáng tin hơn một phép đo đơn lẻ.',
  },
  {
    name: 'Độ chồng lấn cố định cho mọi bước',
    demo: ['Demo 3', '#voronoi'],
    problem: (
      <>
        <p>
          Algorithm 1 giống một người lái xe giữ cùng một khoảng cách an toàn trên mọi đoạn đường, dù đường khô hay trơn.
          Nó dùng một độ chồng lấn chung cho mọi bước:
        </p>
        <TeX block>{'\\alpha_1 = \\alpha_2 = \\dots = \\alpha_\\beta = \\alpha'}</TeX>
        <p>
          Trong khi đó, các bước không khó như nhau. Theo Theorem 1, lỗi của một bước đến từ các vị trí trong phần riêng có
          phép đo kỳ vọng gần ranh giới, tức <TeX>d_k</TeX> nhỏ. Mức khó này thay đổi theo bước. Một α chung vì vậy hoặc quá
          nhỏ cho các bước khó, khiến lỗi vẫn cao, hoặc quá lớn cho các bước dễ, khiến tốn thêm bước mà lỗi gần như không
          giảm.
        </p>
      </>
    ),
    solution:
      'Độ chồng lấn riêng cho từng bước. Mỗi bước t dùng một αₜ riêng: bước khó phân biệt thì chồng lấn nhiều hơn, bước dễ thì chồng lấn ít để tiết kiệm bước. Các αₜ được chọn trước khi chạy, sao cho tổng lỗi của các bước nhỏ nhất mà vùng vẫn thu hẹp về kích thước yêu cầu.',
    hypothesis:
      'Nếu chồng lấn nhiều ở bước khó và ít ở bước dễ, thì với cùng số bước, lỗi tổng sẽ thấp hơn so với dùng một α chung. Lý do: chồng lấn có lợi nhất khi đưa được các vị trí dễ nhầm vào vùng chồng lấn, và các vị trí này tập trung ở những bước khó.',
  },
]

function Part({ label, children }) {
  return (
    <div className="text-sm text-slate-700 leading-relaxed space-y-2">
      <div className="font-semibold text-slate-900">{label}</div>
      {children}
    </div>
  )
}

function ProblemCard({ idx, w }) {
  const [demo, href] = w.demo
  return (
    <div className="@container bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-900">
        <span className="text-indigo-600 mr-1">Vấn đề {idx}.</span>
        {w.name}{' '}
        <a href={href} className="text-indigo-700 text-xs font-medium hover:underline whitespace-nowrap">
          (xem {demo})
        </a>
      </h3>
      <Part label="Vấn đề">{w.problem}</Part>
      <Part label="Giải pháp">
        <p>{w.solution}</p>
      </Part>
      <Part label="Giả thuyết">
        <p>{w.hypothesis}</p>
      </Part>
    </div>
  )
}

export default function Review() {
  return (
    <Section
      id="review"
      num="04"
      title="Đánh giá phương pháp: hai vấn đề và giải pháp"
      subtitle="Hai vấn đề chính của Algorithm 1, mỗi vấn đề kèm giải pháp và giả thuyết của nhóm. Các giải pháp chưa được kiểm chứng bằng thực nghiệm."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {PROBLEMS.map((w, i) => (
          <ProblemCard key={w.name} idx={i + 1} w={w} />
        ))}
      </div>
    </Section>
  )
}
