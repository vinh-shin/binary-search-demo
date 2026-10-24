import { useEffect, useState } from 'react'
import { DrawerProvider, Section, TheoryDrawer, useDrawer } from './components/ui'
import TreeDemo from './sections/TreeDemo'
import StepDemo from './sections/StepDemo'
import VoronoiDemo from './sections/VoronoiDemo'
import Review from './sections/Review'
import PaperGuide from './guide/PaperGuide'
import Presentation from './present/Presentation'

const TABS = [
  { id: 'tong-quan', label: 'Tổng quan & Động lực', Comp: Overview },
  { id: 'thuat-toan', label: 'Bài toán & Thuật toán', Comp: ProblemAlgorithm },
  { id: 'voronoi', label: 'Voronoi & Thm 1', Comp: VoronoiSection },
  { id: 'review', label: 'Đánh giá', Comp: Review },
]

// Trang "Đọc hiểu bài báo" mở từ icon ở header, nằm ngoài dãy tab
const GUIDE = 'doc-hieu'
const isGuideHash = () => window.location.hash.slice(1) === GUIDE

// Trang trình chiếu: chỉ các demo, chuyển slide bằng Back/Next, mở từ icon ▶ ở header
const PRESENT = 'trinh-chieu'
const isPresentHash = () => window.location.hash.slice(1) === PRESENT

const tabFromHash = () => {
  const raw = window.location.hash.slice(1)
  // link cũ của các tab đã gộp
  const h = { 'bai-toan': 'thuat-toan', 'dong-luc': 'tong-quan' }[raw] ?? raw
  return TABS.some((t) => t.id === h) ? h : TABS[0].id
}

export default function App() {
  return (
    <DrawerProvider>
      <Shell />
    </DrawerProvider>
  )
}

