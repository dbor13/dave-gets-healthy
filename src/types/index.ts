export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'dessert'

export interface FoodEntry {
  id: string
  date: string
  meal_type: MealType
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at: string
}

export interface WorkoutEntry {
  id: string
  date: string
  type: string
  duration_minutes: number
  calories_burned: number | null
  notes: string | null
  created_at: string
}

export interface WeighIn {
  id: string
  date: string
  weight_lbs: number
  created_at: string
}

export interface DailyTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DayScore {
  score: number
  grade: string
  gradeColor: string
  calorieScore: number
  proteinScore: number
  activityScore: number
}
