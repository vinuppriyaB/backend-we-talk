const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./connection.js");
const UserRouter = require("./routes/userRoute.js");
const ChatRouter = require("./routes/chatRoute.js");
const MessageRouter = require("./routes/messageRoute.js");
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
app.use("/api/message", MessageRouter);

const server = app.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://zealous-morse-54b38e.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log("connection to the socket");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("userData" + userData);
    console.log(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) console.log("chat.user is not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
