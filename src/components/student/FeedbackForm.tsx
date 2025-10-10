
import React, { useEffect, useState } from 'react';
import { Send, Star } from 'lucide-react';
import { User, Student, Meal } from '../../types/user';

interface FeedbackFormProps {
  user: User;
  studentData: Student;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ user, studentData }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    meal_id: '',
    rating: 0,
    suggestion: ''
  });
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealsError, setMealsError] = useState<string | null>(null);

  const BACKEND_URL = 'https://feedbackwebapp-bwf6gudtacbsd6h9.centralindia-01.azurewebsites.net/'; // ✅ single base route

  // ✅ Auto-select first meal if available
  useEffect(() => {
    if (meals.length > 0 && !formData.meal_id) {
      setFormData(prev => ({ ...prev, meal_id: String(meals[0].meal_id) }));
    }
  }, [meals]);

  // ✅ Fetch meals for today
  useEffect(() => {
    const fetchMeals = async () => {
      setLoadingMeals(true);
      setMealsError(null);
      try {
        const token = user?.token || localStorage.getItem('authToken');
        console.log('🪪 Using Token:', token); // 👈 Added debug log

        if (!token) throw new Error('Missing token');

        const res = await fetch(`${BACKEND_URL}/present`, {
          headers: {
            'Authorization': `Bearer ${token}`, // 👈 Fixed header
            'Accept': 'application/json'
          },
        });

        const text = await res.text();
        console.log('📦 Raw backend response:', text);

        if (!res.ok) throw new Error(`Backend error ${res.status}: ${text}`);

        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Expected an array of meals');
        setMeals(data);
      } catch (error: any) {
        console.error('❌ Error fetching meals:', error);
        setMealsError(error.message);
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchMeals();
  }, []);

  // ✅ Submit feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = user?.token || localStorage.getItem('authToken');
      console.log('🪪 Token for submission:', token); // 👈 Added debug log

      if (!token) throw new Error('Missing token');

      const payload = {
        meal_id: Number(formData.meal_id),
        rating: Number(formData.rating),
        comments: formData.suggestion || '',
        student_id: studentData.user_id // Adding student_id from studentData
      };

      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 👈 Fixed header
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('📦 Submit response:', text);

      if (!res.ok) throw new Error(`Submit failed ${res.status}: ${text}`);

      const json = JSON.parse(text);
      console.log('✅ Feedback submitted:', json);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ meal_id: '', rating: 0, suggestion: '' });
      }, 3000);
    } catch (error: any) {
      console.error('❌ Error submitting feedback:', error);
      alert('Error submitting feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirmation message
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Feedback Submitted!</h3>
          <p className="text-green-700">Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Submit Meal Feedback</h3>
          <p className="text-sm text-gray-600 mt-1">Share your dining experience to help us improve</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-blue-700">Name:</span> <span className="ml-2 text-blue-900">{studentData.student_name}</span></div>
              <div><span className="text-blue-700">Roll:</span> <span className="ml-2 text-blue-900">{studentData.student_roll}</span></div>
            </div>
          </div>

          {/* Meal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Meal</label>
            {loadingMeals ? (
              <div className="text-center py-8 text-gray-500">Loading meals...</div>
            ) : mealsError ? (
              <div className="text-center py-8 text-red-500">Error: {mealsError}</div>
            ) : meals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No meals available today.</div>
            ) : (
              <div className="space-y-3">
                {meals.map(meal => (
                  <label
                    key={meal.meal_id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.meal_id === String(meal.meal_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meal"
                      value={meal.meal_id}
                      checked={formData.meal_id === String(meal.meal_id)}
                      onChange={e => setFormData({ ...formData, meal_id: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{meal.meal_name}</h4>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {meal.meal_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(meal.meal_date).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rate Your Experience</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className={`p-2 rounded transition-colors ${
                    formData.rating >= rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <textarea
            value={formData.suggestion}
            onChange={e => setFormData({ ...formData, suggestion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Suggestions (optional)..."
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.meal_id || formData.rating === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};
