const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  qrCodeData: { type: String, required: true },
  qrCodeImage: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);