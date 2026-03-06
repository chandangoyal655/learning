// ══════════════════════════════════════════════
//  /api/bookings — Booking Routes
// ══════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const store   = require('../data/store');

// ── Role-to-zone mapping ──
const ROLE_ZONE = { student: 'A', staff: 'B', dean: 'C' };

// ── Input validation ──
function validate(body) {
  const { name, role, vehicleType, vehicleNum, slotId, hours } = body;
  if (!name)        return 'name is required';
  if (!role || !ROLE_ZONE[role]) return 'role must be student, staff, or dean';
  if (!['car','bike','truck','ev'].includes(vehicleType)) return 'vehicleType must be car, bike, truck, or ev';
  if (!vehicleNum)  return 'vehicleNum is required';
  if (!slotId)      return 'slotId is required';
  if (!hours || hours < 1 || hours > 24) return 'hours must be between 1 and 24';
  // Zone enforcement
  const allowed = ROLE_ZONE[role];
  if (!slotId.toUpperCase().startsWith(allowed)) {
    return `Role '${role}' can only book Zone ${allowed} slots (got ${slotId})`;
  }
  return null;
}

// POST /api/bookings
// Create a new booking
router.post('/', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const { name, userId, role, vehicleType, vehicleNum, slotId, hours, from } = req.body;

  // Generate ticket ID with role prefix
  const prefix = role === 'dean' ? 'VIP' : role === 'staff' ? 'STF' : 'TKT';
  const bookingId = `${prefix}-${uuidv4().slice(0,8).toUpperCase()}`;

  const result = store.createBooking({
    bookingId, name, userId, role, vehicleType,
    vehicleNum: vehicleNum.toUpperCase(),
    slotId: slotId.toUpperCase(),
    hours: parseInt(hours),
    from: from || 'now',
  });

  if (result.error) {
    return res.status(409).json({ success: false, message: result.error });
  }

  res.status(201).json({ success: true, booking: result.booking });
});

// GET /api/bookings
// List all bookings (admin use)
router.get('/', (req, res) => {
  const bookings = store.getAllBookings();
  res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/:id
// Get a single booking by ticket ID
router.get('/:id', (req, res) => {
  const booking = store.getBooking(req.params.id.toUpperCase());
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
});

// DELETE /api/bookings/:id
// Cancel a booking — frees the slot
router.delete('/:id', (req, res) => {
  const result = store.cancelBooking(req.params.id.toUpperCase());
  if (result.error) return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, message: 'Booking cancelled', booking: result.booking });
});

module.exports = router;
