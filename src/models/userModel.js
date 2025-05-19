
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide your date of birth'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please provide your street address'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Please provide your city'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Please provide your postal code'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Please provide your country'],
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        }
      }
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['artisan', 'client'],
      default: 'client',
      required: true,
    },
    category: {
      type: String,
      enum: ['Couture', 'Cuisine', 'Peinture', 'Electricite'],
      required: function() {
        return this.role === 'artisan';
      }
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    profileImage: {
      type: String,
      default: 'default-profile.jpg',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.generateVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};


userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};


userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;