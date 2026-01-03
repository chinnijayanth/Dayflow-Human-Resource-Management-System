import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, Clock, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    todayAttendance: null as any,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [leavesRes, attendanceRes] = await Promise.all([
        axios.get('/api/leave/my-leaves'),
        axios.get('/api/attendance/today'),
      ]);

      const pendingLeaves = leavesRes.data.filter((l: any) => l.status === 'pending').length;
      setStats({
        pendingLeaves,
        todayAttendance: attendanceRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const cards = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      link: '/profile',
      color: 'bg-blue-500',
    },
    {
      title: 'Attendance',
      description: 'Check in/out and view records',
      icon: Clock,
      link: '/attendance',
      color: 'bg-green-500',
    },
    {
      title: 'Leave Requests',
      description: 'Apply for time off',
      icon: Calendar,
      link: '/leave',
      color: 'bg-purple-500',
      badge: stats.pendingLeaves > 0 ? stats.pendingLeaves : undefined,
    },
    {
      title: 'Payroll',
      description: 'View salary details',
      icon: DollarSign,
      link: '/payroll',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.first_name || 'Employee'}!
          </h1>
          <p className="mt-2 text-gray-600">Here's your quick access to everything you need.</p>
        </div>

        {stats.todayAttendance && !stats.todayAttendance.check_in && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                Don't forget to check in for today!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                  {card.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {card.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
            {stats.todayAttendance ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{stats.todayAttendance.status}</span>
                </div>
                {stats.todayAttendance.check_in && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check In:</span>
                    <span className="font-medium">{stats.todayAttendance.check_in}</span>
                  </div>
                )}
                {stats.todayAttendance.check_out && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check Out:</span>
                    <span className="font-medium">{stats.todayAttendance.check_out}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No attendance record for today</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/attendance"
                className="block w-full btn btn-primary text-center"
              >
                Check In/Out
              </Link>
              <Link
                to="/leave"
                className="block w-full btn btn-secondary text-center"
              >
                Apply for Leave
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;

