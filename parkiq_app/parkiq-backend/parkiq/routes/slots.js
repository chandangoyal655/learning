// ══════════════════════════════════════════════
//  /api/slots — Slot Routes
// ══════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const store   = require('../data/store');

// GET /api/slots
// Returns all slots (optionally filter by zone)
// Query: ?zone=A
router.get('/', (req, res) => {
  const { zone } = req.query;
  const slots = zone ? store.getSlotsByZone(zone.toUpperCase()) : store.getAllSlots();
  res.json({ success: true, count: slots.length, slots });
});

// GET /api/slots/stats
// Returns free/occupied/booked counts per zone
router.get('/stats', (req, res) => {
  const stats = store.getZoneStats();
  res.json({ success: true, stats });
});

// GET /api/slots/random/:zone
// Returns a random free slot from a given zone (used for Zone A auto-allotment)
router.get('/random/:zone', (req, res) => {
  const zone  = req.params.zone.toUpperCase();
  const free  = store.getFreeSlotsByZone(zone);

  if (free.length === 0) {
    return res.status(404).json({ success: false, message: `Zone ${zone} is fully occupied. No slots available.` });
  }

  const slot = free[Math.floor(Math.random() * free.length)];
  res.json({ success: true, slot, available: free.length });
});

// GET /api/slots/:id
// Returns a single slot's current status
router.get('/:id', (req, res) => {
  const slot = store.getSlot(req.params.id.toUpperCase());
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
  res.json({ success: true, slot });
});

module.exports = router;
