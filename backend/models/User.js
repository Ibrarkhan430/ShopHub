const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  postalCode: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    default: '',
  },

  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    phone: {
      type: String,
      default: '',
    },

    profileImage: {
      type: String,
      default: '',
    },

    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// ======================================================
// HASH PASSWORD BEFORE SAVE
// ======================================================
userSchema.pre('save', async function () {
  // If password was not changed, don't hash it again
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// ======================================================
// CHECK PASSWORD
// ======================================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);