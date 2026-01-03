import express from 'express';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Check in
router.post('/checkin', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Check if already checked in today
    const existing = db
      .prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?')
      .get(userId, today) as any;

    if (existing && existing.check_in) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    if (existing) {
      // Update existing record
      db.prepare(
        'UPDATE attendance SET check_in = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(now, 'present', existing.id);
    } else {
      // Create new record
      db.prepare(
        'INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)'
      ).run(userId, today, now, 'present');
    }

    res.json({ message: 'Checked in successfully', check_in: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check out
router.post('/checkout', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const attendance = db
      .prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?')
      .get(userId, today) as any;

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ error: 'Please check in first' });
    }

    if (attendance.check_out) {
      return res.status(400).json({ error: 'Already checked out today' });
    }

    db.prepare(
      'UPDATE attendance SET check_out = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(now, attendance.id);

    res.json({ message: 'Checked out successfully', check_out: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's attendance
router.get('/today', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const today = new Date().toISOString().split('T')[0];

    const attendance = db
      .prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?')
      .get(userId, today) as any;

    res.json(attendance || { date: today, status: 'absent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly attendance
router.get('/weekly', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { startDate } = req.query;

    const start = startDate
      ? new Date(startDate as string).toISOString().split('T')[0]
      : getWeekStartDate();

    const end = new Date(new Date(start).getTime() + 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const attendance = db
      .prepare(
        'SELECT * FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date'
      )
      .all(userId, start, end) as any[];

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all attendance (Admin/HR only)
router.get('/all', requireAdmin, (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        a.*,
        u.employee_id,
        p.first_name,
        p.last_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN employee_profiles p ON u.id = p.user_id
    `;
    const params: any[] = [];

    if (userId) {
      query += ' WHERE a.user_id = ?';
      params.push(userId);
    }

    if (startDate && endDate) {
      query += userId ? ' AND' : ' WHERE';
      query += ' a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY a.date DESC, a.user_id';

    const attendance = db.prepare(query).all(...params);

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance (Admin/HR only)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, check_in, check_out, notes } = req.body;

    db.prepare(
      'UPDATE attendance SET status = ?, check_in = ?, check_out = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, check_in, check_out, notes, id);

    res.json({ message: 'Attendance updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getWeekStartDate(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default router;

