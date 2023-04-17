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

// function wait(time = 1000) {
//   return new Promise(res => {
//     setTimeout(() => {
//       res();
//     }, time);
//   });
// }

// trigger

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
    players: [
      {
        id: socket.id,
        mainRoom: code,
        planes: defaultPlanes.slice(0, 3),
        ready: false,
        playAgain: false,
        disconnected: false,
      },
    ],
    started: false,
    finished: false,
    history: [],
    turn: null,
    winner: null,
    joinable: true,
    centurion: true,
    gridSize: 10,
    numOfPlanes: 3,
  };

  rooms.set(code, roomObj);

  socket.emit("CONNECTED", roomObj);

  socket.on("JOIN", ({ code, planes }) => {
    code = code.toUpperCase();

    if (!rooms.get(code)) return socket.emit("CANNOT_JOIN", "Room not found!");
    if (rooms.get(code).players.length > 1) return socket.emit("CANNOT_JOIN", "Capacity full!");
    if (rooms.get(code).joinable === false) return socket.emit("CANNOT_JOIN", "User in game!");
    if (io.sockets.adapter.rooms.get(code).has(socket.id)) return;

    const myRoomCode = Array.from(socket.rooms.values())[1];
    const myRoom = rooms.get(myRoomCode);
    const joinedRoom = rooms.get(code);

    myRoom.joinable = false;
    joinedRoom.joinable = false;
    joinedRoom.players.push({ ...myRoom.players[0], planes });

    // const roomToJoin = rooms.get(code);
    // roomToJoin.players.push({ ...myRoom.players[0], planes });

    socket.join(code);

    io.to(code).emit("STATE_CHANGED", joinedRoom);
    io.to(socket.id).emit("SET_MY_TURN", 1);
    io.to(socket.id).emit("PLANES", { id: socket.id, planes: defaultPlanes.slice(0, joinedRoom.numOfPlanes) });

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

  socket.on("SETTINGS_CHANGED", ({ gridSize = 10, numOfPlanes = 3 }) => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const code = joinedRoomCode || myRoomCode;
    const room = rooms.get(code);

    if (room.numOfPlanes !== numOfPlanes) {
      room.players[0].planes = defaultPlanes.slice(0, numOfPlanes);
    }

    room.gridSize = gridSize;
    room.numOfPlanes = numOfPlanes;

    io.to(code).emit("STATE_CHANGED", room);
    io.to(room.players[0].id).emit("PLANES", { id: room.players[0].id, planes: room.players[0].planes });
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

  socket.on("ROUND_OVER", async ({ playerTurn, cell }) => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const code = joinedRoomCode || myRoomCode;
    const room = rooms.get(code);

    const row = Math.floor(cell / room.gridSize);
    const col = cell % room.gridSize;

    if (room.history.length > 0 && playerTurn === room.history[room.history.length - 1].turn) return;

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
      myRoom.joinable = true;

      socket.leave(joinedRoomCode);
      socket.emit("STATE_CHANGED", myRoom);
      socket.emit("PLANES", { id: socket.id, planes: myRoom.players[0].planes });

      if (joinedRoom.players.length === 2) {
        joinedRoom.players[1].disconnected = true;
        io.to(joinedRoom.players[0].id).emit("STATE_CHANGED", joinedRoom);
      }

      joinedRoom.players.pop();
    } else {
      if (myRoom.players.length === 2) {
        const s = io.sockets.sockets.get(myRoom.players[1].id);

        s.leave(myRoomCode);

        myRoom.players[0].disconnected = true;
        io.to(myRoom.players[1].id).emit("STATE_CHANGED", myRoom);

        myRoom.players.pop();
      }

      myRoom.players[0].disconnected = false;
      myRoom.players[0].ready = false;
      myRoom.players[0].playAgain = false;
      myRoom.started = false;
      myRoom.finished = false;
      myRoom.history = [];
      myRoom.turn = null;
      myRoom.winner = null;
      myRoom.joinable = true;
      myRoom.centurion = true;

      socket.emit("STATE_CHANGED", myRoom);
    }

    if (myRoom?.players.length === 0) {
      rooms.delete(myRoomCode);
    }

    if (joinedRoom?.players.length === 0) {
      rooms.delete(joinedRoomCode);
    }
  });

  socket.on("disconnecting", () => {
    const [_, myRoomCode, joinedRoomCode] = Array.from(socket.rooms.values());

    const myRoom = rooms.get(myRoomCode);
    const joinedRoom = rooms.get(joinedRoomCode);

    if (joinedRoom) {
      if (joinedRoom.players.length === 2) {
        joinedRoom.players[1].disconnected = true;
        io.to(joinedRoom.players[0].id).emit("STATE_CHANGED", joinedRoom);
      }

      joinedRoom.players.pop();
    } else {
      if (myRoom.players.length === 2) {
        myRoom.players[0].disconnected = true;
        io.to(myRoom.players[1].id).emit("STATE_CHANGED", myRoom);
      }

      myRoom.players.pop();
    }

    if (myRoom?.players.length === 0) {
      rooms.delete(myRoomCode);
    }

    if (joinedRoom?.players.length === 0) {
      rooms.delete(joinedRoomCode);
    }

    socket.leave(joinedRoomCode || myRoomCode);
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
