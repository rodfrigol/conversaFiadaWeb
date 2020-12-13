const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  count:{
    type: Number,
    required: false
  },
  is_pvt: {
    type: Number,
    required: true
  },
  pvt1: {
    type: String,
    required: false
  },
  pvt2: {
    type: String,
    required: false
  }
});

const Chat = mongoose.model('Chat', UserSchema);

module.exports = Chat;
