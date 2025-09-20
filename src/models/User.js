const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  age: {
    type: Number,
    min: [0, 'Age must be a positive number'],
    max: [150, 'Age must be less than 150'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be an integer'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance optimization
userSchema.index({ email: 1 }); //ascending bel letters
userSchema.index({ age: 1 }); //ascending
userSchema.index({ createdAt: -1 }); //descending newely ceated comes first

// Middleware to update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for user age category
userSchema.virtual('ageCategory').get(function() {
  if (!this.age) return 'Not specified';
  if (this.age < 18) return 'Minor';
  if (this.age < 65) return 'Adult';
  return 'Senior';
});

module.exports = mongoose.model('User', userSchema);