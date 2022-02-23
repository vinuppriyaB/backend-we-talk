const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const authorizedUser = async (req, res, next) => {
  let token = req.headers.token;
  console.log(token);
  if (!token) {
    res.status(401).send({ msg: "user is not authorized" });
  }
  try {
    let decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decode);
    req.user = await User.findOne({ email: decode.email }).select("-password");
    next();
  } catch (e) {
    res.send(e);
  }
};

module.exports = { authorizedUser };
