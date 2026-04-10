const mongoose = require('mongoose');

const ipcSectionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
});

// Text index for autocomplete search
ipcSectionSchema.index({ code: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('IPCSection', ipcSectionSchema);
