const mongoose = require('mongoose');

const firSchema = new mongoose.Schema(
  {
    firNumber: {
      type: String,
      unique: true,
      index: true,
    },
    linkedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    filedByOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceOfficer',
      required: true,
    },
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      required: true,
    },
    accusedDetails: [
      {
        name: { type: String, required: true, trim: true },
        age: { type: Number },
        address: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    ipcSections: [
      {
        type: String,
        trim: true,
      },
    ],
    narrative: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    witnesses: [
      {
        name: { type: String, trim: true },
        contact: { type: String, trim: true },
        statement: { type: String, trim: true },
      },
    ],
    firDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Investigation', 'Chargesheet Filed', 'Closed'],
      default: 'Draft',
    },
    pdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate firNumber before saving
firSchema.pre('save', async function (next) {
  if (this.isNew && !this.firNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('FIR').countDocuments();
    const seq = String(count + 1).padStart(5, '0');
    this.firNumber = `FIR-${year}-${seq}`;
  }
  next();
});

firSchema.index({ filedByOfficer: 1, createdAt: -1 });
firSchema.index({ policeStation: 1 });
firSchema.index({ status: 1 });

module.exports = mongoose.model('FIR', firSchema);
