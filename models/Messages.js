const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    chat_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Chat'
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user_img: {
        type: String,
        required: true
    }
});

const Messages = mongoose.model('Messages', UserSchema);

module.exports = Messages;
