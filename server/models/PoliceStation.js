const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    stationCode: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      trim: true,
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
    inChargeOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceOfficer',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PoliceStation', policeStationSchema);
