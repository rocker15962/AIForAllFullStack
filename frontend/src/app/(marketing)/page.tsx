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
            Log In
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center bg-gradient-to-b from-cyan-50 to-white px-6 py-20 text-center dark:from-zinc-900 dark:to-zinc-900">
        <div className="mb-8 flex items-center gap-1.5 rounded-full bg-cyan-100 px-4 py-1.5 dark:bg-cyan-900/40">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[13px] font-medium text-cyan-700 dark:text-cyan-300">
            Free AI Education for Everyone
          </span>
        </div>

        <h1 className="max-w-[900px] text-4xl leading-[1.15] font-bold text-zinc-900 sm:text-[56px] dark:text-zinc-100">
          Learn AI Skills That Transform Your Career
        </h1>

        <p className="mt-6 max-w-[700px] text-base leading-relaxed text-zinc-500 sm:text-lg">
          Curated video courses from top YouTube creators, with hands-on quizzes to ensure you truly
          understand. No cost, no barriers — just learning.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/courses"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-cyan-600"
          >
            Explore Courses
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-xl border border-zinc-300 px-8 py-4 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center bg-white px-8 py-20 sm:px-[120px] dark:bg-zinc-900">
        <h2 className="text-center text-[36px] font-bold text-zinc-900 dark:text-zinc-100">
          Everything You Need to Learn AI
        </h2>
        <p className="mt-4 max-w-[650px] text-center text-base leading-relaxed text-zinc-500">
          Our platform provides a structured, hands-on learning experience with curated video
          courses, interactive quizzes, and progress tracking.
        </p>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-cyan-50 p-8 dark:bg-cyan-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-cyan-500">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Curated Video Courses
            </h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              Learn from the best YouTube creators with expert-selected tutorials organized by topic
              and difficulty.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-amber-50 p-8 dark:bg-amber-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-amber-500">
              <BookCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Interactive Quizzes
            </h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              Test your understanding with multiple-choice and short-answer questions after each
              course.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] bg-zinc-700">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Progress Tracking
            </h3>
            <p className="text-center text-sm leading-relaxed text-zinc-500">
              Track your learning journey with completion badges and a personalized dashboard.
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
          How It Works
        </h2>
        <p className="mt-4 text-center text-base text-zinc-500">
          Get started in three simple steps
        </p>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              num: '1',
              title: 'Browse Courses',
              desc: 'Explore our library of AI courses filtered by tool, skill, and difficulty level.',
            },
            {
              num: '2',
              title: 'Watch & Learn',
              desc: 'Watch expert-curated YouTube tutorials embedded right on the platform.',
            },
            {
              num: '3',
              title: 'Test & Track',
              desc: 'Complete quizzes to test your knowledge and earn completion badges.',
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
          Ready to Start Learning?
        </h2>
        <p className="mt-4 max-w-[600px] text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Join our community of learners and start building real AI skills today — completely free.
        </p>
        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          Get Started for Free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between bg-zinc-900 px-10 py-8 sm:px-20">
        <div>
          <p className="text-lg font-bold text-white">AI for All</p>
          <p className="mt-2 text-[13px] text-zinc-400">
            © 2026 AI for All. Free AI education for everyone.
          </p>
        </div>
        <div className="flex gap-6">
          {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
            <span key={link} className="text-sm text-zinc-400">
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}
