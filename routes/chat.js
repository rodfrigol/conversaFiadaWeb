const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const UserChat = require("../models/User_chat");
const User = require("../models/User");
const { response } = require("express");

router.post('/create', function(req, res){
    errors = []
    var nome = req.body.data
    Chat.find({name: nome}).then((chat) => {
        if (chat.length == 0){
            const newChat = new Chat({
                name: nome,
                is_pvt: 0,
                count: 1
            })
            newChat.save(function(err,room) {
                const newUserChat = new UserChat({
                    user_id: req.user._id,
                    chat_id: room.id
                })
                newUserChat.save()
            })
        }else{
            errors.push("This chat already exists")
        }
        return res.end(JSON.stringify(errors))
    })
})

router.post('/create_pvt', function(req, res){
    data = {
        errors : [],
        info: {}
    }
    data.errors = []
    var pvt1 = req.user.email
    var pvt2 = req.body.data
    if (pvt1 === pvt2){
        data.errors.push("Can't talk to yourself")
        return res.end(JSON.stringify(data))
    }
    User.find({email: pvt2}).then((user) => {
        if (user.length === 0){
            data.errors.push("User not found")
            return res.end(JSON.stringify(data))
        }
        Chat.find({ $or:[ {pvt1:pvt1, pvt2:pvt2}, {pvt1:pvt2, pvt2:pvt1} ] }).then((chat) => {
            if (chat.length === 0){
                const newChat = new Chat({
                    is_pvt: 1,
                    pvt1: pvt1,
                    pvt2: pvt2
                })
                newChat.save(function(err,room) {
                    data.info = {
                        chat_id : room.id,
                        icon : user[0].icon,
                        name : user[0].name,
                        new : true
                    }
                    return res.end(JSON.stringify(data))
                })
            }else{
                data.info = {
                    chat_id : chat[0]._id,
                    icon : user[0].icon,
                    name: user[0].name,
                    new : false
                }
                return res.end(JSON.stringify(data))
            }
        })
    })
})

router.post('/search', (req, res) => {
    Chat.find({name: {$regex: req.body.data, $options: 'i'}})
    .sort({count: "desc"}).then((chats) => {
        res.end(JSON.stringify(chats))
    })
})


router.post('/enter', (req, res) => {
    errors = []
    UserChat.find({user_id: req.user._id, chat_id: req.body.data}).then((uc) => {
        if (uc.length > 0){
            errors.push("User is already on this chat")
            return res.end(JSON.stringify(errors))
        }else{
            Chat.findById(req.body.data, (err, chat) => {
                if (chat.length === 0){
                    errors.push("This chat does not exist")
                    return res.end(JSON.stringify(errors))
                }else{
                    chat.count += 1
                    chat.save()
                    newUC = new UserChat({
                        user_id: req.user._id,
                        chat_id: req.body.data
                    })
                    newUC.save()
                    return res.end(JSON.stringify(errors))
                }
            })
        }
    })
})

module.exports = router;