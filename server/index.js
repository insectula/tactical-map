const express = require("express");
const socket = require("socket.io");
const cors=require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

//app.use(cors());// Use this after the variable declaration

app.use('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});


const server = app.listen(2000, function () {
  console.log("listening on port 2000");
});

const io = socket(server, {
  cors: {
      origin: '*',
      methods: ["*"]
  }
})

let DATA = {};

io.on("connection", async (socket) => {
    console.log('connected');
    
    socket.on("fetch", user => {
      console.log('fetch request recieved from', user);
      socket.emit("change", DATA);
    });

    socket.on("reset", user => {
      console.log('RESET reauest from', user);
      DATA = {};
      socket.broadcast.emit("reset", DATA);
    });

    socket.on("change", markers => {
      console.log('data recieved');
      const data = {...DATA, ...markers};
      console.log('merging ', DATA, 'and', markers);
      DATA = data;
      socket.broadcast.emit("change", DATA);
      console.log('data sent');
      });

});