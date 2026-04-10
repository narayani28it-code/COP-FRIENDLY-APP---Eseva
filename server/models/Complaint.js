const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Theft',
        'Assault',
        'Cybercrime',
        'Missing Person',
        'Fraud',
        'Harassment',
        'Road Accident',
        'Other',
      ],
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    incidentLocation: {
      address: { type: String, trim: true },
      district: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      policeStation: { type: String, trim: true },
    },
    evidenceFiles: [
      {
        url: String,
        type: { type: String, enum: ['image', 'video', 'document'] },
        filename: String,
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceOfficer',
      default: null,
    },
    assignedPoliceStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      default: null,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Filed',
        'Under Review',
        'FIR Registered',
        'Investigation Ongoing',
        'Closed',
        'Rejected',
      ],
      default: 'Filed',
    },
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'statusHistory.updatedByModel' },
        updatedByModel: { type: String, enum: ['Citizen', 'PoliceOfficer', 'Admin'] },
        updatedByRole: { type: String, enum: ['citizen', 'police', 'admin'] },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate complaintId before saving
complaintSchema.pre('save', async function (next) {
  if (this.isNew && !this.complaintId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    const seq = String(count + 1).padStart(5, '0');
    this.complaintId = `CMP-${year}-${seq}`;
  }
  next();
});

// Compound indexes for efficient querying
complaintSchema.index({ state: 1, district: 1, status: 1 });
complaintSchema.index({ filedBy: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
