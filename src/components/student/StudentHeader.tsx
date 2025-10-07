import React from 'react';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';
import { User, Student } from '../../types/user';

interface StudentHeaderProps {
  user: User;
  studentData: Student;
  onLogout: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ user, studentData, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hostel Mess Feedback</h1>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div className="text-right">
                <p className="font-medium text-gray-900">{studentData.student_name}</p>
                <p className="text-gray-500">
                  {studentData.student_roll} • {studentData.department || 'No Department'}
                </p>
                {studentData.room_no && (
                  <p className="text-gray-500">Room: {studentData.room_no}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};