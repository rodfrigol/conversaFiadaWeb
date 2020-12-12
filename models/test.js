const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    chat_id: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const test = mongoose.model("test", UserSchema);

module.exports = test;