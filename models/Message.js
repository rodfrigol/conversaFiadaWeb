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
  },
  message:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', UserSchema);

module.exports = Message;
