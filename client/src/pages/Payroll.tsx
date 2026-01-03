import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { DollarSign, Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Payroll = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [payroll, setPayroll] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_salary: '',
    allowances: '',
    deductions: '',
    status: 'pending',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
      fetchAllPayroll();
    } else {
      fetchMyPayroll();
    }
  }, [isAdmin, selectedEmployee, selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchMyPayroll = async () => {
    try {
      const response = await axios.get('/api/payroll/my-payroll');
      setPayroll(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    }
  };

  const fetchAllPayroll = async () => {
    try {
      const params: any = { year: selectedYear };
      if (selectedMonth) params.month = selectedMonth;
      if (selectedEmployee) params.userId = selectedEmployee;
      const response = await axios.get('/api/payroll/all', { params });
      setPayroll(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/payroll', {
        ...formData,
        user_id: Number(formData.user_id),
        month: Number(formData.month),
        year: Number(formData.year),
        base_salary: Number(formData.base_salary),
        allowances: Number(formData.allowances) || 0,
        deductions: Number(formData.deductions) || 0,
        status: formData.status,
      });
      setShowForm(false);
      setFormData({
        user_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        base_salary: '',
        allowances: '',
        deductions: '',
        status: 'pending',
      });
      fetchAllPayroll();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save payroll');
    }
  };

  const handleApprovePayroll = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const confirmMessage = newStatus === 'paid' 
      ? 'Are you sure you want to mark this payroll as paid? This will be visible to the employee.'
      : 'Are you sure you want to mark this payroll as pending?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await axios.put(`/api/payroll/${id}/status`, { status: newStatus });
      setMessage(`Payroll status updated to ${newStatus} successfully!`);
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh payroll list to show updated status
      if (isAdmin) {
        await fetchAllPayroll();
      } else {
        await fetchMyPayroll();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update payroll status');
    }
  };

  const downloadSalarySlip = async (userId: number, month: number, year: number) => {
    try {
      const response = await axios.get(`/api/reports/salary-slip/${userId}`, {
        params: { month, year },
      });
      const data = response.data;
      
      // Create a simple text-based salary slip
      const slip = `
SALARY SLIP
===========
Employee: ${data.employee.first_name} ${data.employee.last_name}
Employee ID: ${data.employee.employee_id}
Department: ${data.employee.department || 'N/A'}
Month: ${month}/${year}

Base Salary: $${data.base_salary.toFixed(2)}
Allowances: $${data.allowances.toFixed(2)}
Deductions: $${data.deductions.toFixed(2)}
------------------------
Net Salary: $${data.net_salary.toFixed(2)}
Status: ${data.status}
      `;
      
      const blob = new Blob([slip], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-slip-${data.employee.employee_id}-${month}-${year}.txt`;
      a.click();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to download salary slip');
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            {message}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary flex items-center"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Add Payroll Record
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  className="input"
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(Number(e.target.value) || null)}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  className="input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {format(new Date(2000, m - 1), 'MMMM')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  className="input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {showForm && isAdmin && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Payroll Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee
                  </label>
                  <select
                    className="input"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    className="input"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {format(new Date(2000, m - 1), 'MMMM')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowances
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {isAdmin ? 'All Payroll Records' : 'My Payroll'}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payroll.map((record) => (
                  <tr key={record.id}>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.first_name} {record.last_name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(record.year, record.month - 1), 'MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.base_salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.allowances.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.deductions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${record.net_salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <button
                            onClick={() => handleApprovePayroll(record.id, record.status)}
                            className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === 'paid'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={record.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                          >
                            {record.status === 'paid' ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Mark Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => downloadSalarySlip(record.user_id, record.month, record.year)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payroll.length === 0 && (
              <div className="text-center py-8 text-gray-500">No payroll records found</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payroll;

