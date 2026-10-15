import katex from 'katex'
import { useMemo } from 'react'

export function TeX({ children, block = false, className = '' }) {
  const html = useMemo(
    () => katex.renderToString(String(children), { displayMode: block, throwOnError: false, strict: false }),
    [children, block],
  )
  return block ? (
    <div className={`my-3 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export function Section({ id, num, title, subtitle, children }) {
  return (
    <section id={id} className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="text-indigo-600 font-mono text-sm font-semibold">{num}</div>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">{title}</h2>
          {subtitle && <p className="text-slate-500 mt-2 max-w-3xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

export function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
      {title && <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>}
      {children}
    </div>
  )
}

export function Prose({ children, className = '' }) {
  return <div className={`space-y-3 leading-relaxed text-slate-700 ${className}`}>{children}</div>
}

const CALLOUT = {
  info: 'bg-indigo-50 border-indigo-300 text-indigo-900',
  warn: 'bg-amber-50 border-amber-300 text-amber-900',
  ok: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  bad: 'bg-rose-50 border-rose-300 text-rose-900',
}

export function Callout({ type = 'info', title, children }) {
  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-4 ${CALLOUT[type]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, format = (v) => v, hint }) {
  return (
    <label className="block text-sm">
      <div className="flex justify-between mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-900">{format(value)}</span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <div className="text-xs text-slate-400 mt-0.5">{hint}</div>}
    </label>
  )
}

export function Select({ label, value, options, onChange }) {
  return (
    <label className="block text-sm">
      <div className="text-slate-600 mb-1">{label}</div>
      <select
        className="w-full border border-slate-300 rounded-md px-2 py-1.5 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Toggle({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-sm">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 ${value === o.value ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled }) {
  const cls = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  }[variant]
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
    >
      {children}
    </button>
  )
}

export function Progress({ done, total }) {
  const pct = total ? (100 * done) / total : 0
  return (
    <div className="w-full h-2 bg-slate-200 rounded">
      <div className="h-2 bg-indigo-500 rounded transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

// Màu thống nhất toàn trang
export const C = {
  h1: '#2563eb',
  h2: '#ea580c',
  both: '#7c3aed',
  target: '#dc2626',
  sensor: '#0f172a',
  ok: '#059669',
}

export const fmtP = (x) => (x === 0 ? '0' : x < 1e-3 ? x.toExponential(2) : x.toFixed(4))
