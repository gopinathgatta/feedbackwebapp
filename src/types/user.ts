export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface Student {
  user_id: string;
  student_name: string;
  department: string | null;
  room_no: string | null;
  phone_number: string | null;
  email_id: string | null;
  student_roll: string;
}

export interface Admin {
  user_id: string;
  admin_name: string;
  department: string;
  level: string;
}

export interface Meal {
  meal_id: string;
  meal_name: string;
  type: string | null;
  meal_date: string;
}

export interface Feedback {
  feedback_no: string;
  student_id: string | null;
  meal_id: string | null;
  rating: number | null;
  suggestion: string | null;
}