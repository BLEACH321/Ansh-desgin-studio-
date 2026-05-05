const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['interior', 'graphics', 'architecture'], required: true },
  image: { type: String, required: true },
  gallery: { type: [String], default: [] },
  desc: { type: String },
  location: { type: String },
  year: { type: String },
  area: { type: String },
  size: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
