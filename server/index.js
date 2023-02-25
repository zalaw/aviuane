import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", socket => {
  const code = generateCode();

  socket.join(code);

  rooms.set(code, {
    players: [{ id: socket.id, mainRoom: code, ready: false, planes: null }],
    joinable: true,
    history: [],
  });
  console.log(rooms);

  socket.emit("CONNECTED", { code });

  socket.on("JOIN", ({ code }) => {
    console.log("------------------------JOIN------------------------\n");

    console.log("IN DEV");

    if (!rooms.get(code)) return socket.emit("ROOM_NOT_FOUND");
    if (rooms.get(code).players.length === 2) return socket.emit("CAPACITY_FULL");
    if (rooms.get(code).joinable === false) return socket.emit("USER_IN_GAME");
    if (io.sockets.adapter.rooms.get(code).has(socket.id)) return;

    const myRoom = Array.from(socket.rooms.values())[1];
    const myRoomData = rooms.get(myRoom);

    console.log("my room is", myRoom);
    console.log("my room data is", myRoomData);

    socket.join(code);

    const x = rooms.get(code);
    x.players.push({
      id: socket.id,
      mainRoom: Array.from(socket.rooms.values())[1],
      ready: false,
      planes: null,
      history: [],
    });

    rooms.set(code, x);
    rooms.set(myRoom, { ...myRoomData, joinable: false });

    console.log("rooms", rooms);

    io.to(code).emit("USER_JOINED");
  });

  socket.on("USER_TOGGLE_READY", data => {
    console.log("------------------------USER_TOGGLE_READY------------------------\n");

    const joinedRooms = Array.from(socket.rooms.values());

    const code = joinedRooms[2] || joinedRooms[1];
    const room = rooms.get(code);
    const player = room.players.find(x => x.id === socket.id);

    player.ready = !player.ready;

    if (data) {
      console.log("trebuie sa stochez");
      player.planes = data.planes;
    } else {
      console.log("trebuie sa sterg");
      player.planes = null;
    }

    console.log("room aici");
    console.log(rooms.get(code));

    io.to(code).emit("USER_TOGGLE_READY", { id: socket.id });

    if (room.players.every(x => x.ready)) {
      console.log("YOOO TOATA LUMEA E GATA!!!");
      return io.to(code).emit("GAME_STARTED", { turn: Math.round(Math.random()) });
    }

    console.log("\n-----------------------USER_TOGGLE_READY done-------------------------\n\n");
  });

  socket.on("ROUND_OVER", ({ playerTurn, row, col }) => {
    console.log("------------------------ROUND_OVER------------------------\n");

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
          piece.hit = true;
        }

        if (p.head.row === row && p.head.col === col) {
          p.destroyed = true;
          head = true;
        }
      }
    });

    io.to(room.players[(playerTurn + 1) % 2].id).emit("JUST_FOR_YOU", {
      planes: room.players[(playerTurn + 1) % 2].planes,
    });

    room.history.push({ turn: playerTurn, row, col, status: head ? "head-hit" : hit ? "hit" : "miss" });

    io.to(code).emit("ROUND_OVER", {
      nowTurn: (playerTurn + 1) % 2,
      history: room.history,
    });
    console.log("\n-----------------------ROUND_OVER done-------------------------\n\n");
  });

  socket.on("disconnecting", () => {
    console.log("------------------------disconnecting------------------------\n");

    const [_, myRoom, joinedRoom] = Array.from(socket.rooms.values());

    console.log("myRoom", myRoom);
    console.log("joinedRoom", joinedRoom);

    if (joinedRoom) {
      const data = rooms.get(joinedRoom);
      data.players = data.players.filter(x => x.id !== socket.id);

      console.log("now data is", data);

      rooms.set(joinedRoom, data);
    } else if (rooms.get(myRoom).players.length === 2) {
      const p = rooms.get(myRoom).players[1].mainRoom;
      const x = rooms.get(p);
      rooms.set(p, { ...x, joinable: true });
    }

    rooms.delete(myRoom);

    console.log("\n-----------------------disconnecting done-------------------------\n\n");
  });
});

const generateCode = () => {
  const id = crypto.randomUUID().slice(0, 4).toUpperCase();

  if (id in rooms) generateCode();

  return id;
};

app.use(express.static("./server/public/build"));

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
