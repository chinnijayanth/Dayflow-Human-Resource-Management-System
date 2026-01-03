import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
      fetchAllAttendance();
    } else {
      fetchTodayAttendance();
      fetchWeeklyAttendance();
    }
  }, [isAdmin, selectedUserId]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
      if (response.data.length > 0 && !selectedUserId) {
        setSelectedUserId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchWeeklyAttendance = async () => {
    try {
      const startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const response = await axios.get('/api/attendance/weekly', {
        params: { startDate },
      });
      setWeeklyAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch weekly attendance:', error);
    }
  };

  const fetchAllAttendance = async () => {
    if (!selectedUserId) return;
    try {
      const startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const endDate = format(addDays(parseISO(startDate), 6), 'yyyy-MM-dd');
      const response = await axios.get('/api/attendance/all', {
        params: { userId: selectedUserId, startDate, endDate },
      });
      setAllAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post('/api/attendance/checkin');
      await fetchTodayAttendance();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await axios.post('/api/attendance/checkout');
      await fetchTodayAttendance();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Attendance</h1>

        {isAdmin && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              className="input max-w-xs"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
        )}

        {!isAdmin && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
            {todayAttendance && todayAttendance.check_in ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Check In:</span>
                  <span className="font-medium">{todayAttendance.check_in}</span>
                </div>
                {todayAttendance.check_out ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check Out:</span>
                    <span className="font-medium">{todayAttendance.check_out}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? 'Processing...' : 'Check Out'}
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(todayAttendance.status)}`}>
                    {todayAttendance.status}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">You haven't checked in today</p>
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="btn btn-primary flex items-center"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  {loading ? 'Processing...' : 'Check In'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Weekly View</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const record = (isAdmin ? allAttendance : weeklyAttendance).find(
                    (a) => a.date === dateStr
                  );
                  return (
                    <tr key={dateStr}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(day, 'EEEE, MMM d')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record
                              ? getStatusColor(record.status)
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {record ? record.status : 'absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record?.check_in || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record?.check_out || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;

