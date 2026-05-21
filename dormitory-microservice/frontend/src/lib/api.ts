// src/lib/api.ts
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';
const STUDENT_BASE_URL = import.meta.env.VITE_STUDENT_URL || 'http://localhost:3002';
const ROOM_BASE_URL = import.meta.env.VITE_ROOM_URL || 'http://localhost:3002';
const REGISTRATION_BASE_URL = import.meta.env.VITE_REGISTRATION_URL || 'http://localhost:3002';
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_URL || 'http://localhost:3003';
const COMPLAINT_BASE_URL = import.meta.env.VITE_COMPLAINT_URL || 'http://localhost:3002';
const UTILITY_BASE_URL = import.meta.env.VITE_UTILITY_URL || 'http://localhost:3002';

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: any;
}

// AUTH APIs
async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }

  return response.json();
}

async function logout(token: string) {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Logout failed');
  }

  return response.json();
}

async function getCurrentUser(token: string) {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch user failed');
  }

  return response.json();
}

async function refreshToken(token: string) {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Refresh failed');
  }

  return response.json();
}

// ROOMS APIs
async function getRooms(token: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/rooms`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch rooms failed');
  }

  return response.json();
}

async function getRoom(token: string, id: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/rooms/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch room failed');
  }

  return response.json();
}

async function createRoom(token: string, data: any) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Create room failed');
  }

  return response.json();
}

async function updateRoom(token: string, id: string, data: any) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/rooms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Update room failed');
  }

  return response.json();
}

async function deleteRoom(token: string, id: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/rooms/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Delete room failed');
  }

  return response.json();
}

// STUDENTS APIs
async function getStudentProfile(token: string) {
  const response = await fetch(`${STUDENT_BASE_URL}/api/v1/students/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch profile failed');
  }

  return response.json();
}

async function updateStudentProfile(token: string, data: any) {
  const response = await fetch(`${STUDENT_BASE_URL}/api/v1/students/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Update profile failed');
  }

  return response.json();
}

async function getStudents(token: string) {
  const response = await fetch(`${STUDENT_BASE_URL}/api/v1/admin/students`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch students failed');
  }

  return response.json();
}

async function getStudent(token: string, id: string) {
  const response = await fetch(`${STUDENT_BASE_URL}/api/v1/admin/students/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch student failed');
  }

  return response.json();
}

// REGISTRATIONS APIs
async function createRegistration(token: string, data: any) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Create registration failed');
  }

  return response.json();
}

async function getMyRegistrations(token: string) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/registrations/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch registrations failed');
  }

  return response.json();
}

async function getRegistration(token: string, id: string) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/registrations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch registration failed');
  }

  return response.json();
}

async function cancelRegistration(token: string, id: string) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/registrations/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Cancel registration failed');
  }

  return response.json();
}

async function getRegistrations(token: string) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/admin/registrations`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch registrations failed');
  }

  return response.json();
}

async function approveRegistration(token: string, id: string, data: any) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/admin/registrations/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Approve registration failed');
  }

  return response.json();
}

async function rejectRegistration(token: string, id: string) {
  const response = await fetch(`${REGISTRATION_BASE_URL}/api/v1/admin/registrations/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Reject registration failed');
  }

  return response.json();
}

// PAYMENTS APIs
async function createPayment(token: string, data: any) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Create payment failed');
  }

  return response.json();
}

async function getMyPayments(token: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/payments/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch payments failed');
  }

  return response.json();
}

async function getPayment(token: string, id: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/payments/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch payment failed');
  }

  return response.json();
}

async function confirmPayment(token: string, id: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/payments/${id}/confirm`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Confirm payment failed');
  }

  return response.json();
}

async function getPayments(token: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/admin/payments`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch payments failed');
  }

  return response.json();
}

// INVOICES APIs
async function getMyInvoices(token: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/invoices/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch invoices failed');
  }

  return response.json();
}

async function getInvoice(token: string, id: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/invoices/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch invoice failed');
  }

  return response.json();
}

async function getInvoices(token: string) {
  const response = await fetch(`${PAYMENT_BASE_URL}/api/v1/admin/invoices`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch invoices failed');
  }

  return response.json();
}

// STAYS APIs
async function getMyStays(token: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/stays/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch stays failed');
  }

  return response.json();
}

async function getStay(token: string, id: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/stays/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch stay failed');
  }

  return response.json();
}

async function getStays(token: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/stays`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch stays failed');
  }

  return response.json();
}

async function endStay(token: string, id: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/stays/${id}/end`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'End stay failed');
  }

  return response.json();
}

async function leaveEarlyStay(token: string, id: string) {
  const response = await fetch(`${ROOM_BASE_URL}/api/v1/admin/stays/${id}/leave-early`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Leave early failed');
  }

  return response.json();
}

// UTILITIES APIs
async function getMyUtilities(token: string) {
  const response = await fetch(`${UTILITY_BASE_URL}/api/v1/utilities/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch utilities failed');
  }

  return response.json();
}

async function getUtilities(token: string) {
  const response = await fetch(`${UTILITY_BASE_URL}/api/v1/admin/utilities`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch utilities failed');
  }

  return response.json();
}

async function createUtility(token: string, data: any) {
  const response = await fetch(`${UTILITY_BASE_URL}/api/v1/admin/utilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Create utility failed');
  }

  return response.json();
}

// COMPLAINTS APIs
async function submitComplaint(token: string, data: any) {
  const response = await fetch(`${COMPLAINT_BASE_URL}/api/v1/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Submit complaint failed');
  }

  return response.json();
}

async function getMyComplaints(token: string) {
  const response = await fetch(`${COMPLAINT_BASE_URL}/api/v1/complaints/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch complaints failed');
  }

  return response.json();
}

async function getComplaint(token: string, id: string) {
  const response = await fetch(`${COMPLAINT_BASE_URL}/api/v1/complaints/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch complaint failed');
  }

  return response.json();
}

async function getComplaints(token: string) {
  const response = await fetch(`${COMPLAINT_BASE_URL}/api/v1/admin/complaints`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Fetch complaints failed');
  }

  return response.json();
}

async function updateComplaintStatus(token: string, id: string, data: any) {
  const response = await fetch(`${COMPLAINT_BASE_URL}/api/v1/admin/complaints/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Update complaint status failed');
  }

  return response.json();
}

// REGISTER API
async function registerStudent(data: any) {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Register failed');
  }

  return response.json();
}

// Export api object with all functions
export const api = {
  // Auth
  login,
  logout,
  getCurrentUser,
  refreshToken,
  // Rooms
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  // Students
  getStudentProfile,
  updateStudentProfile,
  getStudents,
  getStudent,
  // Registrations
  createRegistration,
  getMyRegistrations,
  getRegistration,
  cancelRegistration,
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  // Payments
  createPayment,
  getMyPayments,
  getPayment,
  confirmPayment,
  getPayments,
  // Invoices
  getMyInvoices,
  getInvoice,
  getInvoices,
  // Stays
  getMyStays,
  getStay,
  getStays,
  endStay,
  leaveEarlyStay,
  // Utilities
  getMyUtilities,
  getUtilities,
  createUtility,
  // Complaints
  submitComplaint,
  getMyComplaints,
  getComplaint,
  getComplaints,
  updateComplaintStatus,
  // Register
  registerStudent,
}

// Also export individual functions for backward compatibility
export {
  login,
  logout,
  getCurrentUser,
  refreshToken,
}