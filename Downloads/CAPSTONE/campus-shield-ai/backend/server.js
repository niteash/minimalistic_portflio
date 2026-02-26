const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// make io accessible everywhere
global.io = io;

io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
