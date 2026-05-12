'use client'

import { DailyTotals } from '@/types'
import { TARGETS } from '@/lib/config'

interface MacroProgressProps {
  totals: DailyTotals
}

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const pct = Math.min((value / target) * 100, 100)
  const over = value > target
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${over ? 'bg-orange-400' : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function MacroProgress({ totals }: MacroProgressProps) {
  const macros = [
    {
      label: 'Calories',
      value: totals.calories,
      target: TARGETS.calories,
      unit: '',
      color: 'bg-green-500',
      display: `${totals.calories} / ${TARGETS.calories}`,
    },
    {
      label: 'Protein',
      value: totals.protein,
      target: TARGETS.protein,
      unit: 'g',
      color: 'bg-blue-500',
      display: `${totals.protein}g / ${TARGETS.protein}g`,
    },
    {
      label: 'Carbs',
      value: totals.carbs,
      target: TARGETS.carbs,
      unit: 'g',
      color: 'bg-yellow-500',
      display: `${totals.carbs}g / ${TARGETS.carbs}g`,
    },
    {
      label: 'Fat',
      value: totals.fat,
      target: TARGETS.fat,
      unit: 'g',
      color: 'bg-purple-500',
      display: `${totals.fat}g / ${TARGETS.fat}g`,
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today&apos;s Macros</h2>
      {macros.map((m) => (
        <div key={m.label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{m.label}</span>
            <span className={`text-sm font-semibold ${m.value > m.target ? 'text-orange-500' : 'text-gray-600'}`}>
              {m.display}
            </span>
          </div>
          <ProgressBar value={m.value} target={m.target} color={m.color} />
        </div>
      ))}
    </div>
  )
}
