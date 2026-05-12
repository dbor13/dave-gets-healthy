'use client'

import { useState } from 'react'
import { FoodEntry, MealType } from '@/types'
import { MEAL_TYPES } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import AddFoodModal from './AddFoodModal'

interface FoodLogProps {
  entries: FoodEntry[]
  date: string
  onRefresh: () => void
}

export default function FoodLog({ entries, date, onRefresh }: FoodLogProps) {
  const [showModal, setShowModal] = useState(false)
  const [defaultMeal, setDefaultMeal] = useState<MealType>('breakfast')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('food_entries').delete().eq('id', id)
    setDeletingId(null)
    onRefresh()
  }

  function openModal(mealType: MealType) {
    setDefaultMeal(mealType)
    setShowModal(true)
  }

  const grouped = MEAL_TYPES.reduce((acc, m) => {
    acc[m.value] = entries.filter((e) => e.meal_type === m.value)
    return acc
  }, {} as Record<string, FoodEntry[]>)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Food Log</h2>
        <button
          onClick={() => openModal('breakfast')}
          className="text-sm font-semibold text-green-600 hover:text-green-700"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {MEAL_TYPES.map((m) => {
          const mealEntries = grouped[m.value]
          const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0)
          const mealProtein = mealEntries.reduce((s, e) => s + e.protein, 0)

          return (
            <div key={m.value}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                {mealEntries.length > 0 && (
                  <span className="text-xs text-gray-400">{mealCals} cal · {mealProtein.toFixed(0)}g P</span>
                )}
              </div>

              {mealEntries.length === 0 ? (
                <button
                  onClick={() => openModal(m.value as MealType)}
                  className="w-full text-left text-sm text-gray-300 hover:text-green-500 py-1.5 transition-colors"
                >
                  + Add {m.label.toLowerCase()}
                </button>
              ) : (
                <div className="space-y-1.5">
                  {mealEntries.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-400">
                          {entry.calories} cal
                          {entry.protein > 0 && ` · ${entry.protein}g P`}
                          {entry.carbs > 0 && ` · ${entry.carbs}g C`}
                          {entry.fat > 0 && ` · ${entry.fat}g F`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="ml-2 text-gray-200 hover:text-red-400 text-lg leading-none opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => openModal(m.value as MealType)}
                    className="text-xs text-green-500 hover:text-green-600 mt-1"
                  >
                    + Add more
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <AddFoodModal
          date={date}
          defaultMealType={defaultMeal}
          onClose={() => setShowModal(false)}
          onAdded={onRefresh}
        />
      )}
    </div>
  )
}
