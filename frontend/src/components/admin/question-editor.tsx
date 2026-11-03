'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import type { Question, QuestionOption } from '@/types'

interface QuestionEditorProps {
  courseId: string
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
}

function getOptionText(option: string | QuestionOption): string {
  if (typeof option === 'string') return option
  return option.text
}

function parseOptions(options: unknown): (string | QuestionOption)[] {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try {
      return JSON.parse(options)
    } catch {
      return []
    }
  }
  return []
}

function getQuestionTypeBadge(type: string) {
  const isMC = type === 'multiple_choice' || type === 'multiple-choice'
  return {
    label: isMC ? 'Multiple Choice' : 'Short Answer',
    classes: isMC
      ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
}

// Modal form state
interface QuestionFormData {
  type: 'multiple_choice' | 'short_answer'
  question: string
  options: string[]
  correctAnswer: number
  /** Short answer only: the AI grades learners' answers against it (BR-09, BR-29). */
  sampleAnswer: string
  explanation: string
}

const emptyForm: QuestionFormData = {
  type: 'multiple_choice',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: -1,
  sampleAnswer: '',
  explanation: '',
}

export function QuestionEditor({ questions, onQuestionsChange }: QuestionEditorProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<QuestionFormData>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  function openAdd() {
    setEditingIndex(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(index: number) {
    const q = questions[index]
    const isMC = q.type === 'multiple_choice' || q.type === 'multiple-choice'
    const parsedOpts = parseOptions(q.options)
    const opts =
      isMC && parsedOpts.length > 0 ? parsedOpts.map((o) => getOptionText(o)) : ['', '', '', '']
    let correctIdx = -1
    if (isMC && parsedOpts.length > 0) {
      parsedOpts.forEach((o, i) => {
        const optId = typeof o === 'string' ? String(i) : o.id
        if (q.correctAnswer === optId || q.correctAnswer === i || q.correctAnswer === String(i)) {
          correctIdx = i
        }
      })
    }
    setEditingIndex(index)
    setForm({
      type: isMC ? 'multiple_choice' : 'short_answer',
      question: q.question,
      options: opts,
      correctAnswer: correctIdx,
      sampleAnswer: isMC ? '' : q.sampleAnswer || '',
      explanation: q.explanation || '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  function handleDelete(index: number) {
    const updated = questions.filter((_, i) => i !== index)
    onQuestionsChange(updated)
  }

  function handleSave() {
    setFormError(null)
    if (!form.question.trim()) {
      setFormError('Question text is required')
      return
    }
    if (form.type === 'multiple_choice') {
      if (form.options.some((o) => !o.trim())) {
        setFormError('All options are required')
        return
      }
      if (form.correctAnswer < 0) {
        setFormError('Select the correct answer')
        return
      }
    }
    if (form.type === 'short_answer' && !form.sampleAnswer.trim()) {
      setFormError('Sample answer is required')
      return
    }

    const optionIds = ['a', 'b', 'c', 'd']
    const newQuestion: Question = {
      id: editingIndex !== null ? questions[editingIndex].id : `temp-${Date.now()}`,
      courseId: '',
      type: form.type,
      question: form.question,
      options:
        form.type === 'multiple_choice'
          ? form.options.map((text, i) => ({ id: optionIds[i], text }))
          : undefined,
      correctAnswer: form.type === 'multiple_choice' ? optionIds[form.correctAnswer] : undefined,
      sampleAnswer: form.type === 'short_answer' ? form.sampleAnswer.trim() : undefined,
      explanation: form.explanation || undefined,
      order: editingIndex !== null ? questions[editingIndex].order : questions.length + 1,
    }

    if (editingIndex !== null) {
      const updated = [...questions]
      updated[editingIndex] = newQuestion
      onQuestionsChange(updated)
    } else {
      onQuestionsChange([...questions, newQuestion])
    }
    setModalOpen(false)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quiz Questions</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} added
          </span>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No questions yet</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Click &quot;Add Question&quot; to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => {
            const badge = getQuestionTypeBadge(question.type)
            const isMC = question.type === 'multiple_choice' || question.type === 'multiple-choice'

            return (
              <div
                key={question.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Question {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(index)}
                      className="rounded-md p-1.5 text-zinc-400 hover:text-cyan-500 dark:text-zinc-500 dark:hover:text-cyan-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="rounded-md p-1.5 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mb-2 text-sm text-zinc-800 dark:text-zinc-200">{question.question}</p>

                {isMC && parseOptions(question.options).length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {parseOptions(question.options).map((opt, i) => {
                      const text = getOptionText(opt)
                      const optId = typeof opt === 'string' ? String(i) : opt.id
                      const isCorrect =
                        question.correctAnswer === optId ||
                        question.correctAnswer === i ||
                        question.correctAnswer === String(i)
                      return (
                        <div
                          key={i}
                          className={`rounded-md px-3 py-1.5 text-xs ${
                            isCorrect
                              ? 'bg-cyan-50 font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {text}
                          {isCorrect && ' ✓'}
                        </div>
                      )
                    })}
                  </div>
                )}

                {!isMC && question.sampleAnswer && (
                  <div className="mt-2 rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                    <p className="text-xs font-medium text-zinc-500">Sample answer:</p>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {question.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Question Editor Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white p-7 shadow-xl dark:bg-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {editingIndex !== null ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Question Type toggle */}
            <div className="mb-6">
              <label className="mb-2 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                Question Type
              </label>
              <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-700">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: 'multiple_choice' }))}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    form.type === 'multiple_choice'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-100'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: 'short_answer' }))}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    form.type === 'short_answer'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-100'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  Short Answer
                </button>
              </div>
            </div>

            {/* Question text */}
            <div className="mb-6">
              <label className="mb-2 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                Question
              </label>
              <textarea
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="Enter your question..."
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* MC: Options */}
            {form.type === 'multiple_choice' && (
              <div className="mb-6">
                <label className="mb-2 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                  Options (click radio to mark correct answer)
                </label>
                <div className="flex flex-col gap-2.5">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, correctAnswer: i }))}
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                          form.correctAnswer === i
                            ? 'border-cyan-500 bg-cyan-500'
                            : 'border-zinc-300 bg-white dark:border-zinc-600'
                        }`}
                      >
                        {form.correctAnswer === i && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...form.options]
                          newOpts[i] = e.target.value
                          setForm((f) => ({ ...f, options: newOpts }))
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className={`h-[42px] flex-1 rounded-lg border px-3 text-sm transition-colors outline-none ${
                          form.correctAnswer === i
                            ? 'border-cyan-300 bg-cyan-50 text-cyan-700 focus:border-cyan-500 dark:border-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300'
                            : 'border-zinc-300 bg-white text-zinc-900 focus:border-cyan-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SA: Sample answer (BR-29) */}
            {form.type === 'short_answer' && (
              <div className="mb-6">
                <label
                  htmlFor="sample-answer"
                  className="mb-2 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Sample answer
                </label>
                <textarea
                  id="sample-answer"
                  value={form.sampleAnswer}
                  onChange={(e) => setForm((f) => ({ ...f, sampleAnswer: e.target.value }))}
                  placeholder="Write a model answer…"
                  rows={2}
                  aria-describedby="sample-answer-hint"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <p
                  id="sample-answer-hint"
                  className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400"
                >
                  AI grades learners&rsquo; answers against this sample answer.
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="mb-6">
              <label className="mb-2 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                Explanation (optional)
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
                rows={2}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Error */}
            {formError && <p className="mb-4 text-sm text-rose-500">{formError}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
