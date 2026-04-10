const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const policeOfficerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    badgeNumber: {
      type: String,
      required: [true, 'Badge number is required'],
      unique: true,
      trim: true,
    },
    rank: {
      type: String,
      required: [true, 'Rank is required'],
      enum: [
        'Constable',
        'Head Constable',
        'ASI',
        'Sub Inspector',
        'Inspector',
        'DSP',
        'SP',
        'SSP',
        'DIG',
        'IG',
        'DGP',
      ],
    },
    assignedPoliceStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
    },
    policeStationCode: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    profilePhoto: {
      type: String,
    },
    role: {
      type: String,
      default: 'police',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

policeOfficerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

policeOfficerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

policeOfficerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('PoliceOfficer', policeOfficerSchema);
