const express = require("express");
const User = require("../model/userModel.js");
const Message = require("../model/messageModel.js");
const Chat = require("../model/chatModel.js");
const router = express.Router();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var { authorizedUser } = require("../middleware/Authorrization.js");

router.post("/createMessage", authorizedUser, async (req, res) => {
  const { content, chatId } = req.body;
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "userName pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "namee pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    // console.log(message);
    res.send(message);
  } catch (e) {
    console.log(e);
  }
  //   res.send("hai");
});

router.get("/getallmessage/:chatId", async (req, res) => {
  try {
    let message = await Message.find({ chat: req.params.chatId })
      .populate("sender", "userName pic email")
      .populate("chat");

    // console.log(message);
    res.send(message);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
