const prisma = require('../lib/prismaClient');

// GET /api/v1/rooms - List rooms with filters
const listRooms = async (req, res) => {
  try {
    const { type, gender, status } = req.query;
    const where = {};

    if (type) where.type = type;
    if (gender) where.gender = gender;
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        stays: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const roomsWithOccupancy = rooms.map((room) => ({
      ...room,
      current_occupants: room.stays.length,
      available_slots: room.capacity - room.stays.length,
    }));

    res.json(roomsWithOccupancy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/rooms/:id - Get room details
const getRoomDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        stays: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      ...room,
      current_occupants: room.stays.length,
      available_slots: room.capacity - room.stays.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/admin/rooms - Create room (Admin only)
const createRoom = async (req, res) => {
  try {
    const { room_number, capacity, type, gender } = req.body;

    if (!room_number || !capacity || !type || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const room = await prisma.room.create({
      data: {
        roomNumber: room_number,
        capacity: parseInt(capacity),
        type,
        gender,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/admin/rooms/:id - Update room (Admin only)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity, type, gender, status } = req.body;

    const room = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        capacity: capacity !== undefined ? parseInt(capacity) : undefined,
        type: type !== undefined ? type : undefined,
        gender: gender !== undefined ? gender : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    res.json({ message: 'Room updated', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/v1/admin/rooms/:id - Delete room (Admin only)
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.room.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Room deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/admin/rooms/statistics - Room statistics (Admin only)
const getRoomStatistics = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        stays: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const stats = {
      total_rooms: rooms.length,
      available_rooms: rooms.filter((r) => r.stays.length < r.capacity).length,
      full_rooms: rooms.filter((r) => r.stays.length === r.capacity).length,
      empty_rooms: rooms.filter((r) => r.stays.length === 0).length,
      total_occupancy: rooms.reduce((sum, r) => sum + r.stays.length, 0),
      total_capacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      occupancy_rate: (
        (rooms.reduce((sum, r) => sum + r.stays.length, 0) /
          rooms.reduce((sum, r) => sum + r.capacity, 0)) *
        100
      ).toFixed(2),
      by_type: {
        NORMAL: rooms.filter((r) => r.type === 'NORMAL').length,
        PREMIUM: rooms.filter((r) => r.type === 'PREMIUM').length,
      },
      by_gender: {
        MALE: rooms.filter((r) => r.gender === 'MALE').length,
        FEMALE: rooms.filter((r) => r.gender === 'FEMALE').length,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listRooms,
  getRoomDetails,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStatistics,
};
