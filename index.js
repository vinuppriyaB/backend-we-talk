const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./connection.js");
const UserRouter = require("./routes/userRoute.js");
const ChatRouter = require("./routes/chatRoute.js");
var { authorizedUser } = require("./middleware/Authorrization.js");
const app = express();

app.use(express.json());
dotenv.config();
connectDB();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("welcome");
});

app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);

app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});
