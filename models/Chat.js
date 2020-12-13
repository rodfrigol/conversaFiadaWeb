const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
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
    },
    last_msg: {
      type: Schema.Types.ObjectId,
      ref: 'Messages',
      default: null
    }
  },
  {
      toObject: {virtuals:true}
  }
);

UserSchema.virtual('pvt_1', {
  ref: 'User',
  localField: 'pvt1',
  foreignField: 'email',
  justOne: true
});

UserSchema.virtual('pvt_2', {
  ref: 'User',
  localField: 'pvt2',
  foreignField: 'email',
  justOne: true
});

const Chat = mongoose.model('Chat', UserSchema);

module.exports = Chat;
