// Trang trình chiếu (#trinh-chieu): chỉ hiển thị các demo, chuyển slide bằng nút hoặc phím mũi tên.
// Không có nội dung lý thuyết: các nút 📖 bị ẩn qua HideTheoryCtx. Mọi slide được giữ trong bộ nhớ (chỉ ẩn đi)
// để demo không bị reset khi quay lại.
import { useCallback, useEffect, useState } from 'react'
import { HideTheoryCtx, TeX } from '../components/ui'
import TreeDemo from '../sections/TreeDemo'
import StepDemo from '../sections/StepDemo'
import VoronoiDemo from '../sections/VoronoiDemo'

function ReviewSlide() {
  const items = [
    {
      title: 'Vấn đề 1: bỏ phí bằng chứng của các bước trước',
      problem: (
        <>
          Mỗi bước chỉ chấm điểm bằng phép đo hiện tại, <TeX>{'\\ell(k) = \\log p(z^t \\mid l_T = k)'}</TeX>, rồi loại hẳn
          nửa kia. Một phép đo nhiễu nặng có thể làm mất mục tiêu vĩnh viễn.
        </>
      ),
      solution: 'Cộng dồn bằng chứng qua các bước và chọn nửa có tổng xác suất lớn hơn.',
      hypothesis: 'Với cùng số phép đo, lỗi tổng thấp hơn Algorithm 1.',
    },
    {
      title: 'Vấn đề 2: độ chồng lấn cố định cho mọi bước',
      problem: (
        <>
          Mọi bước dùng chung một độ chồng lấn, <TeX>{'\\alpha_1 = \\dots = \\alpha_\\beta = \\alpha'}</TeX>, dù có bước khó
          phân biệt, có bước dễ.
        </>
      ),
      solution: 'Dùng độ chồng lấn riêng αₜ cho từng bước: bước khó chồng lấn nhiều, bước dễ chồng lấn ít.',
      hypothesis: 'Với cùng số bước, lỗi tổng thấp hơn so với dùng một α chung.',
    },
  ]
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-semibold text-slate-900 text-xl mb-5">Đánh giá · Hai vấn đề và giải pháp</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.title} className="rounded-lg border border-slate-200 p-5 space-y-3 text-slate-700 leading-relaxed">
            <div className="font-semibold text-indigo-700 text-lg">{it.title}</div>
            <p>{it.problem}</p>
            <p>
              <span className="font-semibold text-slate-900">Giải pháp: </span>
              {it.solution}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Giả thuyết: </span>
              {it.hypothesis}
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 mt-5">Các giải pháp là đề xuất của nhóm, chưa được kiểm chứng bằng thực nghiệm.</p>
    </div>
  )
}

const SLIDES = [
  { label: 'Demo 1', Comp: TreeDemo },
  { label: 'Demo 2', Comp: StepDemo },
  { label: 'Demo 3', Comp: VoronoiDemo },
  { label: 'Đánh giá', Comp: ReviewSlide },
]

// Phím tắt không áp dụng khi đang thao tác trong ô nhập (thanh trượt dùng phím mũi tên)
const isEditable = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')

export default function Presentation({ exitHref = '#tong-quan' }) {
  const [idx, setIdx] = useState(0)
  const [isFull, setIsFull] = useState(Boolean(document.fullscreenElement))
  const last = SLIDES.length - 1
  const go = useCallback((d) => setIdx((i) => Math.min(last, Math.max(0, i + d))), [last])

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (isEditable(document.activeElement) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFull()
      }
    }
    const onFull = () => setIsFull(Boolean(document.fullscreenElement))
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFull)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFull)
    }
  }, [go, toggleFull])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [idx])

  const btn = 'px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

  return (
    <HideTheoryCtx.Provider value={true}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
            <span className="font-bold text-indigo-700">Overlap Binary Search</span>
            <span className="text-sm text-slate-500">{SLIDES[idx].label}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggleFull}
                title="Toàn màn hình (phím F)"
                className="cursor-pointer px-3 py-1 rounded-md text-sm border border-slate-300 bg-white hover:bg-slate-100"
              >
                {isFull ? '⤡ Thoát toàn màn hình' : '⤢ Toàn màn hình'}
              </button>
              <a
                href={exitHref}
                onClick={() => document.fullscreenElement && document.exitFullscreen?.()}
                className="px-3 py-1 rounded-md text-sm border border-slate-300 bg-white hover:bg-slate-100"
              >
                ✕ Thoát trình chiếu
              </a>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          {SLIDES.map(({ label, Comp }, i) => (
            <div key={label} hidden={i !== idx}>
              <Comp />
            </div>
          ))}
        </main>

        <div className="sticky bottom-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <button onClick={() => go(-1)} disabled={idx === 0} className={`${btn} border border-slate-300 bg-white hover:bg-slate-100`}>
              ← Back
            </button>
            <div className="flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setIdx(i)}
                  title={s.label}
                  aria-label={s.label}
                  className={`cursor-pointer w-2.5 h-2.5 rounded-full transition ${i === idx ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
              <span className="ml-2 text-sm font-mono text-slate-600">
                {idx + 1} / {SLIDES.length}
              </span>
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className={`${btn} bg-indigo-600 hover:bg-indigo-700 text-white`}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </HideTheoryCtx.Provider>
  )
}
