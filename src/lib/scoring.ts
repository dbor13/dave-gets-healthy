import { DayScore } from '@/types'
import { TARGETS } from './config'

export function calculateDayScore(
  calories: number,
  protein: number,
  hasWorkout: boolean
): DayScore {
  // Calorie score (40%) — primary goal is deficit
  let calorieScore = 0
  if (calories === 0) {
    calorieScore = 0
  } else if (calories >= 1600 && calories <= 1750) {
    calorieScore = 100
  } else if (calories > 1750 && calories <= 1850) {
    calorieScore = 80
  } else if (calories > 1850 && calories <= 2000) {
    calorieScore = 60
  } else if (calories > 2000) {
    calorieScore = 30
  } else if (calories >= 1400 && calories < 1600) {
    calorieScore = 80
  } else {
    calorieScore = 60
  }

  // Protein score (35%)
  let proteinScore = 0
  if (protein === 0) {
    proteinScore = 0
  } else if (protein >= 165) {
    proteinScore = 100
  } else if (protein >= 150) {
    proteinScore = 85
  } else if (protein >= 135) {
    proteinScore = 70
  } else if (protein >= 120) {
    proteinScore = 55
  } else {
    proteinScore = 40
  }

  // Activity score (25%) — rest days get 50%, not 0
  const activityScore = hasWorkout ? 100 : 50

  const score = Math.round(
    calorieScore * 0.4 + proteinScore * 0.35 + activityScore * 0.25
  )

  let grade: string
  let gradeColor: string
  if (score >= 90) {
    grade = 'A'
    gradeColor = 'text-green-600'
  } else if (score >= 80) {
    grade = 'B'
    gradeColor = 'text-blue-600'
  } else if (score >= 70) {
    grade = 'C'
    gradeColor = 'text-yellow-600'
  } else if (score >= 60) {
    grade = 'D'
    gradeColor = 'text-orange-600'
  } else {
    grade = 'F'
    gradeColor = 'text-red-600'
  }

  return { score, grade, gradeColor, calorieScore, proteinScore, activityScore }
}

export function getCalorieStatus(calories: number): string {
  const remaining = TARGETS.calories - calories
  if (remaining > 0) return `${remaining} cal remaining`
  return `${Math.abs(remaining)} cal over target`
}

export function getProteinStatus(protein: number): string {
  const remaining = TARGETS.protein - protein
  if (remaining > 0) return `${remaining}g to go`
  return `${Math.abs(remaining)}g over target`
}
