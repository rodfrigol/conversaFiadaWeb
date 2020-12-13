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
            title: 'a',
            msgs: []
        }

        User_chat.find({ user_id: req.user._id }).then((user_chats) => {
            
            var chats_id = []
            user_chats.forEach((user_chat) => {
                chats_id.push(user_chat['chat_id'])
            })
            
            Chat.find({$or : [{ _id: {$in: chats_id }}, { pvt1:req.user.email }, { pvt2:req.user.email }]}).then((chat) => {
                if (chat.length == 0){
                    res.render("dashboard", {
                        user: req.user,
                        messages: [],
                        chat: []
                    });
                }else{
                    var pvts = {
                        email: [],
                        nome: [],
                        icon: []
                    }

                    chat.forEach(c => {
                        if (c.is_pvt){
                            if(req.user.email == c.pvt1)
                                pvts.email.push(c.pvt2)
                            else
                                pvts.email.push(c.pvt1)
                        }
                    })

                    User.find({email: {$in : pvts.email}}).then(user => {
                        
                        chat.forEach((c, i) => {
                            if (c.is_pvt){
                                var email;
                                if(req.user.email == c.pvt1)
                                    email = c.pvt2
                                else
                                    email = c.pvt1
                                user.forEach((u) => {
                                    if (u.email == email){
                                        chat[i]['name'] = u.name
                                        chat[i].icon = u.icon
                                    }
                                })
                            }
                        })
                        Messages.find({ chat_id: chat[0]._id }).sort({date: "asc"}).then((messages) => {
        
                            res.render("dashboard", {
                                global_chat: JSON.stringify(global_chat),
                                user: req.user,
                                messages: messages,
                                chat: chat
                            });
        
                        })

                    })
                }

            })

        })
});

module.exports = router;