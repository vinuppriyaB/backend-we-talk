const express = require("express");
const Chat = require("../model/chatModel.js");
const User = require("../model/userModel.js");
const router = express.Router();
var { authorizedUser } = require("../middleware/Authorrization.js");

router.post("/", authorizedUser, async (req, res) => {
  const { userId } = req.body;

  if (!userId) res.status(400).send({ msg: "userId not received" });

  let isChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.user._id } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "userName email pic",
  });

  console.log(isChat);
  if (isChat) {
    res.send(isChat);
  } else {
    try {
      let newChat = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      let chatcreated = await Chat.create(newChat);

      let fullChat = await Chat.findOne({ _id: chatcreated._id }).populate(
        "users",
        "-password"
      );
      res.send(fullChat);
    } catch (e) {
      console.log(e);
    }
  }

  // res.send("hai");
});

router.get("/", authorizedUser, async (req, res) => {
  try {
    let isChat = await Chat.findOne({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "userName email pic",
        });
        res.send(result);
      });
  } catch (e) {
    console.log(e);
  }
  // res.send("hai");
});

router.post("/creategroup", authorizedUser, async (req, res) => {
  try {
    let users = JSON.parse(req.body.users);
    users.push(req.user._id);
    let newChat = {
      chatName: "test group",
      isGroupChat: true,
      groupAdmin: req.user._id,
      users: users,
    };
    let chatcreated = await Chat.create(newChat);

    let fullChat = await Chat.findOne({ _id: chatcreated._id }).populate(
      "users",
      "-password"
    );
    res.send(fullChat);
  } catch (e) {
    console.log(e);
  }
});
router.put("/renamegroup", authorizedUser, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      { _id: req.body.chatId },
      {
        chatName: req.body.chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(updatedChat);
  } catch (e) {
    console.log(e);
  }
});
router.put("/addtogroup", authorizedUser, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      { _id: req.body.chatId },
      {
        $push: { users: req.body.userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(updatedChat);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.put("/deletefromgroup", authorizedUser, async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      { _id: req.body.chatId },
      {
        $pull: { users: req.body.userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(updatedChat);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
