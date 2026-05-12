'use client'

import { useState } from 'react'
import { WeighIn } from '@/types'
import { supabase } from '@/lib/supabase'
import { TARGETS } from '@/lib/config'

interface WeighInSectionProps {
  weighIn: WeighIn | null
  date: string
  isWeighInDay: boolean
  onRefresh: () => void
}

export default function WeighInSection({ weighIn, date, isWeighInDay, onRefresh }: WeighInSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isWeighInDay && !weighIn) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!weight) return
    setSaving(true)
    await supabase.from('weigh_ins').insert({
      date,
      weight_lbs: parseFloat(weight),
    })
    setSaving(false)
    setShowForm(false)
    onRefresh()
  }

  async function handleDelete() {
    if (!weighIn) return
    await supabase.from('weigh_ins').delete().eq('id', weighIn.id)
    onRefresh()
  }

  const toGoal = weighIn ? (weighIn.weight_lbs - TARGETS.goalWeight).toFixed(1) : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Weigh In</h2>
        {weighIn && (
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600">
            Remove
          </button>
        )}
      </div>

      {weighIn ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚖️</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{weighIn.weight_lbs} <span className="text-sm font-normal text-gray-500">lbs</span></p>
            {toGoal && (
              <p className="text-xs text-gray-500">
                {parseFloat(toGoal) > 0
                  ? `${toGoal} lbs to goal (${TARGETS.goalWeight} lbs)`
                  : 'Goal reached!'}
              </p>
            )}
          </div>
        </div>
      ) : showForm ? (
        <form onSubmit={handleSave} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="185.0"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            inputMode="decimal"
            autoFocus
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="border border-gray-200 text-gray-600 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-blue-200 rounded-xl py-4 text-sm text-blue-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          ⚖️ Log today&apos;s weight
        </button>
      )}
    </div>
  )
}
