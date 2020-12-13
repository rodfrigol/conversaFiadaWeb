const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Messages = require("../models/Messages");
const Chat = require("../models/Chat");
const User_chat = require("../models/User_chat");
const User = require("../models/User");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
    var global_chat = {
        chats: [],
        msgs: [],
        title: '',
    }

    User_chat.find({ user_id: req.user._id }).then((user_chats) => {
        
        var chats_id = []
        user_chats.forEach((user_chat) => {
            chats_id.push(user_chat.chat_id)
        })
        
        Chat.find({$or : [{ _id: {$in: chats_id }}, { pvt1: req.user.email }, { pvt2: req.user.email }]})
        .populate('pvt_1')
        .populate('pvt_2')
        .populate({ path: 'last_msg',
                    options: { sort: { date: -1 }}
                  })
        .then((chats) => {
            chats.forEach((c, i) => {
                global_chat.chats.push({
                    chat_id: c.id,
                    name: (c.is_pvt)? ((c.pvt1 === req.user.email)? c.pvt_2.name : c.pvt_1.name): c.name,
                    last_msg: (c.last_msg == null)? '' : c.last_msg.message,
                    last_msg_time: (c.last_msg == null)? null : c.last_msg.date,
                    last_msg_author: (c.last_msg == null)? '' : c.last_msg.name,
                    is_active: (i==0)?1:0,
                    is_pvt: c.is_pvt,
                    icon: (c.is_pvt)? ((c.pvt1 === req.user.email)? c.pvt_2.icon : c.pvt_1.icon):null
                })
            })

            if (chats.length > 0){
                global_chat.title = global_chat.chats[0].name

                Messages.find({chat_id: global_chat.chats[0].chat_id})
                .populate('user_id')
                .then(messages => {
                    messages.forEach(msg => {
                        global_chat.msgs.push({
                            is_self: (msg.user_id.email === req.user.email),
                            author: msg.name,
                            icon: msg.user_id.icon,
                            content: msg.message,
                            date: msg.date
                        })
                    })
                    
                    return res.render("dashboard", {
                        global_chat: global_chat,
                        user: req.user
                    });
                })
            }else{
                return res.render("dashboard", {
                    global_chat: global_chat,
                    user: req.user
                });
            }
        })
    })
})

module.exports = router;