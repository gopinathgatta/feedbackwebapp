import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Calendar, Coffee, Sun, Moon } from 'lucide-react';
import { Meal } from '../../types/user';
import { mealsAPI } from '../../services/api';

export const MealManagement: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    meal_name: '',
    type: 'breakfast',
    meal_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Fetch meals from database
    const fetchMeals = async () => {
      try {
        const response = await mealsAPI.getAll();
        setMeals(response);
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMeal) {
        // Update existing meal in database
        const updatedMeal = {
          meal_name: formData.meal_name,
          type: formData.type,
          meal_date: formData.meal_date
        };
        
        console.log('Updating meal with ID:', editingMeal.meal_id);
        console.log('Update data:', updatedMeal);
        
        const updatedMealResponse = await mealsAPI.update(editingMeal.meal_id, updatedMeal);
        console.log('Update response:', updatedMealResponse);
        
        // Update local state with the response from server
        const updatedMeals = meals.map(meal => 
          meal.meal_id === editingMeal.meal_id 
            ? { ...updatedMealResponse, meal_id: editingMeal.meal_id }
            : meal
        );
        setMeals(updatedMeals);
        setEditingMeal(null);
      } else {
        // Add new meal to database
        const newMeal = {
          meal_name: formData.meal_name,
          type: formData.type,
          meal_date: formData.meal_date
        };
        
        console.log('Creating new meal:', newMeal);
        
        // The API will assign a meal_id
        const createdMeal = await mealsAPI.create(newMeal);
        console.log('Created meal response:', createdMeal);
        
        // Update local state with the returned meal (including server-generated ID)
        setMeals([createdMeal, ...meals]);
      }

      setShowAddForm(false);
      setFormData({
        meal_name: '',
        type: 'breakfast',
        meal_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      meal_name: meal.meal_name,
      type: meal.type || 'breakfast',
      meal_date: meal.meal_date
    });
    setShowAddForm(true);
  };

  const handleDelete = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      // Delete meal from database
      await mealsAPI.delete(mealId);
      
      // Update local state
      setMeals(meals.filter(meal => meal.meal_id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Error deleting meal. Please try again.');
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      default: return Coffee;
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-orange-100 text-orange-800';
      case 'lunch': return 'bg-yellow-100 text-yellow-800';
      case 'dinner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && meals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Management</h2>
          <p className="text-gray-600">Add, edit, and manage daily meals</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMeal(null);
            setFormData({
              meal_name: '',
              type: 'breakfast',
              meal_date: new Date().toISOString().split('T')[0]
            });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Meal
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMeal ? 'Edit Meal' : 'Add New Meal'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
              <input
                type="text"
                required
                value={formData.meal_name}
                onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Rice with Dal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.meal_date}
                onChange={(e) => setFormData({ ...formData, meal_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-3 flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingMeal ? 'Update Meal' : 'Add Meal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMeal(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Meals ({meals.length})</h3>
        </div>

        {meals.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No meals added yet. Start by adding your first meal!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {meals.map((meal) => {
              const MealIcon = getMealIcon(meal.type || 'breakfast');
              return (
                <div key={meal.meal_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MealIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{meal.meal_name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(meal.type || 'breakfast')}`}>
                          {meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(meal.meal_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(meal)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meal.meal_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};