'use client'

import { useState } from 'react'
import { WorkoutEntry } from '@/types'
import { supabase } from '@/lib/supabase'
import { WORKOUT_TYPES } from '@/lib/config'

interface WorkoutSectionProps {
  workout: WorkoutEntry | null
  date: string
  onRefresh: () => void
}

export default function WorkoutSection({ workout, date, onRefresh }: WorkoutSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: WORKOUT_TYPES[0],
    duration_minutes: '',
    calories_burned: '',
    notes: '',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.duration_minutes) return
    setSaving(true)
    await supabase.from('workout_entries').insert({
      date,
      type: form.type,
      duration_minutes: parseInt(form.duration_minutes),
      calories_burned: form.calories_burned ? parseInt(form.calories_burned) : null,
      notes: form.notes || null,
    })
    setSaving(false)
    setShowForm(false)
    onRefresh()
  }

  async function handleDelete() {
    if (!workout) return
    await supabase.from('workout_entries').delete().eq('id', workout.id)
    onRefresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Workout</h2>
        {workout && (
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600">
            Remove
          </button>
        )}
      </div>

      {workout ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💪</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{workout.type}</p>
            <p className="text-xs text-gray-500">
              {workout.duration_minutes} min
              {workout.calories_burned ? ` · ~${workout.calories_burned} cal burned` : ''}
            </p>
            {workout.notes && <p className="text-xs text-gray-400 mt-0.5">{workout.notes}</p>}
          </div>
        </div>
      ) : showForm ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) <span className="text-red-400">*</span></label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                placeholder="30"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                inputMode="numeric"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cal Burned (est.)</label>
              <input
                type="number"
                value={form.calories_burned}
                onChange={(e) => setForm({ ...form, calories_burned: e.target.value })}
                placeholder="optional"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                inputMode="numeric"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. 20 min bike + kettlebell"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-green-300 hover:text-green-500 transition-colors"
        >
          + Log today&apos;s workout
        </button>
      )}
    </div>
  )
}
