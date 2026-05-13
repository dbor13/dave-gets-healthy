'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MEAL_TYPES } from '@/lib/config'
import { MealType } from '@/types'

interface AddFoodModalProps {
  date: string
  onClose: () => void
  onAdded: () => void
  defaultMealType?: MealType
}

const emptyForm = {
  name: '',
  meal_type: 'breakfast' as MealType,
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
}

export default function AddFoodModal({ date, onClose, onAdded, defaultMealType }: AddFoodModalProps) {
  const [form, setForm] = useState({ ...emptyForm, meal_type: defaultMealType || 'breakfast' })
  const [description, setDescription] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [calculated, setCalculated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCalculate() {
    if (!description.trim()) return setError('Describe what you ate first')
    setCalculating(true)
    setError('')

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: description }),
      })
      const data = await res.json()
      if (data.error) return setError(data.error)

      setForm((f) => ({
        ...f,
        name: data.name || description.slice(0, 60),
        calories: String(data.calories || ''),
        protein: String(data.protein || ''),
        carbs: String(data.carbs || ''),
        fat: String(data.fat || ''),
      }))
      setCalculated(true)
    } catch {
      setError('Something went wrong. Try again or enter macros manually.')
    } finally {
      setCalculating(false)
    }
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Food name is required')
    if (!form.calories) return setError('Calories are required')

    setSaving(true)
    setError('')

    const { error: dbError } = await supabase.from('food_entries').insert({
      date,
      meal_type: form.meal_type,
      name: form.name.trim(),
      calories: parseInt(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    })

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
    } else {
      onAdded()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add Food</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Natural language input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you eat?
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setCalculated(false) }}
              placeholder="e.g. 2 scrambled eggs in 2 tsp avocado oil with 1/2 cup FAGE Greek yogurt"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating || !description.trim()}
              className="mt-2 w-full bg-gray-800 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-900 disabled:opacity-40 transition-colors text-sm flex items-center justify-center gap-2"
            >
              {calculating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                '✦ Calculate Macros'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{calculated ? 'review & edit' : 'or enter manually'}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal</label>
              <select
                value={form.meal_type}
                onChange={(e) => setForm({ ...form, meal_type: e.target.value as MealType })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Shredded chicken wrap"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  inputMode="decimal"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add to Log'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
