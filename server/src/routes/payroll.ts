import express from 'express';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get user's payroll
router.get('/my-payroll', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { year, month } = req.query;

    let query = 'SELECT * FROM payroll WHERE user_id = ?';
    const params: any[] = [userId];

    if (year && month) {
      query += ' AND year = ? AND month = ?';
      params.push(year, month);
    }

    query += ' ORDER BY year DESC, month DESC';

    const payroll = db.prepare(query).all(...params);

    res.json(payroll);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payroll (Admin/HR only)
router.get('/all', requireAdmin, (req, res) => {
  try {
    const { userId, year, month } = req.query;

    let query = `
      SELECT 
        p.*,
        u.employee_id,
        prof.first_name,
        prof.last_name
      FROM payroll p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN employee_profiles prof ON u.id = prof.user_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push('p.user_id = ?');
      params.push(userId);
    }

    if (year) {
      conditions.push('p.year = ?');
      params.push(year);
    }

    if (month) {
      conditions.push('p.month = ?');
      params.push(month);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.year DESC, p.month DESC, u.employee_id';

    const payroll = db.prepare(query).all(...params);

    res.json(payroll);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update salary structure (Admin/HR only)
router.put('/salary/:userId', requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const { salary } = req.body;

    db.prepare(
      'UPDATE employee_profiles SET salary = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(salary, userId);

    res.json({ message: 'Salary updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update payroll record (Admin/HR only)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { user_id, month, year, base_salary, allowances, deductions, status } = req.body;

    const net_salary = base_salary + (allowances || 0) - (deductions || 0);

    // Check if record exists
    const existing = db
      .prepare('SELECT * FROM payroll WHERE user_id = ? AND month = ? AND year = ?')
      .get(user_id, month, year) as any;

    if (existing) {
      db.prepare(
        'UPDATE payroll SET base_salary = ?, allowances = ?, deductions = ?, net_salary = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(base_salary, allowances || 0, deductions || 0, net_salary, status || 'pending', existing.id);
    } else {
      db.prepare(
        'INSERT INTO payroll (user_id, month, year, base_salary, allowances, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(user_id, month, year, base_salary, allowances || 0, deductions || 0, net_salary, status || 'pending');
    }

    res.json({ message: 'Payroll record saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update payroll status (Approve/Mark as Paid) - Admin/HR only
router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "pending" or "paid"' });
    }

    const payroll = db.prepare('SELECT * FROM payroll WHERE id = ?').get(id) as any;

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    db.prepare(
      'UPDATE payroll SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, id);

    res.json({ 
      message: `Payroll status updated to ${status} successfully`,
      payroll: { ...payroll, status }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update payroll record (Admin/HR only)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { base_salary, allowances, deductions, status } = req.body;

    const payroll = db.prepare('SELECT * FROM payroll WHERE id = ?').get(id) as any;

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const net_salary = (base_salary || payroll.base_salary) + (allowances || payroll.allowances || 0) - (deductions || payroll.deductions || 0);

    db.prepare(
      'UPDATE payroll SET base_salary = ?, allowances = ?, deductions = ?, net_salary = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      base_salary || payroll.base_salary,
      allowances !== undefined ? allowances : payroll.allowances,
      deductions !== undefined ? deductions : payroll.deductions,
      net_salary,
      status || payroll.status,
      id
    );

    res.json({ message: 'Payroll record updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

