// const mongoose = require('mongoose');

// const callLogSchema = new mongoose.Schema({
//   caller: { type: String, required: true },
//   receiver: { type: String, required: true },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date },
//   duration: { type: Number },
//   callType: { type: String, enum: ['audio', 'video'], required: true },
//   status: { type: String, enum: ['answered', 'missed', 'rejected', 'initiated'], required: true }, // Add 'initiated' here
// });

// module.exports = mongoose.model('CallLog', callLogSchema);

// utils/models/callLog.js

// const mongoose = require('mongoose');
import mongoose from "mongoose";
// Check if the model already exists in mongoose.models to avoid overwriting
const callLogSchema = new mongoose.Schema({
  caller: { type: String, required: true },
  receiver: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  callType: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['answered', 'missed', 'rejected', 'initiated'], required: true },
});

// Use the model if it exists, otherwise define a new one
const CallLog = mongoose.models.CallLog || mongoose.model('CallLog', callLogSchema);

// module.exports = CallLog;
export default CallLog;
