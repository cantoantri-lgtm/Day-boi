import { rowsToObjects } from './sheets.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Table names = Sheet names
const SHEETS = {
  USERS: 'Users',
  POOLS: 'Pools',
  SCHEDULES: 'Schedules',
  REGISTRATIONS: 'Registrations',
  ATTENDANCE: 'Attendance',
  PAYMENTS: 'Payments',
};

// Types
export interface User {
  UserID: string;
  PhoneNumber: string;
  PasswordHash: string;
  FullName: string;
  Role: string;
  Admin?: string;
  CreatedAt: string;
  Status: 'Active' | 'Inactive';
}

export interface Pool {
  PoolID: string;
  PoolName: string;
  Address: string;
  Capacity: string;
  OpenTime: string;
  CloseTime: string;
  PricePerSession: string;
  Status: 'Active' | 'Inactive';
  Notes: string;
}

export interface Schedule {
  ScheduleID: string;
  PoolID: string;
  TeacherID: string;
  DayOfWeek: string;
  StartTime: string;
  EndTime: string;
  MaxStudents: string;
  Status: 'Active' | 'Inactive';
}

export interface Registration {
  RegistrationID: string;
  StudentID: string;
  ScheduleID: string;
  PoolID: string;
  RegisteredAt: string;
  ApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
  ApprovedBy: string;
  ApprovedAt: string;
  Notes: string;
}

export interface Attendance {
  AttendanceID: string;
  RegistrationID: string; // The schedule + student basically
  ScheduleID: string;
  StudentID: string;
  SessionDate: string;
  Status: 'Scheduled' | 'Completed' | 'Absent' | 'Cancelled';
  TeacherNote: string;
}

export interface Payment {
  PaymentID: string;
  StudentID: string;
  RegistrationID: string;
  Amount: string;
  PaymentDate: string;
  PaymentMethod: string;
  PaymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  ConfirmedBy: string;
  Notes: string;
}

let inMemoryData: any = {
  Users: [
    ['UserID', 'PhoneNumber', 'PasswordHash', 'FullName', 'Role', 'CreatedAt', 'Status'],
    // Default Admin: 0999999999 / 123456
    ['admin-id-123', '0999999999', '$2a$10$X8a.jOqK.xQ.P7yXz4n6uO2Q5U8f0s6A2T9w2H1k3e/Z7b5l4X5rC', 'Quản trị viên', 'Admin', new Date().toISOString(), 'Active'],
    // Default Teacher: 0888888888 / 123456
    ['teacher-id-123', '0888888888', '$2a$10$X8a.jOqK.xQ.P7yXz4n6uO2Q5U8f0s6A2T9w2H1k3e/Z7b5l4X5rC', 'GV Nguyễn Văn Bơi', 'Teacher', new Date().toISOString(), 'Active'],
    // Default Student: 0777777777 / 123456
    ['student-id-123', '0777777777', '$2a$10$X8a.jOqK.xQ.P7yXz4n6uO2Q5U8f0s6A2T9w2H1k3e/Z7b5l4X5rC', 'Học viên Test', 'Student', new Date().toISOString(), 'Active']
  ],
  Pools: [
    ['PoolID', 'PoolName', 'Address', 'Capacity', 'OpenTime', 'CloseTime', 'PricePerSession', 'Status', 'Notes'],
    ['pool-1', 'Hồ Bơi Yết Kiêu', 'Số 1 Nguyễn Thị Minh Khai', '20', '06:00', '20:00', '150000', 'Active', 'Hồ tiêu chuẩn 50m']
  ],
  Schedules: [
    ['ScheduleID', 'PoolID', 'TeacherID', 'DayOfWeek', 'StartTime', 'EndTime', 'MaxStudents', 'Status'],
    ['schedule-1', 'pool-1', 'teacher-id-123', 'Thứ 2', '08:00', '10:00', '10', 'Active']
  ],
  Registrations: [['RegistrationID', 'StudentID', 'ScheduleID', 'PoolID', 'RegisteredAt', 'ApprovalStatus', 'ApprovedBy', 'ApprovedAt', 'Notes']],
  Attendance: [['AttendanceID', 'RegistrationID', 'ScheduleID', 'StudentID', 'SessionDate', 'Status', 'TeacherNote']],
  Payments: [['PaymentID', 'StudentID', 'RegistrationID', 'Amount', 'PaymentDate', 'PaymentMethod', 'PaymentStatus', 'ConfirmedBy', 'Notes']]
};

