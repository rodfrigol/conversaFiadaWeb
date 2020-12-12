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
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Messages = mongoose.model('Messages', UserSchema);

module.exports = Messages;
