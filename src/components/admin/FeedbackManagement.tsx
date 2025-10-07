import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Eye, MessageSquare, Calendar, Coffee } from 'lucide-react';
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

export const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithMeal[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackWithMeal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackAPI.getAll();
        if (Array.isArray(response)) {
          setFeedbacks(response);
          setFilteredFeedbacks(response);
        } else {
          setFeedbacks([]);
          setFilteredFeedbacks([]);
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback data");
        setFeedbacks([]);
        setFilteredFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    let filtered = [...feedbacks];

    if (searchTerm) {
      filtered = filtered.filter(
        (f) => 
          f.meal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.comments?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (mealTypeFilter !== 'all') {
      filtered = filtered.filter((f) => f.meal_type === mealTypeFilter);
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter((f) => f.rating === parseInt(ratingFilter));
    }

    if (dateFilter) {
      filtered = filtered.filter((f) => {
        // Convert both dates to YYYY-MM-DD format for comparison
        const feedbackDate = new Date(f.meal_date);
        const feedbackDateStr = `${feedbackDate.getFullYear()}-${String(feedbackDate.getMonth() + 1).padStart(2, '0')}-${String(feedbackDate.getDate()).padStart(2, '0')}`;
        return feedbackDateStr === dateFilter;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          // Create date objects and compare directly without timezone issues
          const dateA = new Date(a.meal_date);
          const dateB = new Date(b.meal_date);
          // Compare year, then month, then day
          if (dateA.getFullYear() !== dateB.getFullYear()) return dateA.getFullYear() - dateB.getFullYear();
          if (dateA.getMonth() !== dateB.getMonth()) return dateA.getMonth() - dateB.getMonth();
          return dateA.getDate() - dateB.getDate();
        case 'date-desc':
          // Create date objects and compare directly without timezone issues
          const dateBDesc = new Date(b.meal_date);
          const dateADesc = new Date(a.meal_date);
          // Compare year, then month, then day
          if (dateBDesc.getFullYear() !== dateADesc.getFullYear()) return dateBDesc.getFullYear() - dateADesc.getFullYear();
          if (dateBDesc.getMonth() !== dateADesc.getMonth()) return dateBDesc.getMonth() - dateADesc.getMonth();
          return dateBDesc.getDate() - dateADesc.getDate();
        case 'rating-asc':
          return a.rating - b.rating;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchTerm, mealTypeFilter, ratingFilter, dateFilter, sortBy]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search by meal name, type, or suggestions..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {(searchTerm || mealTypeFilter !== 'all' || ratingFilter !== 'all' || dateFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchTerm('');
                setMealTypeFilter('all');
                setRatingFilter('all');
                setDateFilter('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Feedback Management</h3>
          <span className="text-sm text-gray-500">{filteredFeedbacks.length} results</span>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredFeedbacks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No feedback found matching your filters</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.feedback_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="font-medium text-gray-900">{feedback.meal_name}</h4>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {feedback.meal_type.charAt(0).toUpperCase() + feedback.meal_type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{new Date(feedback.meal_date).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className={`font-medium ${getRatingColor(feedback.rating)}`}>
                          {feedback.rating}/5
                        </span>
                      </div>
                    </div>

                    {feedback.comments && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{feedback.comments}</p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="ml-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Meal Name</label>
                  <p className="text-gray-900">{selectedFeedback.meal_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900">{new Date(selectedFeedback.meal_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Meal Type</label>
                <p className="text-gray-900 capitalize">{selectedFeedback.meal_type}</p>
              </div>

              <div className="text-center">
                <label className="text-sm font-medium text-gray-600">Rating</label>
                <div className="text-center">
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < selectedFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedFeedback.rating}/5</p>
                </div>
              </div>

              {selectedFeedback.comments && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Comments</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{selectedFeedback.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};