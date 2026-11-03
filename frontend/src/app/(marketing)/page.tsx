'use client'

import Link from 'next/link'
import { ArrowRight, Play, BookCheck, BarChart3, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between px-10 sm:px-20">
        <Link href="/" className="text-xl font-bold">
          <span className="text-cyan-500">AI</span>{' '}
          <span className="text-zinc-900 dark:text-zinc-100">for All</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            登入
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            立即開始
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center bg-gradient-to-b from-cyan-50 to-white px-6 py-20 text-center dark:from-zinc-900 dark:to-zinc-900">
        <div className="mb-8 flex items-center gap-1.5 rounded-full bg-cyan-100 px-4 py-1.5 dark:bg-cyan-900/40">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[13px] font-medium text-cyan-700 dark:text-cyan-300">
            人人都能免費學 AI
          </span>
        </div>

        <h1 className="max-w-[900px] text-4xl leading-[1.15] font-bold text-zinc-900 sm:text-[56px] dark:text-zinc-100">
          學會改變職涯的 AI 技能
        </h1>

        <p className="mt-6 max-w-[700px] text-base leading-relaxed text-zinc-500 sm:text-lg">
          精選 YouTube 頂尖創作者的教學影片，搭配實作測驗，確保你真的學會。免費、沒有門檻 —
          專心學習就好。
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/courses"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            探索課程
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-xl border border-zinc-300 px-8 py-4 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
          >
            如何運作
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center bg-white px-8 py-20 sm:px-[120px] dark:bg-zinc-900">
        <h2 className="text-center text-[36px] font-bold text-zinc-900 dark:text-zinc-100">
          學 AI 需要的，這裡都有
        </h2>
        <p className="mt-4 max-w-[650px] text-center text-base leading-relaxed text-zinc-500">
          我們提供結構化、重實作的學習體驗：精選影片課程、互動測驗，以及學習進度追蹤。
        </p>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-cyan-50 p-8 dark:bg-cyan-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-cyan-500">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">精選影片課程</h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              向優秀的 YouTube 創作者學習，教學影片經專人挑選，依主題與難度分類。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-amber-50 p-8 dark:bg-amber-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-amber-500">
              <BookCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">互動測驗</h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              每堂課後用單選題與簡答題，檢驗你的理解。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-zinc-700">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">進度追蹤</h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              用完課徽章與個人儀表板，記錄你的學習歷程。
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="flex flex-col items-center bg-zinc-50 px-8 py-20 sm:px-[120px] dark:bg-zinc-800/50"
      >
        <h2 className="text-center text-[36px] font-bold text-zinc-900 dark:text-zinc-100">
          如何運作
        </h2>
        <p className="mt-4 text-center text-base text-zinc-500">三個步驟就能開始</p>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              num: '1',
              title: '瀏覽課程',
              desc: '依工具、技能與難度，瀏覽我們的 AI 課程。',
            },
            {
              num: '2',
              title: '觀看學習',
              desc: '直接在平台上觀看專人精選的 YouTube 教學影片。',
            },
            {
              num: '3',
              title: '測驗與追蹤',
              desc: '完成測驗檢驗所學，並獲得完課徽章。',
            },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500 text-lg font-bold text-white">
                {step.num}
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {step.title}
              </h3>
              <p className="text-center text-sm leading-relaxed text-zinc-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center bg-gradient-to-b from-cyan-50 to-cyan-100 px-8 py-20 text-center dark:from-zinc-900 dark:to-zinc-800">
        <h2 className="text-[36px] font-bold text-zinc-900 dark:text-zinc-100">
          準備好開始學習了嗎？
        </h2>
        <p className="mt-4 max-w-[600px] text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          加入我們的學習社群，今天就開始累積真正的 AI 技能 — 完全免費。
        </p>
        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          免費開始學習
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between bg-zinc-900 px-10 py-8 sm:px-20">
        <div>
          <p className="text-lg font-bold text-white">AI for All</p>
          <p className="mt-2 text-[13px] text-zinc-400">© 2026 AI for All. 人人都能免費學 AI。</p>
        </div>
        <div className="flex gap-6">
          {['關於我們', '聯絡我們', '隱私權政策', '使用條款'].map((link) => (
            <span key={link} className="text-sm text-zinc-400">
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}
