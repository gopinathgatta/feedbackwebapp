import React, { useState, useEffect } from 'react';
import { Clock, Star, MessageSquare, Calendar, Coffee, Sun, Moon, AlertTriangle } from 'lucide-react';
import { User, Student } from '../../types/user';

interface FeedbackHistoryProps {
  user: User;
  studentData: Student;
}

interface FeedbackWithMeal {
  feedback_id: string;
  rating: number;
  comments: string;
  meal_id: string;
  meal_name: string;
  meal_type: string;
  meal_date: string;
}

// API URL for feedback
const FEEDBACK_API_URL = '/api/feedback';

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ user, studentData }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // ✅ Normalize student_id (some tokens or DB rows use "id" instead of "user_id")
        const effectiveStudentId =
          studentData?.user_id || studentData?.id || user?.user_id || user?.id;

        if (!effectiveStudentId) {
          console.warn('⚠️ No valid student_id found:', studentData);
          setError('Missing student ID. Please log in again.');
          return;
        }

        console.log('📦 Fetching feedback for student_id:', effectiveStudentId);

        // ✅ Fetch feedback from backend
        const response = await fetch(`${FEEDBACK_API_URL}?student_id=${effectiveStudentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Server response:', errorText);
          throw new Error(`Error fetching feedback: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Feedback data received:', data);

        if (Array.isArray(data)) {
          // Sort feedbacks by date (newest first)
          const sortedFeedbacks = [...data].sort((a, b) => {
            return new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime();
          });
          setFeedbacks(sortedFeedbacks);
        } else {
          console.error('Unexpected data format:', data);
          setError('Received invalid data format from server');
        }
      } catch (error: any) {
        console.error('❌ Error fetching feedback history:', error);
        setError(error.message || 'Failed to load feedback history');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackHistory();
  }, [studentData.user_id, user.user_id]); // include both in dependency array

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      default: return Coffee;
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return 'bg-orange-100 text-orange-800';
      case 'lunch': return 'bg-yellow-100 text-yellow-800';
      case 'dinner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Feedback</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback history</h3>
        <p className="text-gray-600">You haven't submitted any feedback yet. Start by giving feedback on your meals!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Feedback History</h3>
        <span className="text-sm text-gray-500">{feedbacks.length} total submissions</span>
      </div>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.feedback_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {React.createElement(getMealIcon(feedback.meal_type), { className: "h-5 w-5 text-gray-600" })}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{feedback.meal_name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(feedback.meal_type)}`}>
                      {feedback.meal_type.charAt(0).toUpperCase() + feedback.meal_type.slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(feedback.meal_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Rating:</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-900">{feedback.rating}/5</span>
                </div>
              </div>
            </div>

            {feedback.comments && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Feedback:</p>
                <p className="text-sm text-gray-600">{feedback.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
