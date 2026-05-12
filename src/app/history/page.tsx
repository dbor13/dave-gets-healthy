'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FoodEntry, WorkoutEntry } from '@/types'
import { calculateDayScore } from '@/lib/scoring'
import { TARGETS } from '@/lib/config'

interface DaySummary {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  hasWorkout: boolean
  workoutType?: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function HistoryPage() {
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<FoodEntry[]>([])

  useEffect(() => {
    async function load() {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

      const [foodRes, workoutRes] = await Promise.all([
        supabase.from('food_entries').select('*').gte('date', fromDate).order('date', { ascending: false }),
        supabase.from('workout_entries').select('*').gte('date', fromDate),
      ])

      const food = foodRes.data || []
      const workouts = workoutRes.data || []

      const byDate: Record<string, FoodEntry[]> = {}
      for (const entry of food) {
        if (!byDate[entry.date]) byDate[entry.date] = []
        byDate[entry.date].push(entry)
      }

      const workoutByDate: Record<string, WorkoutEntry> = {}
      for (const w of workouts) {
        workoutByDate[w.date] = w
      }

      const summaries: DaySummary[] = Object.keys(byDate)
        .sort((a, b) => b.localeCompare(a))
        .map((date) => {
          const entries = byDate[date]
          return {
            date,
            calories: entries.reduce((s, e) => s + e.calories, 0),
            protein: Math.round(entries.reduce((s, e) => s + e.protein, 0) * 10) / 10,
            carbs: Math.round(entries.reduce((s, e) => s + e.carbs, 0) * 10) / 10,
            fat: Math.round(entries.reduce((s, e) => s + e.fat, 0) * 10) / 10,
            hasWorkout: !!workoutByDate[date],
            workoutType: workoutByDate[date]?.type,
          }
        })

      setDays(summaries)
      setLoading(false)
    }
    load()
  }, [])

  async function toggleExpand(date: string) {
    if (expandedDate === date) {
      setExpandedDate(null)
      return
    }
    const { data } = await supabase
      .from('food_entries')
      .select('*')
      .eq('date', date)
      .order('created_at')
    setExpandedEntries(data || [])
    setExpandedDate(date)
  }

  const gradeColors: Record<string, string> = {
    A: 'text-green-600 bg-green-50',
    B: 'text-blue-600 bg-blue-50',
    C: 'text-yellow-600 bg-yellow-50',
    D: 'text-orange-600 bg-orange-50',
    F: 'text-red-600 bg-red-50',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-800">History</h1>
        <p className="text-sm text-gray-400 mt-0.5">Last 30 days</p>
      </div>

      {days.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">No history yet. Start logging on the Today tab.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((day) => {
            const score = calculateDayScore(day.calories, day.protein, day.hasWorkout)
            const isExpanded = expandedDate === day.date
            const calPct = Math.round((day.calories / TARGETS.calories) * 100)
            const proteinPct = Math.round((day.protein / TARGETS.protein) * 100)

            return (
              <div key={day.date} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full p-4 text-left"
                  onClick={() => toggleExpand(day.date)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{formatDate(day.date)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {day.calories} cal · {day.protein}g P
                        {day.hasWorkout && ` · 💪 ${day.workoutType}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span className={calPct > 100 ? 'text-orange-500' : 'text-gray-400'}>{calPct}% cal</span>
                          <span className={proteinPct >= 90 ? 'text-green-500' : 'text-gray-400'}>{proteinPct}% P</span>
                        </div>
                      </div>
                      <span className={`text-lg font-black px-2 py-1 rounded-lg ${gradeColors[score.grade]}`}>
                        {score.grade}
                      </span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="grid grid-cols-4 gap-2 mt-3 mb-3">
                      {[
                        { label: 'Cal', value: day.calories, target: TARGETS.calories },
                        { label: 'Protein', value: `${day.protein}g`, target: null },
                        { label: 'Carbs', value: `${day.carbs}g`, target: null },
                        { label: 'Fat', value: `${day.fat}g`, target: null },
                      ].map((m) => (
                        <div key={m.label} className="bg-gray-50 rounded-xl p-2 text-center">
                          <p className="text-xs text-gray-400">{m.label}</p>
                          <p className="text-sm font-bold text-gray-700">{m.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {expandedEntries.map((e) => (
                        <div key={e.id} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                          <div>
                            <span className="text-xs font-medium text-gray-600">{e.name}</span>
                            <span className="text-xs text-gray-300 ml-1 capitalize">({e.meal_type})</span>
                          </div>
                          <span className="text-xs text-gray-400">{e.calories} cal · {e.protein}g P</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
