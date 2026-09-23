const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true
  },
  techStack: {
    type: [String],
    required: [true, 'Technologies are required'],
    default: []
  },
  keyFeatures: {
    type: [String],
    default: []
  },
  projectYear: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: '',
    trim: true
  },
  liveWebsiteUrl: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);
