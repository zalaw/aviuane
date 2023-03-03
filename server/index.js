const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const { defaultPlanes } = require("./planesData");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    // origin: [
    //   "http://localhost:3000",
    //   "http://localhost:3001",
    //   "https://aviuane.onrender.com",
    //   "https://aviuane.up.railway.app/",
    // ],
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", socket => {
  const code = generateCode();
  const player = {
    id: socket.id,
    mainRoom: code,
    planes: defaultPlanes,
    ready: false,
    playAgain: false,
    turn: 0,
  };

  socket.join(code);

  rooms.set(code, {
    players: [player],
    joinable: true,
    history: [],
  });

  socket.emit("CONNECTED", player);

  socket.on("JOIN", ({ code }) => {
    code = code.toUpperCase();

    if (!rooms.get(code)) return socket.emit("ROOM_NOT_FOUND");
    if (rooms.get(code).players.length === 2) return socket.emit("CAPACITY_FULL");
    if (rooms.get(code).joinable === false) return socket.emit("USER_IN_GAME");
    if (io.sockets.adapter.rooms.get(code).has(socket.id)) return;

    const myRoom = Array.from(socket.rooms.values())[1];
    const myRoomData = rooms.get(myRoom);

    myRoomData.joinable = false;
    rooms.get(code).history = [];

    socket.join(code);

    const roomToJoin = rooms.get(code);
    roomToJoin.players.push({ ...myRoomData.players[0], turn: 1 });

    io.to(code).emit("USER_JOINED");
  });

  socket.on("USER_TOGGLE_READY", data => {
    const joinedRooms = Array.from(socket.rooms.values());

    const code = joinedRooms[2] || joinedRooms[1];
    const room = rooms.get(code);
    const player = room.players.find(x => x.id === socket.id);

    player.ready = !player.ready;
    player.planes = data?.planes || null;

    io.to(code).emit("USER_TOGGLE_READY", { id: socket.id, ready: player.ready });

    if (room.players.every(x => x.ready)) {
      io.to(code).emit("GAME_STARTED", { now: Math.round(Math.random()) });
    }
  });

  socket.on("USER_TOGGLE_PLAY_AGAIN", () => {
    const joinedRooms = Array.from(socket.rooms.values());

    const code = joinedRooms[2] || joinedRooms[1];
    const room = rooms.get(code);
    const player = room.players.find(x => x.id === socket.id);

    player.playAgain = !player.playAgain;

    io.to(code).emit("USER_TOGGLE_PLAY_AGAIN", { id: socket.id, playAgain: player.playAgain });

    if (room.players.every(x => x.playAgain)) {
      room.history = [];
      room.players[0].ready = false;
      room.players[0].playAgain = false;
      room.players[1].ready = false;
      room.players[1].playAgain = false;
      io.to(code).emit("PLAY_AGAIN");
    }
  });

  socket.on("ROUND_OVER", ({ playerTurn, row, col }) => {
    const [_, myRoom, joinedRoom] = Array.from(socket.rooms.values());

    const code = joinedRoom || myRoom;
    const room = rooms.get(code);

    let hit = false;
    let head = false;

    room.players[(playerTurn + 1) % 2].planes.forEach(p => {
      if (!p.destroyed) {
        const piece = p.pieces.find(x => x.row === row && x.col === col);

        if (piece) {
          hit = true;
        }

        if (p.head.row === row && p.head.col === col) {
          p.destroyed = true;
          head = true;
        }
      }
    });

    io.to(room.players[(playerTurn + 1) % 2].id).emit("PLANES", {
      planes: room.players[(playerTurn + 1) % 2].planes,
    });

    room.history.push({ turn: playerTurn, row, col, status: head ? "head-hit" : hit ? "hit" : "miss" });

    io.to(code).emit("ROUND_OVER", {
      now: (playerTurn + 1) % 2,
      history: room.history,
    });

    let allDestroyed = room.players[0].planes.every(x => x.destroyed);

    if (allDestroyed) {
      room.players[0].ready = false;
      room.players[1].ready = false;
      room.players[0].playAgain = false;
      room.players[1].playAgain = false;
      io.to(room.players[0].id).emit("GAME_OVER", {
        winner: 1,
        opponentPlanes: room.players[1].planes,
      });
      return io.to(room.players[1].id).emit("GAME_OVER", { winner: 1, opponentPlanes: room.players[0].planes });
    }

    allDestroyed = room.players[1].planes.every(x => x.destroyed);

    if (allDestroyed) {
      room.players[0].ready = false;
      room.players[1].ready = false;
      room.players[0].playAgain = false;
      room.players[1].playAgain = false;
      io.to(room.players[0].id).emit("GAME_OVER", {
        winner: 0,
        opponentPlanes: room.players[1].planes,
      });
      return io.to(room.players[1].id).emit("GAME_OVER", { winner: 0, opponentPlanes: room.players[0].planes });
    }
  });

  socket.on("LEAVE", () => {
    const [_, myRoom, joinedRoom] = Array.from(socket.rooms.values());

    const mr = rooms.get(myRoom);
    const jr = rooms.get(joinedRoom);

    if (jr) {
      jr.players.pop();
      mr.joinable = true;
      socket.leave(joinedRoom);
      io.to(joinedRoom).emit("USER_DISCONNECTED");
    } else {
      io.of("/")
        .in(mr.players[1].id)
        .fetchSockets()
        .then(data => {
          const s = data.find(s => s.id.toString() === mr.players[1].id);
          s.leave(myRoom);
          const opponentMainRoom = mr.players[1].mainRoom;
          const opponentRoom = rooms.get(opponentMainRoomCode);

          opponentRoom.joinable = true;
          opponentRoom.players[0].ready = false;
          opponentRoom.players[0].playAgain = false;
          opponentRoom.players[0].turn = 0;

          mr.players.pop();

          io.to(opponentMainRoom).emit("USER_DISCONNECTED");
        });
    }

    console.log("mr", mr);
    console.log("\n\njr", jr);
  });

  socket.on("disconnecting", () => {
    const [_, myRoom, joinedRoom] = Array.from(socket.rooms.values());

    if (joinedRoom) {
      const data = rooms.get(joinedRoom);
      data.players = data.players.filter(x => x.id !== socket.id);
      data.players[0].ready = false;

      io.to(data.players[0].id).emit("USER_DISCONNECTED");
    } else if (rooms.get(myRoom).players.length === 2) {
      const opponentMainRoomCode = rooms.get(myRoom).players[1].mainRoom;
      const opponentMainRoom = rooms.get(opponentMainRoomCode);
      opponentMainRoom.joinable = true;
      opponentMainRoom.players[0].ready = false;

      io.of("/")
        .in(opponentMainRoom.players[0].id)
        .fetchSockets()
        .then(data => {
          const s = data.find(s => s.id.toString() === opponentMainRoom.players[0].id);
          s.leave(myRoom);
          io.to(opponentMainRoom.players[0].id).emit("USER_DISCONNECTED");
        });
    }

    socket.leave(joinedRoom || myRoom);
    rooms.delete(myRoom);
  });
});

const generateCode = () => {
  const id = crypto.randomUUID().slice(0, 4).toUpperCase();

  if (id in rooms) generateCode();

  return id;
};

if (process.env.NODE_ENV === "production") {
  app.use(express.static("./server/public/build"));
}

app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

server.listen(PORT, () => {
  rooms.clear();

  console.log(`Server running at http://localhost:${PORT}`);
});
