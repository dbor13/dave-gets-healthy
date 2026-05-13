'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FoodEntry, WorkoutEntry, WeighIn, DailyTotals } from '@/types'
import { calculateDayScore } from '@/lib/scoring'
import { WEIGH_IN_DAYS } from '@/lib/config'
import MacroProgress from '@/components/MacroProgress'
import FoodLog from '@/components/FoodLog'
import WorkoutSection from '@/components/WorkoutSection'
import WeighInSection from '@/components/WeighInSection'
import DailyGrade from '@/components/DailyGrade'

function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function isWeighInDay() {
  const day = new Date().getDay()
  return WEIGH_IN_DAYS.includes(day)
}

export default function TodayPage() {
  const today = getToday()
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [workout, setWorkout] = useState<WorkoutEntry | null>(null)
  const [weighIn, setWeighIn] = useState<WeighIn | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [foodRes, workoutRes, weighRes] = await Promise.all([
      supabase.from('food_entries').select('*').eq('date', today).order('created_at'),
      supabase.from('workout_entries').select('*').eq('date', today).maybeSingle(),
      supabase.from('weigh_ins').select('*').eq('date', today).maybeSingle(),
    ])
    setFoodEntries(foodRes.data || [])
    setWorkout(workoutRes.data || null)
    setWeighIn(weighRes.data || null)
    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totals: DailyTotals = foodEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: Math.round((acc.protein + e.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const score = calculateDayScore(totals.calories, totals.protein, !!workout)

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
        <h1 className="text-2xl font-black text-gray-800">DaveGetsHealthy</h1>
        <p className="text-sm text-gray-400 mt-0.5">{formatDate(today)}</p>
      </div>

      <DailyGrade score={score} calories={totals.calories} protein={totals.protein} />
      <MacroProgress totals={totals} />
      <FoodLog entries={foodEntries} date={today} onRefresh={fetchData} />
      <WorkoutSection workout={workout} date={today} onRefresh={fetchData} />
      <WeighInSection
        weighIn={weighIn}
        date={today}
        isWeighInDay={isWeighInDay()}
        onRefresh={fetchData}
      />
    </div>
  )
}
