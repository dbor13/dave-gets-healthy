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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
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
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add Food</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              autoFocus
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
            {saving ? 'Saving...' : 'Add Food'}
          </button>
        </form>
      </div>
    </div>
  )
}