function Shell() {
  const [active, setActive] = useState(tabFromHash)
  // Tab đã mở thì giữ nguyên (chỉ ẩn đi) để demo không bị reset khi chuyển tab
  const [visited, setVisited] = useState(() => new Set(isGuideHash() || isPresentHash() ? [] : [tabFromHash()]))
  const [guide, setGuide] = useState(isGuideHash)
  const [present, setPresent] = useState(isPresentHash)
  const { drawer, close } = useDrawer()

  useEffect(() => {
    const onHash = () => {
      const g = isGuideHash()
      const pr = isPresentHash()
      setGuide(g)
      setPresent(pr)
      if (!g && !pr) {
        const id = tabFromHash()
        setActive(id)
        setVisited((v) => new Set(v).add(id))
      }
      close()
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const idx = TABS.findIndex((t) => t.id === active)
  const prev = TABS[idx - 1]
  const next = TABS[idx + 1]

  if (present) return <Presentation exitHref={`#${active}`} />

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center gap-3">
          <div className="flex-1 min-w-0 h-full flex items-center gap-4 overflow-x-auto">
            <a href="#tong-quan" className="font-bold text-indigo-700 whitespace-nowrap mr-2">
              Overlap Binary Search
            </a>
            {TABS.map((t, i) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`text-sm whitespace-nowrap h-full flex items-center border-b-2 transition ${
                  t.id === active && !guide
                    ? 'border-indigo-600 text-indigo-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-indigo-700'
                }`}
              >
                <span className="font-mono text-xs text-slate-400 mr-1">{String(i + 1).padStart(2, '0')}</span>
                {t.label}
              </a>
            ))}
          </div>
          <a
            href={`#${PRESENT}`}
            title="Trình chiếu các demo"
            aria-label="Trình chiếu các demo"
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-base border transition bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <span aria-hidden>▶</span>
          </a>
          <a
            href={guide ? `#${active}` : `#${GUIDE}`}
            title={guide ? 'Quay lại các demo' : 'Đọc hiểu bài báo: diễn giải từng mục, công thức và ví dụ'}
            aria-label={guide ? 'Quay lại các demo' : 'Đọc hiểu bài báo'}
            className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-lg border transition ${
              guide
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <span aria-hidden>📄</span>
          </a>
        </div>
      </nav>

      {/* Khi drawer mở trên màn hình rộng, nội dung bị đẩy sang trái để không bị che */}
      <div
        className={`flex-1 flex flex-col transition-[padding] duration-300 ${drawer ? 'lg:pr-[min(44vw,640px)]' : ''}`}
      >
        <main className="flex-1">
          {guide && <PaperGuide />}
          {TABS.map(({ id, Comp }) =>
            visited.has(id) ? (
              <div key={id} hidden={guide || id !== active}>
                <Comp />
              </div>
            ) : null,
          )}
        </main>

        <div className={`max-w-6xl mx-auto w-full px-4 py-8 flex justify-between gap-4 ${guide ? 'hidden' : ''}`}>
          {prev ? (
            <a
              href={`#${prev.id}`}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm"
            >
              ← {prev.label}
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a
              href={`#${next.id}`}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
            >
              {next.label} →
            </a>
          )}
        </div>

        <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-200">
          Dựa trên: K. Buyukkalayci, M. Karakas, X. Li, C. Fragouli, “Enhancing Binary Search via Overlapping
          Partitions”, arXiv:2504.20513v2, 2025. Toàn bộ mô phỏng chạy trong trình duyệt.
        </footer>
      </div>

      <TheoryDrawer />
    </div>
  )
}

function DrawerHint() {
  return (
    <p className="text-sm text-slate-500 mt-2">
      Bấm <span className="font-medium text-indigo-700">📖 Lý thuyết</span> ở góc mỗi demo để xem công thức và giải
      thích.
    </p>
  )
}

// Tab đầu: giới thiệu ngắn và Demo 1
function Overview() {
  const demos = [
    ['Demo 1', 'Cây phân hoạch rời nhau và chồng lấn', '#dong-luc'],
    ['Demo 2', 'Chạy Algorithm 1 từng bước (1D/2D)', '#thuat-toan'],
    ['Demo 3', 'Không gian đo, ô Voronoi và Theorem 1', '#voronoi'],
  ]
  return (
    <>
      <header className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-indigo-200 font-mono text-sm mb-3">arXiv:2504.20513 · UCLA · 2025</div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-4xl">
            Binary Search với phân hoạch chồng lấn
          </h1>
          <p className="mt-5 text-lg text-indigo-100 max-w-3xl leading-relaxed">
            Khi quyết định bị nhiễu, cách chia hai nửa rời nhau của binary search dễ bị lan truyền lỗi. Bài báo chia
            thành hai nửa <b>chồng lấn</b> một phần (tham số α) để mục tiêu ít bị loại do nhiễu hơn, đổi lại cần thêm
            bước tìm kiếm. Các demo dưới đây minh họa ý tưởng, thuật toán và phân tích lỗi của bài báo.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {demos.map(([name, desc, href]) => (
              <a
                key={name}
                href={href}
                onClick={(e) => {
                  if (href === '#dong-luc') {
                    e.preventDefault()
                    document.getElementById('dong-luc')?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-3 border border-white/20 transition"
              >
                <div className="font-semibold">{name}</div>
                <div className="text-sm text-indigo-100">{desc}</div>
              </a>
            ))}
          </div>
        </div>
      </header>
      <Section
        id="dong-luc"
        num="01"
        title="Động lực: vì sao binary search dễ vỡ khi có nhiễu?"
        subtitle="Demo 1 tái tạo Fig. 1 của bài báo: cây quyết định cho n = 8 phần tử với phân hoạch rời nhau (độ sâu 3) và phân hoạch chồng lấn (độ sâu 4)."
      >
        <DrawerHint />
        <div className="mt-6">
          <TreeDemo />
        </div>
      </Section>
    </>
  )
}

function ProblemAlgorithm() {
  return (
    <Section
      id="thuat-toan"
      num="02"
      title="Bài toán và thuật toán"
      subtitle="Demo 2 chạy Algorithm 1 từng bước trên bài toán định vị vùng chứa mục tiêu bằng cảm biến có nhiễu, trong không gian một chiều hoặc hai chiều."
    >
      <DrawerHint />
      <div className="space-y-6 mt-6">
        <StepDemo />
      </div>
    </Section>
  )
}

function VoronoiSection() {
  return (
    <Section
      id="voronoi"
      num="03"
      title="Hình học của lỗi: ô Voronoi và Theorem 1"
      subtitle="Demo 3 minh họa Lemma 1 và Theorem 1 trong không gian phép đo: quyết định ML ứng với các ô Voronoi, và với hai cảm biến đối xứng thì xác suất lỗi có công thức đóng."
    >
      <DrawerHint />
      <div className="space-y-6 mt-6">
        <VoronoiDemo />
      </div>
    </Section>
  )
}
