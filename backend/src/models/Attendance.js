import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["present"],
      default: "present"
    },
    confidence: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);
