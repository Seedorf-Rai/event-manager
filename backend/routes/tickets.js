const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/generate', protect, async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });
    if (event.registeredCount >= event.capacity) return res.status(400).json({ message: 'Event is at full capacity' });

    const existingTicket = await Ticket.findOne({ user: req.user._id, event: eventId });
    if (existingTicket) return res.status(400).json({ message: 'You already have a ticket for this event', ticket: existingTicket });

    const ticketId = `TKT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;
    const qrPayload = JSON.stringify({ ticketId, userId: req.user._id, eventId, timestamp: Date.now() });
    const qrCodeImage = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });

    const ticket = await Ticket.create({ ticketId, user: req.user._id, event: eventId, qrCodeData: qrPayload, qrCodeImage });
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name email registrationNo photo').populate('event', 'name venue date thumbnail');
    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).populate('event', 'name venue date thumbnail description').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', protect, adminOnly, async (req, res) => {
  try {
    const { qrData } = req.body;
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ message: 'Invalid QR code data', valid: false });
    }

    const ticket = await Ticket.findOne({ ticketId: parsedData.ticketId }).populate('user', 'name email registrationNo photo').populate('event', 'name venue date thumbnail');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found in database', valid: false });
    if (ticket.isUsed) {
      return res.status(400).json({
        message: 'Ticket already used',
        valid: false,
        usedAt: ticket.usedAt,
        ticket: { ticketId: ticket.ticketId, user: ticket.user, event: ticket.event }
      });
    }

    await Ticket.findByIdAndUpdate(ticket._id, { isUsed: true, usedAt: new Date() });

    res.json({
      valid: true,
      message: 'Ticket verified successfully',
      ticket: {
        ticketId: ticket.ticketId,
        user: ticket.user,
        event: ticket.event,
        generatedAt: ticket.generatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email registrationNo photo').populate('event', 'name venue date').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;