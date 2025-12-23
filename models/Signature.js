import mongoose from 'mongoose';

const SignatureSchema = new mongoose.Schema({
  pdfId: {
    type: String,
    required: true,
  },
  originalHash: {
    type: String,
    required: true,
  },
  signedHash: {
    type: String,
    required: true,
  },
  signedPdfPath: {
    type: String,
    required: true,
  },
  coordinates: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Signature || mongoose.model('Signature', SignatureSchema);
