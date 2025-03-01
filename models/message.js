// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   text: { type: String, required: true },
//   sender: { type: String, required: true },
//   receiver: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Message', messageSchema);

// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   text: { type: String },
//   sender: { type: String, required: true },
//   receiver: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   type: { type: String, enum: ['text', 'image', 'video', 'document'], default: 'text' },
//   content: { type: String }, // URL for images, videos, or documents
// });

// module.exports = mongoose.model('Message', messageSchema);

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String },
  sender: { type: String, required: true }, // Sender's user ID
  receiver: { type: String, required: true }, // Receiver's user ID
  timestamp: { type: Date, default: Date.now }, // Timestamp of the message
  type: { type: String, enum: ['text', 'image', 'video', 'document'], default: 'text' },
  content: { type: String }, // URL for images, videos, or documents
  deletedForSender: { type: Boolean, default: false }, // Track if deleted for sender
  deletedForReceiver: { type: Boolean, default: false }, // Track if deleted for receiver
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
