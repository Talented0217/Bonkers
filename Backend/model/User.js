const mongoose = require("mongoose");
const User = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  solana_wallet: {
    type: String,
  },
  earn: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("user", User);
