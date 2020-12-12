const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Chat = mongoose.model('Chat', UserSchema);

module.exports = Chat;
