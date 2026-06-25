const prisma = require('../lib/prismaClient');

const submitComplaint = async (req, res) => {
  try {
    const { room_id, title, description } = req.body;
    const student_id = req.user?.id;

    if (!room_id || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        studentId: student_id,
        roomId: room_id,
        title,
        description,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getOwnComplaints = async (req, res) => {
  try {
    const student_id = req.user?.id;
    const { status } = req.query;

    const where = { studentId: student_id };
    if (status) where.status = status;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student_id = req.user?.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.studentId !== student_id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const { status, room_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (room_id) where.roomId = room_id;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getComplaintDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_response } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { 
        status,
        staffResponse: staff_response || undefined
      },
    });

    res.json({ message: 'Complaint status updated', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitComplaint,
  getOwnComplaints,
  getComplaintDetails,
  getAllComplaints,
  getComplaintDetailsAdmin,
  updateComplaintStatus,
};
