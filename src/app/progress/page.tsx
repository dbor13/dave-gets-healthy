'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { WeighIn } from '@/types'
import { TARGETS } from '@/lib/config'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

function formatChartDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ProgressPage() {
  const [weighIns, setWeighIns] = useState<WeighIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('weigh_ins')
        .select('*')
        .order('date', { ascending: true })
      setWeighIns(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const chartData = weighIns.map((w) => ({
    date: formatChartDate(w.date),
    weight: w.weight_lbs,
  }))

  const latest = weighIns[weighIns.length - 1]
  const first = weighIns[0]
  const totalLost = first && latest ? (first.weight_lbs - latest.weight_lbs).toFixed(1) : null
  const toGoal = latest ? (latest.weight_lbs - TARGETS.goalWeight).toFixed(1) : null

  const yMin = weighIns.length > 0
    ? Math.floor(Math.min(...weighIns.map((w) => w.weight_lbs), TARGETS.goalWeight) - 2)
    : 160
  const yMax = weighIns.length > 0
    ? Math.ceil(Math.max(...weighIns.map((w) => w.weight_lbs), TARGETS.startWeight) + 2)
    : 190

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
        <h1 className="text-2xl font-black text-gray-800">Progress</h1>
        <p className="text-sm text-gray-400 mt-0.5">Weight trend (log Mon & Thu)</p>
      </div>

      {weighIns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">⚖️</p>
          <p className="text-gray-600 font-medium">No weigh-ins yet</p>
          <p className="text-sm text-gray-400 mt-1">Log your weight on Monday and Thursday mornings.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Current</p>
              <p className="text-xl font-black text-gray-800">{latest?.weight_lbs}</p>
              <p className="text-xs text-gray-400">lbs</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Lost</p>
              <p className={`text-xl font-black ${totalLost && parseFloat(totalLost) > 0 ? 'text-green-600' : 'text-gray-800'}`}>
                {totalLost ? `${totalLost}` : '–'}
              </p>
              <p className="text-xs text-gray-400">lbs</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">To Goal</p>
              <p className="text-xl font-black text-blue-600">
                {toGoal && parseFloat(toGoal) > 0 ? toGoal : '🎯'}
              </p>
              <p className="text-xs text-gray-400">{toGoal && parseFloat(toGoal) > 0 ? 'lbs' : 'done!'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Weight Trend</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"></span> Weight</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-300 inline-block border-dashed border-t border-blue-300"></span> Goal</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`${value} lbs`, 'Weight']}
                />
                <ReferenceLine
                  y={TARGETS.goalWeight}
                  stroke="#93c5fd"
                  strokeDasharray="4 4"
                  label={{ value: `Goal: ${TARGETS.goalWeight}`, fontSize: 10, fill: '#93c5fd', position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ fill: '#16a34a', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Weigh-In Log</h2>
            <div className="space-y-2">
              {[...weighIns].reverse().map((w) => (
                <div key={w.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{formatChartDate(w.date)}</span>
                  <span className="text-sm font-semibold text-gray-800">{w.weight_lbs} lbs</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
