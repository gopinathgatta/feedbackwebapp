import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { feedbackAPI } from '../../services/api';

interface FeedbackWithMeal {
  feedback_id: string;
  rating: number;
  comments: string;
  meal_id: string;
  meal_name: string;
  meal_type: string;
  meal_date: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackAPI.getAll();
        if (Array.isArray(response)) {
          setFeedbacks(response);
        } else {
          setFeedbacks([]);
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback data");
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const mealTypeAnalytics = ['breakfast', 'lunch', 'dinner'].map(mealType => {
    const mealFeedbacks = feedbacks.filter(f => f.meal_type === mealType);
    const avgRating = mealFeedbacks.length > 0 
      ? (mealFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mealFeedbacks.length)
      : 0;
    
    return {
      mealType,
      count: mealFeedbacks.length,
      avgRating: avgRating.toFixed(1),
    };
  });

  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length
  }));

  const overallStats = {
    totalFeedbacks: feedbacks.length,
    avgOverallRating: feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0',
    uniqueMeals: new Set(feedbacks.map(f => f.meal_id)).size,
    thisWeekFeedbacks: feedbacks.filter(f => {
      const feedbackDate = new Date(f.meal_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return feedbackDate >= weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }
  
  if (feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No feedback data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalFeedbacks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.avgOverallRating}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Meals</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.uniqueMeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.thisWeekFeedbacks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Type Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Meal Type Performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mealTypeAnalytics.map((meal) => (
              <div key={meal.mealType} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 capitalize">{meal.mealType}</h4>
                  <span className="text-sm text-gray-500">{meal.count} feedbacks</span>
                </div>
                <div className="text-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Average Rating</p>
                    <p className="text-lg font-semibold text-gray-900">{meal.avgRating}/5</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {ratingDistribution.reverse().map((item) => (
                <div key={item.rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <span className="ml-1 text-yellow-400">★</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ 
                          width: `${feedbacks.length > 0 ? (item.count / feedbacks.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};