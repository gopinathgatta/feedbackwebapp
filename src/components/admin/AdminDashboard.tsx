import React, { useState } from 'react';
import { User, Admin } from '../../types/user';
import { AdminHeader } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { FeedbackManagement } from './FeedbackManagement';
import { MealManagement } from './MealManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminDashboardProps {
  user: User;
  adminData: Admin;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, adminData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'feedback' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} adminData={adminData} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'meals', label: 'Manage Meals' },
              { id: 'feedback', label: 'View Feedback' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'meals' && <MealManagement />}
        {activeTab === 'feedback' && <FeedbackManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  );
};