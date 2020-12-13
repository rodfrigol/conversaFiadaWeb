const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  chat_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Chat'
  }
});

const User_chat = mongoose.model('User_chat', UserSchema);

module.exports = User_chat;
