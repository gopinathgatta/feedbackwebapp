import React from 'react';
import { Shield, LogOut, Settings } from 'lucide-react';
import { User, Admin } from '../../types/user';

interface AdminHeaderProps {
  user: User;
  adminData: Admin;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, adminData, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mess Management System</h1>
              <p className="text-sm text-gray-600">Administrator Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm">
              <Settings className="h-5 w-5 text-gray-400" />
              <div className="text-right">
                <p className="font-medium text-gray-900">{adminData.admin_name}</p>
                <p className="text-gray-500">{adminData.level} • {adminData.department}</p>
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