import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String }, // Made optional for mobile-only users
  mobile: { type: String }, // Added for mobile-only users
  region: { type: String }, // To track which state they registered from
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  // Subscription plan: free | bronze | silver | gold
  plan: { type: String, default: "free", enum: ["free", "bronze", "silver", "gold"] },
  downloadCount: { type: Number, default: 0 },
  lastDownloadDate: { type: Date, default: null },
});

export default mongoose.model("user", userschema);
