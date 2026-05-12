export const TARGETS = {
  calories: 1650,
  protein: 175,
  carbs: 120,
  fat: 55,
  goalWeight: 170,
  startWeight: 184.2,
}

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'dessert', label: 'Dessert' },
] as const

export const WORKOUT_TYPES = [
  'Bodyweight',
  'Weights / Dumbbells',
  'Kettlebell',
  'Bike Ride',
  'Brisk Walk',
  'Peloton',
  'Mixed',
  'Other',
]

// Weigh-in days: Monday (1) and Thursday (4)
export const WEIGH_IN_DAYS = [1, 4]
