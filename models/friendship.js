import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    requester_id: {
      type: String,
      required: true,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending', // Default is 'pending' when the request is sent
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically sets the date the friendship is created
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' automatically
  }
);

const Friendship =
  mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema);

export default Friendship;
