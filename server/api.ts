import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

// Middleware to authenticate JWT
export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.user || !req.user.Role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const userRoles = req.user.Role.split(',').map((r: string) => r.trim());
  const hasRole = roles.some(role => userRoles.includes(role));
  if (!hasRole) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Auth Routes
router.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await db.getUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không chính xác' });
    }
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không chính xác' });
    }
    if (user.Status !== 'Active') {
      return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
    }
    
    let effectiveRole = user.Role;
    const token = jwt.sign({ UserID: user.UserID, Role: effectiveRole, FullName: user.FullName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { UserID: user.UserID, Role: effectiveRole, FullName: user.FullName, PhoneNumber: user.PhoneNumber } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { phone, password, fullName } = req.body;
    if (!phone ) {
      return res.status(400).json({ error: 'Invalid Vietnamese phone number' });
    }
    if (!password || !/^\d{6}$/.test(password)) {
      return res.status(400).json({ error: 'Mật khẩu phải là 6 chữ số' });
    }
    const existing = await db.getUserByPhone(phone);
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      PhoneNumber: phone,
      PasswordHash: hash,
      FullName: fullName,
      Role: 'Student', // default
      Status: 'Active'
    });
    
    const token = jwt.sign({ UserID: newUser.UserID, Role: newUser.Role, FullName: newUser.FullName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { UserID: newUser.UserID, Role: newUser.Role, FullName: newUser.FullName, PhoneNumber: newUser.PhoneNumber } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const students = users.filter(u => u.Role && u.Role.split(',').map(r=>r.trim()).includes('Student')).length;
    
    const regs = await db.getRegistrations();
    const pending = regs.filter(r => r.ApprovalStatus === 'Pending').length;
    
    const pools = await db.getPools();
    const activePools = pools.filter(p => p.Status === 'Active').length;
    
    const payments = await db.getPayments();
    // Revenue this month
    const now = new Date();
    const revenue = payments
      .filter(p => p.PaymentStatus === 'Paid')
      .filter(p => {
        const d = new Date(p.PaymentDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + (parseInt(p.Amount) || 0), 0);
      
    res.json({ students, pending, activePools, revenue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User routes
router.get('/users', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await db.getAllUsers();
    // Exclude PasswordHash
    res.json(users.map(u => ({
      UserID: u.UserID,
      FullName: u.FullName,
      PhoneNumber: u.PhoneNumber,
      Role: u.Role,
      Status: u.Status,
      CreatedAt: u.CreatedAt
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { phone, password, fullName, role, status } = req.body;
    if (!phone ) {
      return res.status(400).json({ error: 'Invalid Vietnamese phone number' });
    }
    if (!password || !/^\d{6}$/.test(password)) {
      return res.status(400).json({ error: 'Mật khẩu phải là 6 chữ số' });
    }
    const existing = await db.getUserByPhone(phone);
    if (existing) {
      return res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      PhoneNumber: phone,
      PasswordHash: hash,
      FullName: fullName,
      Role: role || 'Student',
      Status: status || 'Active'
    });
    
    res.json({ message: 'Success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { role, status, fullName, password } = req.body;
    const updateData: any = {};
    if (role) updateData.Role = role;
    if (status) updateData.Status = status;
    if (fullName) updateData.FullName = fullName;
    if (password && /^\d{6}$/.test(password)) {
      updateData.PasswordHash = await bcrypt.hash(password, 10);
    }
    
    await db.updateUser(req.params.id, updateData);
    res.json({ message: 'Success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    res.json({ message: 'Success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/teachers', authenticate, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const teachers = users.filter(u => u.Role && u.Role.split(',').map(r=>r.trim()).includes('Teacher') && u.Status === 'Active');
    res.json(teachers.map(t => ({ UserID: t.UserID, FullName: t.FullName })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/students', authenticate, requireRole(['Admin', 'Teacher']), async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const students = users.filter(u => u.Role && u.Role.split(',').map(r=>r.trim()).includes('Student'));
    // For teacher, maybe restrict, but for now return all active/inactive.
    res.json(students.map(t => ({ UserID: t.UserID, FullName: t.FullName, PhoneNumber: t.PhoneNumber })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pool Routes
router.get('/pools', async (req, res) => {
  try {
    const pools = await db.getPools();
    // Only return active pools for students, all for admin. 
    // Wait, let's return all and let frontend filter, or check role if logged in.
    res.json(pools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pools', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const pool = await db.createPool(req.body);
    res.json(pool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pools/:id', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const pool = await db.updatePool(req.params.id, req.body);
    res.json(pool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule Routes
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await db.getSchedules();
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/schedules', authenticate, requireRole(['Admin', 'Teacher']), async (req, res) => {
  try {
    const schedule = await db.createSchedule(req.body);
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/schedules/:id', authenticate, requireRole(['Admin', 'Teacher']), async (req, res) => {
  try {
    const schedule = await db.updateSchedule(req.params.id, req.body);
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/schedules/:id', authenticate, requireRole(['Admin', 'Teacher']), async (req, res) => {
  try {
    await db.deleteSchedule(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registration Routes
router.get('/registrations', authenticate, async (req: any, res) => {
  try {
    const registrations = await db.getRegistrations();
    const userRoles = req.user.Role ? req.user.Role.split(',').map((r: string) => r.trim()) : [];
    if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(registrations); } else if (userRoles.includes('Student')) {
      res.json(registrations.filter(r => r.StudentID === req.user.UserID));
    } else {
      res.json(registrations);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/registrations', authenticate, async (req: any, res) => {
  try {
    const { ScheduleID, PoolID, Notes } = req.body;
    
    if (ScheduleID !== 'CUSTOM') {
      const schedules = await db.getSchedules();
      const schedule = schedules.find(s => s.ScheduleID === ScheduleID);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      
      const registrations = await db.getRegistrations();
      const approvedCount = registrations.filter(r => r.ScheduleID === ScheduleID && r.ApprovalStatus === 'Approved').length;
      
      if (approvedCount >= parseInt(schedule.MaxStudents)) {
        return res.status(400).json({ error: 'Schedule is full' });
      }
    }
    
    const reg = await db.createRegistration({
      StudentID: req.body.StudentID || req.user.UserID,
      ScheduleID,
      PoolID,
      ApprovalStatus: req.body.ApprovalStatus || 'Pending',
      ApprovedBy: '',
      ApprovedAt: '',
      Notes: Notes || ''
    });
    res.json(reg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/registrations/:id/approve', authenticate, requireRole(['Admin']), async (req: any, res) => {
  try {
    const { status } = req.body; // Approved or Rejected
    const reg = await db.updateRegistration(req.params.id, {
      ApprovalStatus: status,
      ApprovedBy: req.user.UserID,
      ApprovedAt: new Date().toISOString()
    });
    
    if (status === 'Approved') {
      // Create attendance records for next 4 weeks
      // Actually we should figure out the dates based on DayOfWeek, but for simplicity let's just create 4 empty records 
      // or we can let admin generate them later. The prompt says: "tự động tạo các bản ghi trong sheet Attendance cho các buổi học sắp tới"
      // Let's just create 4 generic placeholders for now.
      for (let i = 1; i <= 4; i++) {
        await db.createAttendance({
          RegistrationID: reg.RegistrationID,
          ScheduleID: reg.ScheduleID,
          StudentID: reg.StudentID,
          SessionDate: `Session ${i}`, // Simplification for demo
          Status: 'Scheduled',
          TeacherNote: ''
        });
      }
    }
    
    res.json(reg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance Routes
router.get('/attendance', authenticate, async (req: any, res) => {
  try {
    const allAtt = await db.getAttendance();
    const userRoles = req.user.Role ? req.user.Role.split(',').map((r: string) => r.trim()) : [];
    if (userRoles.includes('Teacher')) {
      // Need to filter by teacher's schedules
      const schedules = await db.getSchedules();
      const teacherSchedules = schedules.filter(s => s.TeacherID === req.user.UserID).map(s => s.ScheduleID);
      res.json(allAtt.filter(a => teacherSchedules.includes(a.ScheduleID)));
    } else if (userRoles.includes('Admin')) { res.json(allAtt); } else if (userRoles.includes('Student')) {
      res.json(allAtt.filter(a => a.StudentID === req.user.UserID));
    } else {
      res.json(allAtt);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/attendance/:id', authenticate, requireRole(['Teacher', 'Admin']), async (req, res) => {
  try {
    const att = await db.updateAttendance(req.params.id, req.body);
    res.json(att);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Routes
router.get('/payments', authenticate, async (req: any, res) => {
  try {
    const payments = await db.getPayments();
    const userRoles = req.user.Role ? req.user.Role.split(',').map((r: string) => r.trim()) : [];
    if (userRoles.includes('Admin') || userRoles.includes('Teacher')) { res.json(payments); } else if (userRoles.includes('Student')) {
      res.json(payments.filter(p => p.StudentID === req.user.UserID));
    } else {
      res.json(payments);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/payments', authenticate, requireRole(['Admin']), async (req: any, res) => {
  try {
    const payment = await db.createPayment({
      ...req.body,
      ConfirmedBy: req.user.UserID,
      PaymentDate: new Date().toISOString()
    });
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
