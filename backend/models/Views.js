import mongoose from 'mongoose';
const viewCounterSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});
export default mongoose.model('ViewCounter', viewCounterSchema);