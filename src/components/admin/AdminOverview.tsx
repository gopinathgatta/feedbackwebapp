import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

interface FeedbackWithMeal {
  feedback_no: string;
  rating: number;
  suggestion: string;
  meal_id: string;
  meal_name: string;
  type: string;
  meal_date: string;
}

export const AdminOverview: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch feedback data from the database
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('/api/feedback/with-meals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        
        const data = await response.json();
        setFeedbacks(data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const totalFeedbacks = feedbacks.length;
  const todaysFeedbacks = feedbacks.filter(f => 
    new Date(f.meal_date).toDateString() === new Date().toDateString()
  ).length;

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0';

  const lowRatedFeedbacks = feedbacks.filter(f => f.rating <= 2).length;

  const stats = [
    { label: 'Total Feedback Received', value: totalFeedbacks.toString(), icon: MessageSquare, color: 'blue' },
    { label: "Today's Feedback", value: todaysFeedbacks.toString(), icon: Users, color: 'green' },
    { label: 'Average Rating', value: averageRating, icon: TrendingUp, color: 'yellow' },
    { label: 'Issues to Address', value: lowRatedFeedbacks.toString(), icon: AlertTriangle, color: 'red' },
  ];

  const recentFeedbacks = feedbacks.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Mess Management Dashboard</h2>
        <p className="text-indigo-100">Monitor feedback, track satisfaction, and improve dining experiences</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'yellow' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
        <div className="divide-y divide-gray-200">
          {recentFeedbacks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No feedback received yet
            </div>
          ) : (
            recentFeedbacks.map((feedback, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feedback.meal_name}</p>
                    <p className="text-sm text-gray-500">
                      {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.meal_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
};
