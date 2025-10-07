import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Award, TrendingUp } from 'lucide-react';
import { User } from '../../types/user';
import { feedbackAPI } from '../../services/api';

interface DashboardStatsProps {
  user: User;
}

interface FeedbackWithMeal {
  feedback_id: string;
  rating: number;
  comments: string;
  meal_id: string;
  meal_name: string;
  meal_type: string;
  meal_date: string;
  status?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ user }) => {
  const [stats, setStats] = useState([
    { label: 'Total Feedback Submitted', value: '0', icon: MessageSquare, color: 'blue' },
    { label: 'This Week', value: '0', icon: Clock, color: 'green' },
    { label: 'Average Rating Given', value: '0', icon: Award, color: 'yellow' },
    { label: 'Response Rate', value: '0%', icon: TrendingUp, color: 'purple' },
  ]);
  
  const [recentFeedback, setRecentFeedback] = useState<FeedbackWithMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        // Fetch all feedback for the current user
        const feedbackData = await feedbackAPI.getAll({ student_id: user.user_id });
        
        if (Array.isArray(feedbackData)) {
          // Calculate stats
          const totalFeedbacks = feedbackData.length;
          
          // Calculate this week's feedback
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const thisWeekFeedbacks = feedbackData.filter(feedback => 
            new Date(feedback.meal_date) >= oneWeekAgo
          ).length;
          
          // Calculate average rating
          const avgRating = totalFeedbacks > 0 
            ? (feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) / totalFeedbacks).toFixed(1)
            : '0';
          
          // Calculate response rate (assuming all submitted feedback counts as a response)
          const responseRate = totalFeedbacks > 0 ? '100%' : '0%';
          
          setStats([
            { label: 'Total Feedback Submitted', value: totalFeedbacks.toString(), icon: MessageSquare, color: 'blue' },
            { label: 'This Week', value: thisWeekFeedbacks.toString(), icon: Clock, color: 'green' },
            { label: 'Average Rating Given', value: avgRating, icon: Award, color: 'yellow' },
            { label: 'Response Rate', value: responseRate, icon: TrendingUp, color: 'purple' },
          ]);
          
          // Get recent feedback (latest 3)
          const recent = feedbackData
            .sort((a, b) => new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime())
            .slice(0, 3)
            .map(feedback => ({
              ...feedback,
              status: getRandomStatus() // In a real app, this would come from the backend
            }));
            
          setRecentFeedback(recent);
        }
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [user.user_id]);
  
  // Helper function to generate random status (would be replaced with real data in production)
  const getRandomStatus = () => {
    const statuses = ['Acknowledged', 'Under Review', 'Resolved'];
    return statuses[Math.floor(Math.random() * statuses.length)];
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name || 'Student'}!</h2>
        <p className="text-blue-100">Ready to share your dining experience today?</p>
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
                'bg-purple-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
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

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        </div>
        {recentFeedback.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentFeedback.map((feedback, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feedback.meal_name}</p>
                    <p className="text-sm text-gray-500">{new Date(feedback.meal_date).toLocaleDateString()}</p>
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    feedback.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    feedback.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No feedback submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};