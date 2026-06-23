const prisma = require('../lib/prismaClient');

// POST /api/v1/students - Create student profile
const createStudentProfile = async (req, res) => {
  try {
    const { fullName, phone, gender, dateOfBirth } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { userId: user_id },
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'Student profile already exists' });
    }

    const student = await prisma.student.create({
      data: {
        userId: user_id,
        fullName: fullName || '',
        phone: phone || '',
        gender: gender || 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ message: 'Student profile created', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/students/me - Get own profile
const getOwnProfile = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user_id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/students/me - Update own profile
const updateOwnProfile = async (req, res) => {
  try {
    const { fullName, phone, gender, dateOfBirth } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    
    // Only update gender if it's a valid enum value
    if (gender === 'MALE' || gender === 'FEMALE') {
      updateData.gender = gender;
    }

    const student = await prisma.student.upsert({
      where: { userId: user_id },
      update: updateData,
      create: {
        userId: user_id,
        fullName: fullName || '',
        phone: phone || '',
        gender: (gender === 'MALE' || gender === 'FEMALE') ? gender : 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    res.json({ message: 'Profile updated', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/students - Get all students (Admin only)
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { id: 'desc' },
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/students/:id - Get student details (Admin only)
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudentProfile,
  getOwnProfile,
  updateOwnProfile,
  getAllStudents,
  getStudentDetails,
};
