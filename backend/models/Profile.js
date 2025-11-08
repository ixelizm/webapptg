import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  verified: {
    type: Boolean,
    default: false
  },
  accountType: {
    type: String,
    enum: ['bireysel', 'ajans'],
    default: 'bireysel'
  }
}, {
  timestamps: true
});

export default mongoose.model('Profile', profileSchema);