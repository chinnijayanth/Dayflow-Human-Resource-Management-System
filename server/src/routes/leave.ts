import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Apply for leave
router.post(
  '/',
  [
    body('leave_type').isIn(['paid', 'sick', 'unpaid']).withMessage('Invalid leave type'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('end_date').notEmpty().withMessage('End date is required'),
  ],
  (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { leave_type, start_date, end_date, remarks } = req.body;
      const userId = req.userId!;

      // Validate dates
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }

      const result = db
        .prepare(
          'INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, remarks) VALUES (?, ?, ?, ?, ?)'
        )
        .run(userId, leave_type, start_date, end_date, remarks || '');

      // Update attendance records for the leave period
      const start = new Date(start_date);
      const end = new Date(end_date);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existing = db
          .prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?')
          .get(userId, dateStr) as any;

        if (!existing) {
          db.prepare(
            'INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)'
          ).run(userId, dateStr, 'leave');
        } else {
          db.prepare(
            'UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?'
          ).run('leave', userId, dateStr);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.status(201).json({
        message: 'Leave request submitted successfully',
        id: result.lastInsertRowid,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user's leave requests
router.get('/my-leaves', (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const leaves = db
      .prepare(
        'SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC'
      )
      .all(userId);

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leave requests (Admin/HR only)
router.get('/all', requireAdmin, (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        l.*,
        u.employee_id,
        p.first_name,
        p.last_name
      FROM leave_requests l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles p ON u.id = p.user_id
    `;

    const params: any[] = [];
    if (status) {
      query += ' WHERE l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';

    const leaves = db.prepare(query).all(...params);

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject leave
router.put(
  '/:id/approve',
  requireAdmin,
  [body('status').isIn(['approved', 'rejected']).withMessage('Invalid status')],
  (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, admin_comment } = req.body;
      const adminId = req.userId!;

      // Get leave request
      const leave = db
        .prepare('SELECT * FROM leave_requests WHERE id = ?')
        .get(id) as any;

      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      // Update leave request
      db.prepare(
        'UPDATE leave_requests SET status = ?, approved_by = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(status, adminId, admin_comment || '', id);

      // If rejected, update attendance records back
      if (status === 'rejected') {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const currentDate = new Date(start);

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0];
          db.prepare(
            'UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?'
          ).run('absent', leave.user_id, dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      res.json({ message: `Leave request ${status} successfully` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

