import express from 'express';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get all employees (Admin/HR only)
router.get('/', requireAdmin, (req, res) => {
  try {
    const employees = db
      .prepare(`
        SELECT 
          u.id,
          u.employee_id,
          u.email,
          u.role,
          p.first_name,
          p.last_name,
          p.phone,
          p.address,
          p.profile_picture,
          p.job_title,
          p.department,
          p.hire_date,
          p.employment_type,
          p.salary
        FROM users u
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        ORDER BY u.created_at DESC
      `)
      .all();

    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single employee
router.get('/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check if user can access this profile
    if (req.userRole !== 'admin' && req.userRole !== 'hr' && req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const employee = db
      .prepare(`
        SELECT 
          u.id,
          u.employee_id,
          u.email,
          u.role,
          p.*
        FROM users u
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        WHERE u.id = ?
      `)
      .get(userId) as any;

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee profile
router.put('/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const isAdmin = req.userRole === 'admin' || req.userRole === 'hr';

    // Check permissions
    if (!isAdmin && req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      first_name,
      last_name,
      phone,
      address,
      profile_picture,
      job_title,
      department,
      hire_date,
      employment_type,
      salary,
    } = req.body;

    // Employees can only edit limited fields
    if (!isAdmin) {
      db.prepare(`
        UPDATE employee_profiles 
        SET phone = ?, address = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(phone, address, profile_picture, userId);
    } else {
      // Admin can edit all fields
      db.prepare(`
        UPDATE employee_profiles 
        SET 
          first_name = ?,
          last_name = ?,
          phone = ?,
          address = ?,
          profile_picture = ?,
          job_title = ?,
          department = ?,
          hire_date = ?,
          employment_type = ?,
          salary = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        first_name,
        last_name,
        phone,
        address,
        profile_picture,
        job_title,
        department,
        hire_date,
        employment_type,
        salary,
        userId
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

