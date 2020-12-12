const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Messages = require("../models/Messages");
const Chat = require("../models/Chat");
const User_chat = require("../models/User_chat");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {

        User_chat.find({ user_id: req.user._id }).then((user_chats) => {
            
            var chats_id = []
            user_chats.forEach((user_chat) => {
                chats_id.push(user_chat['chat_id'])
            })
            
            Chat.find({ _id: {$in: chats_id}}).then((chat) => {

                if (chat.length == 0){
                    res.render("dashboard", {
                        user: req.user,
                        messages: [],
                        chat: [{name:''}]
                    });
                }else{
                    Messages.find({ chat_id: chat[0]._id }).sort({date: "asc"}).then((messages) => {
        
                        res.render("dashboard", {
                            user: req.user,
                            messages: messages,
                            chat: chat
                        });
    
                    })
                }

            })

        })
});

module.exports = router;