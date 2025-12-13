import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Interface representing a User document in MongoDB.
 * Extends Mongoose Document for database operations.
 */
export interface IUser extends Document {
  email: string;
  password: string;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Mongoose schema for the User model.
 * Defines the structure and validation for user documents.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to hash the user's password before saving to the database.
 * Only runs if the password field has been modified.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw error;
  }
});

/**
 * Instance method to compare a candidate password with the hashed password.
 * @param candidatePassword - The plain text password to compare.
 * @returns Promise<boolean> - True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Mongoose model for the User collection.
 * Provides methods for interacting with user documents in the database.
 */
const User = mongoose.model<IUser>('User', userSchema);

export default User;