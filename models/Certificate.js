const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateTitle: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    trim: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  pdfData: {
    data: Buffer,
    contentType: String,
    originalName: String,
    size: Number
  },
  imageData: {
    data: Buffer,
    contentType: String,
    originalName: String,
    size: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certificate', certificateSchema);