async function getRows(sheetName: string) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.log(`[Fallback] APPS_SCRIPT_URL not set. Using in-memory db for getRows(${sheetName})`);
    return inMemoryData[sheetName];
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow', // Make sure fetch follows redirects
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getRows', sheetName })
    });
    
    // Check if the response is actually JSON. 
    // Sometimes Google Apps Script returns HTML if there's a permission error or it's moved.
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const json = await response.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Content: ${text.substring(0, 100)}...`);
    }
  } catch (err: any) {
    console.error(`Error reading ${sheetName}:`, err.message);
    throw new Error(`GSheet Fetch Error: ${err.message}`);
  }
}

async function appendRow(sheetName: string, values: any[]) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName].push(values);
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'appendRow', sheetName, values })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

async function updateRow(sheetName: string, rowIndex: number, values: any[]) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName][rowIndex - 1] = values;
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateRow', sheetName, rowIndex, values })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

async function deleteRow(sheetName: string, rowIndex: number) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    inMemoryData[sheetName].splice(rowIndex - 1, 1);
    return;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteRow', sheetName, rowIndex })
  });
  const json = await response.json();
  if (json.error) throw new Error('Apps Script Error: ' + json.error);
}

// Users
export async function getUserByPhone(phone: string): Promise<User | null> {
  const rows = await getRows(SHEETS.USERS);
  const users = rowsToObjects<User>(rows, []);
  const normalize = (p: any) => String(p || '').replace(/^0+/, '');
  const searchPhone = normalize(phone);
  const u = users.find(u => normalize(u.PhoneNumber) === searchPhone);
  if (u && String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';
  return u || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await getRows(SHEETS.USERS);
  const users = rowsToObjects<User>(rows, []);
  const u = users.find(u => u.UserID === id);
  if (u && String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';
  return u || null;
}

export async function createUser(data: Omit<User, 'UserID' | 'CreatedAt'>): Promise<User> {
  const newUser: User = {
    ...data,
    UserID: uuidv4(),
    CreatedAt: new Date().toISOString(),
  };
  await appendRow(SHEETS.USERS, [
    newUser.UserID, "'" + newUser.PhoneNumber, newUser.PasswordHash,
    newUser.FullName, newUser.Role, newUser.Role.includes('Admin') ? 'TRUE' : '', newUser.CreatedAt, newUser.Status
  ]);
  return newUser;
}

export async function deleteUser(userId: string) {
  const rows = await getRows(SHEETS.USERS);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === userId);
  if (index === -1) throw new Error('User not found');
  
  await deleteRow(SHEETS.USERS, index + 1);
}

export async function updateUser(userId: string, data: Partial<User>) {
  const rows = await getRows(SHEETS.USERS);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === userId);
  if (index === -1) throw new Error('User not found');
  
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  
  const updated = { ...obj, ...data };
  if (data.Role !== undefined) {
    updated.Admin = data.Role.includes('Admin') ? 'TRUE' : '';
  }
  const newRow = actualHeaders.map((h: string) => updated[h] || '');
  
  await updateRow(SHEETS.USERS, index + 1, newRow);
  return updated;
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await getRows(SHEETS.USERS);
  const users = rowsToObjects<User>(rows, []);
  return users.filter(u => u && u.UserID).map(u => {
    if (String((u as any).Admin).toUpperCase() === 'TRUE' && !u.Role.includes('Admin')) u.Role += ', Admin';
    return u;
  });
}

// Pools
export async function getPools(): Promise<Pool[]> {
  const rows = await getRows(SHEETS.POOLS);
  return rowsToObjects<Pool>(rows, []);
}

export async function createPool(data: Omit<Pool, 'PoolID'>): Promise<Pool> {
  const newPool: Pool = { ...data, PoolID: uuidv4() };
  await appendRow(SHEETS.POOLS, [
    newPool.PoolID, newPool.PoolName, newPool.Address, newPool.Capacity,
    newPool.OpenTime, newPool.CloseTime, newPool.PricePerSession, newPool.Status, newPool.Notes
  ]);
  return newPool;
}

export async function updatePool(poolId: string, data: Partial<Pool>) {
  const rows = await getRows(SHEETS.POOLS);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === poolId);
  if (index === -1) throw new Error('Pool not found');
  
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => updated[h] || '');
  
  await updateRow(SHEETS.POOLS, index + 1, newRow);
  return updated;
}

// Schedules
export async function getSchedules(): Promise<Schedule[]> {
  const rows = await getRows(SHEETS.SCHEDULES);
  return rowsToObjects<Schedule>(rows, []);
}

export async function createSchedule(data: Omit<Schedule, 'ScheduleID'>): Promise<Schedule> {
  const newSched: Schedule = { ...data, ScheduleID: uuidv4() };
  await appendRow(SHEETS.SCHEDULES, [
    newSched.ScheduleID, newSched.PoolID, newSched.TeacherID, newSched.DayOfWeek,
    `'${newSched.StartTime}`, `'${newSched.EndTime}`, newSched.MaxStudents, newSched.Status
  ]);
  return newSched;
}

export async function updateSchedule(scheduleId: string, data: Partial<Schedule>) {
  const rows = await getRows(SHEETS.SCHEDULES);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === scheduleId);
  console.log('UpdateSchedule:', { scheduleId, index, rowLength: rows.length });
  if (index === -1) throw new Error('Schedule not found');
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => {
    let val = updated[h] || '';
    if (h === 'StartTime' || h === 'EndTime') {
       if (typeof val === 'string' && !val.startsWith("'")) {
          val = "'" + val;
       }
    }
    return val;
  });
  console.log('UpdateRow args:', SHEETS.SCHEDULES, index + 1, newRow);
  await updateRow(SHEETS.SCHEDULES, index + 1, newRow);
  return updated;
}
export async function deleteSchedule(scheduleId: string) {
  const rows = await getRows(SHEETS.SCHEDULES);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === scheduleId);
  console.log('DeleteSchedule:', { scheduleId, index, rowLength: rows.length });
  if (index === -1) throw new Error('Schedule not found');
  await deleteRow(SHEETS.SCHEDULES, index + 1);
  return { success: true };
}
// Registrations
export async function getRegistrations(): Promise<Registration[]> {
  const rows = await getRows(SHEETS.REGISTRATIONS);
  return rowsToObjects<Registration>(rows, []);
}

export async function createRegistration(data: Omit<Registration, 'RegistrationID' | 'RegisteredAt'>): Promise<Registration> {
  const newReg: Registration = { 
    ...data, 
    RegistrationID: uuidv4(),
    RegisteredAt: new Date().toISOString()
  };
  await appendRow(SHEETS.REGISTRATIONS, [
    newReg.RegistrationID, newReg.StudentID, newReg.ScheduleID, newReg.PoolID,
    newReg.RegisteredAt, newReg.ApprovalStatus, newReg.ApprovedBy, newReg.ApprovedAt, newReg.Notes
  ]);
  return newReg;
}

export async function updateRegistration(regId: string, data: Partial<Registration>) {
  const rows = await getRows(SHEETS.REGISTRATIONS);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === regId);
  if (index === -1) throw new Error('Registration not found');
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => updated[h] || '');
  await updateRow(SHEETS.REGISTRATIONS, index + 1, newRow);
  return updated;
}

// Attendance
export async function getAttendance(): Promise<Attendance[]> {
  const rows = await getRows(SHEETS.ATTENDANCE);
  return rowsToObjects<Attendance>(rows, []);
}

export async function createAttendance(data: Omit<Attendance, 'AttendanceID'>): Promise<Attendance> {
  const newAtt: Attendance = { ...data, AttendanceID: uuidv4() };
  await appendRow(SHEETS.ATTENDANCE, [
    newAtt.AttendanceID, newAtt.RegistrationID, newAtt.ScheduleID, newAtt.StudentID,
    newAtt.SessionDate, newAtt.Status, newAtt.TeacherNote
  ]);
  return newAtt;
}

export async function updateAttendance(attId: string, data: Partial<Attendance>) {
  const rows = await getRows(SHEETS.ATTENDANCE);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === attId);
  if (index === -1) throw new Error('Attendance not found');
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => updated[h] || '');
  await updateRow(SHEETS.ATTENDANCE, index + 1, newRow);
  return updated;
}

// Payments
export async function getPayments(): Promise<Payment[]> {
  const rows = await getRows(SHEETS.PAYMENTS);
  return rowsToObjects<Payment>(rows, []);
}

export async function createPayment(data: Omit<Payment, 'PaymentID'>): Promise<Payment> {
  const newPay: Payment = { ...data, PaymentID: uuidv4() };
  await appendRow(SHEETS.PAYMENTS, [
    newPay.PaymentID, newPay.StudentID, newPay.RegistrationID, newPay.Amount,
    newPay.PaymentDate, newPay.PaymentMethod, newPay.PaymentStatus, newPay.ConfirmedBy, newPay.Notes
  ]);
  return newPay;
}

export async function updatePayment(payId: string, data: Partial<Payment>) {
  const rows = await getRows(SHEETS.PAYMENTS);
  const index = rows.findIndex((row, i) => i > 0 && row[0] === payId);
  if (index === -1) throw new Error('Payment not found');
  const actualHeaders = rows[0];
  const oldRow = rows[index];
  const obj: any = {};
  actualHeaders.forEach((h: string, i: number) => { obj[h] = oldRow[i]; });
  const updated = { ...obj, ...data };
  const newRow = actualHeaders.map((h: string) => updated[h] || '');
  await updateRow(SHEETS.PAYMENTS, index + 1, newRow);
  return updated;
}
