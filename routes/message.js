const express = require("express");
const router = express.Router();
const Messages = require("../models/Messages");
const Chat = require("../models/Chat");

router.post("/send", (req, res) => {
    const newMsg = new Messages({
        user_id: req.user._id,
        chat_id: req.body.chat_id,
        message: req.body.message,
        name: req.user.name
    });
    newMsg.save(()=>{
        Chat.updateOne({ _id: req.body.chat_id}, {last_msg: newMsg._id}).then(()=>{
            res.end(JSON.stringify(newMsg))
        })
    })
});

router.get("/get", (req, res) => {
    var chat_id = req.url.substring(req.url.indexOf('=') + 1)
    Messages.find({ chat_id: chat_id }).sort({date: "asc"})
    .populate('user_id')
    .then((messages) => {

        var resp = []
        messages.forEach((msg) => {
            resp.push({
                author: msg.name,
                content: msg.message,
                date: msg.date.toLocaleString(),
                icon: msg.user_id.icon,
                is_self: msg.user_id.email == req.user.email
            })
        })
        res.end(JSON.stringify(resp))

    })
})

module.exports = router;