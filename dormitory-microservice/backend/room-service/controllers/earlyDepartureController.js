const prisma = require('../lib/prismaClient');
const { publishMessage } = require('../lib/rabbitmq');

// POST /api/v1/stays/early-departure - Request early departure
const requestEarlyDeparture = async (req, res) => {
  try {
    const { stay_id, reason } = req.body;
    const student_id = req.user?.id;

    if (!stay_id) {
      return res.status(400).json({ error: 'stay_id is required' });
    }

    const stay = await prisma.stay.findUnique({
      where: { id: stay_id },
    });

    if (!stay || stay.studentId !== student_id) {
      return res.status(404).json({ error: 'Stay not found or access denied' });
    }

    if (stay.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only ACTIVE stays can request early departure' });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.earlyDepartureRequest.findFirst({
      where: {
        stayId: stay_id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Bạn đã gửi yêu cầu rời sớm cho lượt ở này.' });
    }

    const request = await prisma.earlyDepartureRequest.create({
      data: {
        stayId: stay_id,
        studentId: student_id,
        reason: reason || '',
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Yêu cầu rời sớm đã được gửi.', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/early-departures - Get all requests (Admin)
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const requests = await prisma.earlyDepartureRequest.findMany({
      where,
      include: {
        stay: {
          include: {
            room: true,
          },
        },
      },
      orderBy: { requestDate: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/early-departures/:id/approve - Approve request (Admin)
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user?.id;

    const request = await prisma.earlyDepartureRequest.findUnique({
      where: { id },
      include: { stay: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING requests can be approved' });
    }

    // Transaction to update request and stay
    const [updatedRequest, updatedStay] = await prisma.$transaction([
      prisma.earlyDepartureRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          processedBy: admin_id,
        },
      }),
      prisma.stay.update({
        where: { id: request.stayId },
        data: {
          status: 'LEFT_EARLY',
          endDate: new Date(), // Set end date to now
        },
      }),
    ]);

    // PUBLISH EVENT
    await publishMessage('stay_events', 'stay.updated', {
      stayId: updatedStay.id,
      studentId: updatedStay.studentId,
      status: 'LEFT_EARLY'
    });

    res.json({ message: 'Yêu cầu rời sớm đã được duyệt.', updatedRequest, updatedStay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/early-departures/:id/reject - Reject request (Admin)
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user?.id;

    const request = await prisma.earlyDepartureRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only PENDING requests can be rejected' });
    }

    const updatedRequest = await prisma.earlyDepartureRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedAt: new Date(),
        processedBy: admin_id,
      },
    });

    res.json({ message: 'Yêu cầu rời sớm đã bị từ chối.', updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requestEarlyDeparture,
  getAllRequests,
  approveRequest,
  rejectRequest,
};
