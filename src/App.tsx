import React, { useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { User, UserRole, Student, Admin } from './types/user';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Student | Admin | null>(null);

  const handleLogin = (userData: User, roleData: Student | Admin) => {
    setUser(userData);
    setUserData(roleData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setUserData(null);
  };

  if (!user || !userData) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === UserRole.STUDENT ? (
        <StudentDashboard user={user} studentData={userData as Student} onLogout={handleLogout} />
      ) : (
        <AdminDashboard user={user} adminData={userData as Admin} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;