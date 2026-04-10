const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const citizenSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      sparse: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    aadhaar: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^\d{12}$/.test(v);
        },
        message: 'Aadhaar must be 12 digits',
      },
    },
    aadhaarMasked: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    profilePhoto: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'citizen',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
citizenSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Mask aadhaar before saving
citizenSchema.pre('save', function (next) {
  if (this.isModified('aadhaar') && this.aadhaar) {
    this.aadhaarMasked = 'XXXX-XXXX-' + this.aadhaar.slice(-4);
  }
  next();
});

// Compare password method
citizenSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields in JSON
citizenSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.aadhaar;
  return obj;
};

module.exports = mongoose.model('Citizen', citizenSchema);
