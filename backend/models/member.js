const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itno: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  access: { type: String, enum: ["admin", "manager", "user"], default: "user", required: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
