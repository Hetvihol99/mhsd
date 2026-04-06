const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
app.get("/", (req, res) => {
  res.send("Server working ✅");
});

// 🔗 MongoDB connect
mongoose.connect("mongodb+srv://hetvihol99:het12345@hwtuuuu.s08sktz.mongodb.net/chatapp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Models
const User = require("./models/User");
const Message = require("./models/Message");

// ================= USERS =================

// create/login user
app.post("/login", async (req, res) => {
  const { username } = req.body;

  let user = await User.findOne({ username });
  if (!user) {
    user = await User.create({
      username,
      xp: 0,
      level: 1
    });
  }

  res.json(user);
});

// update XP
app.post("/xp", async (req, res) => {
  const { userId, xp } = req.body;

  let user = await User.findById(userId);
  user.xp += xp;

  // level logic
  if (user.xp >= user.level * 200) {
    user.xp = 0;
    user.level += 1;
  }

  await user.save();
  res.json(user);
});

// ================= CHAT =================

// get messages
app.get("/messages/:channel", async (req, res) => {
  const msgs = await Message.find({ channel: req.params.channel });
  res.json(msgs);
});

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("sendMessage", async (data) => {
    const msg = await Message.create(data);

    io.emit("newMessage", msg); // broadcast
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});