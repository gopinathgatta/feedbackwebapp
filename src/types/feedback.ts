export interface MealFeedback {
  id: string;
  studentId: string;
  studentName: string;
  hostelBlock: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  overallRating: number;
  tasteRating: number;
  qualityRating: number;
  quantityRating: number;
  serviceRating: number;
  comments: string;
  suggestions: string;
  createdAt: string;
}

export interface MealType {
  id: string;
  name: string;
  icon: string;
}