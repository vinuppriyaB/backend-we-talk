const express = require("express");
const User = require("../model/userModel.js");
const router = express.Router();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var { authorizedUser } = require("../middleware/Authorrization.js");

router.post("/register", async (req, res) => {
  const isuserExist = await User.findOne({ email: req.body.email });

  if (isuserExist) return res.status(400).json("account already exist");

  try {
    const salt = await bcrypt.genSalt(9);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    });
    const savedUser = await newUser.save();

    var token = await jwt.sign(
      { email: req.body.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "3d",
      }
    );

    let { password, ...others } = savedUser._doc;
    res.status(200).send({ ...others, token });
  } catch (e) {
    res.status(500).json(e);
  }
});

router.post("/login", async (req, res) => {
  const isuserExist = await User.findOne({ email: req.body.email });

  if (!isuserExist) return res.status(400).send({ msg: "invalid credential" });

  try {
    let user = await bcrypt.compare(req.body.password, isuserExist.password);

    var token = await jwt.sign(
      { email: req.body.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "3d",
      }
    );

    let { password, ...others } = isuserExist._doc;
    res.status(200).send({ ...others, token });
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/getuser", authorizedUser, async (req, res) => {
  // console.log(req.query);
  const keyword = req.query.search
    ? {
        $or: [
          { userName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  // console.log(req.user);
  try {
    const user = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(user);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
