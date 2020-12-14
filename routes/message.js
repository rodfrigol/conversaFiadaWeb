const express = require("express");
const router = express.Router();
const Messages = require("../models/Messages");
const Chat = require("../models/Chat");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const User_chat = require("../models/User_chat");

router.post("/send", ensureAuthenticated, (req, res) => {
    const msg = req.sanitize(req.body.message);
    const newMsg = new Messages({
        user_id: req.user._id,
        chat_id: req.body.chat_id,
        message: msg,
        name: req.user.name
    });
    newMsg.save(()=>{
        Chat.updateOne({ _id: req.body.chat_id}, {last_msg: newMsg._id}).then(()=>{
            var n = {
                user_id: newMsg.user_id,
                chat_id: newMsg.chat_id,
                message: newMsg.message,
                name: newMsg.name,
                date: newMsg.date,
                icon: req.user.icon
            }
            res.end(JSON.stringify(n))
        })
    })
});

router.get("/get", ensureAuthenticated, (req, res) => {
    var chat_id = req.url.substring(req.url.indexOf('=') + 1)

    Chat.findById(chat_id).then(chat => {
        //chat nao existe
        if (!chat) return res.end()
        //chat privado
        if (chat.is_pvt){
            //se o chat é privado, deve conter o email de quem faz a requisição
            if (!(chat.pvt1 === req.user.email || chat.pvt2 === req.user.email)) 
                return res.end()
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
        }else{
            //se o chat nao é privado, temos que verificar a tabela user_chat
            User_chat.findOne({user_id: req.user._id, chat_id: chat_id}).then(uc => {
                if (!uc) return res.end()
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
        }

    })
})

module.exports = router;