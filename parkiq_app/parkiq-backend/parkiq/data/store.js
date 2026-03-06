// ══════════════════════════════════════════════
//  ParkIQ — In-Memory Data Store
//  Replace this with a real DB (MongoDB/PostgreSQL)
//  by swapping these functions with DB queries.
// ══════════════════════════════════════════════

// ── SLOT DEFINITIONS ──
const ZONES = {
  A: { label: 'Zone A — Student Parking', role: 'student', total: 20, level: 'B1', free: true },
  B: { label: 'Zone B — Staff Parking',   role: 'staff',   total: 20, level: 'B1', free: true },
  C: { label: 'Zone C — VIP Dean Zone',   role: 'dean',    total: 10, level: 'P1', free: true },
};

// Generate all slot IDs
function generateSlots() {
  const slots = {};

  // Zone A: A01–A20
  for (let i = 1; i <= 20; i++) {
    const id = 'A' + String(i).padStart(2, '0');
    slots[id] = { id, zone: 'A', status: 'free', booking: null };
  }

  // Zone B: B01–B20
  for (let i = 1; i <= 20; i++) {
    const id = 'B' + String(i).padStart(2, '0');
    slots[id] = { id, zone: 'B', status: 'free', booking: null };
  }

  // Zone C: C01–C10
  for (let i = 1; i <= 10; i++) {
    const id = 'C' + String(i).padStart(2, '0');
    slots[id] = { id, zone: 'C', status: 'free', booking: null };
  }

  // Pre-occupy some slots to simulate real usage
  ['A04','A07','A13','A17','A20'].forEach(id => { slots[id].status = 'occupied'; });
  ['B02','B05','B09','B14','B18'].forEach(id => { slots[id].status = 'occupied'; });
  ['C03','C08'].forEach(id => { slots[id].status = 'occupied'; });

  return slots;
}

// ── LIVE STATE ──
const slots    = generateSlots();  // { slotId: slotObject }
const bookings = {};               // { bookingId: bookingObject }

// ── BASE RATES ──
const BASE_RATES = { car: 50, bike: 20, truck: 80, ev: 40 };

function calcPrice(role, vehicleType, hours) {
  if (role === 'staff' || role === 'dean') return 0;
  return BASE_RATES[vehicleType] * hours;
}

// ── SLOT QUERIES ──
function getAllSlots() {
  return Object.values(slots);
}

function getSlotsByZone(zone) {
  return Object.values(slots).filter(s => s.zone === zone);
}

function getSlot(id) {
  return slots[id] || null;
}

function getFreeSlotsByZone(zone) {
  return Object.values(slots).filter(s => s.zone === zone && s.status === 'free');
}

function getZoneStats() {
  const stats = {};
  for (const [zone, info] of Object.entries(ZONES)) {
    const zoneSlots = getSlotsByZone(zone);
    stats[zone] = {
      ...info,
      free:     zoneSlots.filter(s => s.status === 'free').length,
      occupied: zoneSlots.filter(s => s.status === 'occupied').length,
      booked:   zoneSlots.filter(s => s.status === 'booked').length,
    };
  }
  return stats;
}

// ── BOOKING LOGIC ──
function createBooking({ bookingId, name, userId, role, vehicleType, vehicleNum, slotId, hours, from }) {
  const slot = slots[slotId];
  if (!slot)                return { error: 'Slot not found' };
  if (slot.status !== 'free') return { error: 'Slot is not available' };

  // Zone enforcement
  const allowedZone = ZONES[Object.keys(ZONES).find(z => ZONES[z].role === role)];
  if (!allowedZone || slot.zone !== Object.keys(ZONES).find(z => ZONES[z].role === role)) {
    return { error: 'This slot is not in your permitted zone' };
  }

  const price = calcPrice(role, vehicleType, hours);
  const createdAt = new Date().toISOString();

  const booking = {
    id: bookingId,
    name, userId, role, vehicleType, vehicleNum,
    slotId, zone: slot.zone, hours, from, price, createdAt,
    status: 'confirmed',
  };

  // Update slot
  slot.status  = 'booked';
  slot.booking = bookingId;

  // Store booking
  bookings[bookingId] = booking;

  return { booking };
}

function getBooking(id) {
  return bookings[id] || null;
}

function getAllBookings() {
  return Object.values(bookings);
}

function cancelBooking(id) {
  const booking = bookings[id];
  if (!booking) return { error: 'Booking not found' };
  if (booking.status === 'cancelled') return { error: 'Already cancelled' };

  booking.status = 'cancelled';
  const slot = slots[booking.slotId];
  if (slot) { slot.status = 'free'; slot.booking = null; }

  return { booking };
}

module.exports = {
  ZONES, BASE_RATES, calcPrice,
  getAllSlots, getSlotsByZone, getSlot, getFreeSlotsByZone, getZoneStats,
  createBooking, getBooking, getAllBookings, cancelBooking,
};
