import express from 'express';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get salary slip
router.get('/salary-slip/:userId', (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Check permissions
    const targetUserId = parseInt(userId);
    if (req.userRole !== 'admin' && req.userRole !== 'hr' && req.userId !== targetUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payroll = db
      .prepare('SELECT * FROM payroll WHERE user_id = ? AND month = ? AND year = ?')
      .get(targetUserId, month, year) as any;

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const user = db
      .prepare(`
        SELECT 
          u.employee_id,
          p.first_name,
          p.last_name,
          p.job_title,
          p.department
        FROM users u
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        WHERE u.id = ?
      `)
      .get(targetUserId) as any;

    res.json({
      ...payroll,
      employee: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance report
router.get('/attendance', requireAdmin, (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    let query = `
      SELECT 
        a.*,
        u.employee_id,
        p.first_name,
        p.last_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN employee_profiles p ON u.id = p.user_id
      WHERE a.date BETWEEN ? AND ?
    `;
    const params: any[] = [startDate, endDate];

    if (userId) {
      query += ' AND a.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY a.date, u.employee_id';

    const attendance = db.prepare(query).all(...params);

    // Calculate summary
    const summary = attendance.reduce((acc: any, record: any) => {
      const key = record.user_id;
      if (!acc[key]) {
        acc[key] = {
          user_id: record.user_id,
          employee_id: record.employee_id,
          name: `${record.first_name} ${record.last_name}`,
          present: 0,
          absent: 0,
          'half-day': 0,
          leave: 0,
        };
      }
      acc[key][record.status] = (acc[key][record.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      records: attendance,
      summary: Object.values(summary),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics dashboard data (Admin/HR only)
router.get('/analytics', requireAdmin, (req, res) => {
  try {
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const pendingLeaves = db
      .prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'")
      .get() as any;
    const todayAttendance = db
      .prepare(
        "SELECT COUNT(*) as count FROM attendance WHERE date = date('now') AND status = 'present'"
      )
      .get() as any;

    // Monthly payroll summary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyPayroll = db
      .prepare(
        'SELECT SUM(net_salary) as total FROM payroll WHERE month = ? AND year = ?'
      )
      .get(currentMonth, currentYear) as any;

    res.json({
      totalEmployees: totalEmployees.count,
      pendingLeaves: pendingLeaves.count,
      todayAttendance: todayAttendance.count,
      monthlyPayroll: monthlyPayroll.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

