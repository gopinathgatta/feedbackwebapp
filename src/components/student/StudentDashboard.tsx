import React, { useState } from 'react';
import { User, Student } from '../../types/user';
import { StudentHeader } from './StudentHeader';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackHistory } from './FeedbackHistory';
import { DashboardStats } from './DashboardStats';

interface StudentDashboardProps {
  user: User;
  studentData: Student;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, studentData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feedback' | 'history'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader user={user} studentData={studentData} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'feedback', label: 'Give Feedback' },
              { id: 'history', label: 'My Feedback' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardStats user={user} />}
        {activeTab === 'feedback' && <FeedbackForm user={user} studentData={studentData} />}
        {activeTab === 'history' && <FeedbackHistory user={user} studentData={studentData} />}
      </div>
    </div>
  );
};