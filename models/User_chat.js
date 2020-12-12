const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  chat_id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const User_chat = mongoose.model('User_chat', UserSchema);

module.exports = User_chat;
