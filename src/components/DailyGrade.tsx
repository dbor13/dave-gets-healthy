'use client'

import { useState } from 'react'
import { DayScore } from '@/types'

interface DailyGradeProps {
  score: DayScore
  calories: number
  protein: number
}

export default function DailyGrade({ score, calories, protein }: DailyGradeProps) {
  const [expanded, setExpanded] = useState(false)

  const gradeBg: Record<string, string> = {
    A: 'bg-green-50 border-green-200',
    B: 'bg-blue-50 border-blue-200',
    C: 'bg-yellow-50 border-yellow-200',
    D: 'bg-orange-50 border-orange-200',
    F: 'bg-red-50 border-red-200',
  }

  const breakdown = [
    { label: 'Caloric Deficit', score: score.calorieScore, weight: '40%' },
    { label: 'Protein Target', score: score.proteinScore, weight: '35%' },
    { label: 'Physical Activity', score: score.activityScore, weight: '25%' },
  ]

  const isIncomplete = calories === 0 && protein === 0

  return (
    <div
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${gradeBg[score.grade] || 'bg-gray-50 border-gray-200'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Grade</p>
          {isIncomplete ? (
            <p className="text-sm text-gray-400 mt-1">Log food to see your grade</p>
          ) : (
            <p className="text-sm text-gray-500 mt-0.5">{score.score}/100 points</p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-6xl font-black ${score.gradeColor}`}>
            {isIncomplete ? '–' : score.grade}
          </span>
        </div>
      </div>

      {expanded && !isIncomplete && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {breakdown.map((b) => (
            <div key={b.label} className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">{b.label}</span>
                <span className="text-xs text-gray-400 ml-1">({b.weight})</span>
              </div>
              <span className={`text-sm font-bold ${b.score >= 80 ? 'text-green-600' : b.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {b.score}/100
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2 text-center">Tap to collapse</p>
        </div>
      )}

      {!expanded && !isIncomplete && (
        <p className="text-xs text-gray-400 mt-2 text-center">Tap for breakdown</p>
      )}
    </div>
  )
}
