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

  socket.join(code);

  const roomObj = {
    code,
    players: [{ id: socket.id, mainRoom: code, planes: defaultPlanes, ready: false, playAgain: false }],
    started: false,
    finished: false,
    history: [],
    turn: null,
    winner: null,
    joinable: true,
    centurion: true,
  };

  rooms.set(code, roomObj);

  socket.emit("CONNECTED", roomObj);

  socket.on("JOIN", ({ code, planes }) => {
    code = code.toUpperCase();

    if (!rooms.get(code)) return socket.emit("CANNOT_JOIN", "Room not found!");
    if (rooms.get(code).players.length === 2) return socket.emit("CANNOT_JOIN", "Capacity full!");
    if (rooms.get(code).joinable === false) return socket.emit("CANNOT_JOIN", "User in game!");
    if (io.sockets.adapter.rooms.get(code).has(socket.id)) return;

    const myRoomCode = Array.from(socket.rooms.values())[1];
    const myRoom = rooms.get(myRoomCode);
    const joinedRoom = rooms.get(code);

    joinedRoom.joinable = false;
    myRoom.joinable = false;

    const roomToJoin = rooms.get(code);
    roomToJoin.players.push({ ...myRoom.players[0], planes });

    socket.join(code);

    io.to(code).emit("STATE_CHANGED", roomToJoin);
    io.to(socket.id).emit("SET_MY_TURN", 1);

    return;
  });

  socket.on("USER_TOGGLE_READY", data => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const code = joinedRoomCode || myRoomCode;
    const room = rooms.get(code);
    const player = room.players.find(x => x.id === socket.id);

    player.ready = !player.ready;
    player.planes = data.planes;

    io.to(code).emit("STATE_CHANGED", room);

    if (room.players.every(x => x.ready)) {
      room.players[0].ready = false;
      room.players[1].ready = false;
      room.started = true;
      room.turn = room.turn === null ? Math.round(Math.random()) : (room.turn + 1) % 2;
      io.to(code).emit("STATE_CHANGED", room);
    }
  });

  socket.on("USER_TOGGLE_PLAY_AGAIN", () => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const code = joinedRoomCode || myRoomCode;
    const room = rooms.get(code);
    const player = room.players.find(x => x.id === socket.id);

    player.playAgain = !player.playAgain;

    io.to(code).emit("STATE_CHANGED", room);

    if (room.players.every(x => x.playAgain)) {
      room.players[0].planes.forEach(p => (p.destroyed = false));
      room.players[1].planes.forEach(p => (p.destroyed = false));
      room.players[0].playAgain = false;
      room.players[1].playAgain = false;
      room.finished = false;
      room.winner = null;
      room.history = [];
      room.centurion = true;
      io.to(code).emit("STATE_CHANGED", room);
      io.to(code).emit("PLANES", { id: null, planes: [] });
      io.to(room.players[0].id).emit("PLANES", { id: room.players[0].id, planes: room.players[0].planes });
      io.to(room.players[1].id).emit("PLANES", { id: room.players[1].id, planes: room.players[1].planes });
    }
  });

  socket.on("ROUND_OVER", ({ playerTurn, cell }) => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const row = Math.floor(cell / 10);
    const col = cell % 10;
    const code = joinedRoomCode || myRoomCode;
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
      id: room.players[(playerTurn + 1) % 2].id,
      planes: room.players[(playerTurn + 1) % 2].planes,
    });

    room.turn = (room.turn + 1) % 2;
    room.history.push({ turn: playerTurn, cell, status: head ? "head-hit" : hit ? "hit" : "miss" });

    const idx = room.players.findIndex(x => x.planes.every(x => x.destroyed));

    if (room.players[0].planes.every(x => x.destroyed) && room.players[1].planes.every(x => x.destroyed)) {
      room.started = false;
      room.finished = true;
      room.winner = 2;

      io.to(room.players[0].id).emit("PLANES", {
        id: room.players[1].id,
        planes: room.players[1].planes,
      });
      io.to(room.players[1].id).emit("PLANES", {
        id: room.players[0].id,
        planes: room.players[0].planes,
      });

      io.to(code).emit("STATE_CHANGED", room);
      return;
    }

    if (idx !== -1 && room.centurion && idx !== room.history[0].turn) {
      if (room.players[(idx + 1) % 2].planes.filter(x => x.destroyed).length === 2) {
        room.centurion = false;
        io.to(code).emit("STATE_CHANGED", room);
        return;
      }
    }

    if (idx !== -1) {
      room.started = false;
      room.finished = true;
      room.winner = (idx + 1) % 2;

      io.to(room.players[room.winner].id).emit("PLANES", {
        id: room.players[(room.winner + 1) % 2].id,
        planes: room.players[(room.winner + 1) % 2].planes,
      });
      io.to(room.players[(room.winner + 1) % 2].id).emit("PLANES", {
        id: room.players[room.winner].id,
        planes: room.players[room.winner].planes,
      });
    }

    io.to(code).emit("STATE_CHANGED", room);
  });

  socket.on("LEAVE", () => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const myRoom = rooms.get(myRoomCode);
    const joinedRoom = rooms.get(joinedRoomCode);

    if (joinedRoom) {
      joinedRoom.players.pop();
      joinedRoom.started = false;
      joinedRoom.turn = null;
      joinedRoom.winner = null;

      myRoom.joinable = true;

      socket.leave(joinedRoomCode);

      io.to(socket.id).emit("SET_MY_TURN", 0);
      io.to(joinedRoomCode).emit("STATE_CHANGED", joinedRoom);
      io.to(socket.id).emit("STATE_CHANGED", myRoom);
    } else {
      if (myRoom.players.length === 1) {
        myRoom.finished = false;
        myRoom.history = [];
        myRoom.joinable = true;
        myRoom.players[0].ready = false;
        myRoom.players[0].playAgain = false;
        myRoom.started = false;
        myRoom.turn = null;
        myRoom.winner = null;

        io.to(socket.id).emit("STATE_CHANGED", myRoom);
        return;
      }

      myRoom.joinable = true;
      const opponentMainRoom = rooms.get(myRoom.players[1].mainRoom);

      io.of("/")
        .in(myRoom.players[1].id)
        .fetchSockets()
        .then(data => {
          const s = data.find(s => s.id.toString() === myRoom.players[1].id);
          s.leave(myRoomCode);

          myRoom.players.pop();

          io.to(opponentMainRoom.players[0].id).emit("SET_MY_TURN", 0);
          io.to(opponentMainRoom.players[0].id).emit("STATE_CHANGED", opponentMainRoom);
          io.to(socket.id).emit("STATE_CHANGED", myRoom);
        });
    }
  });

  socket.on("disconnecting", () => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const myRoom = rooms.get(myRoomCode);
    const joinedRoom = rooms.get(joinedRoomCode);

    if (joinedRoom) {
      joinedRoom.players.pop();

      io.to(socket.id).emit("SET_MY_TURN", 0);
      io.to(joinedRoomCode).emit("STATE_CHANGED", joinedRoom);
    } else if (myRoom.players.length === 2) {
      const opponentMainRoom = rooms.get(myRoom.players[1].mainRoom);

      io.of("/")
        .in(myRoom.players[1].id)
        .fetchSockets()
        .then(data => {
          const s = data.find(s => s.id.toString() === myRoom.players[1].id);
          s.leave(myRoomCode);

          io.to(myRoom.players[1].id).emit("SET_MY_TURN", 0);
          io.to(myRoom.players[1].id).emit("STATE_CHANGED", opponentMainRoom);
        });
    }

    socket.leave(joinedRoom || myRoom);
    rooms.delete(myRoomCode);
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
