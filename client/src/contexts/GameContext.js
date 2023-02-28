import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { rotations } from "../data/data";

const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState({
    code: "",
    player: { planes: [], ready: false, playAgain: false },
    opponent: { planes: [], ready: false, playAgain: false, connected: false },
    started: false,
    finished: false,
    turn: 0,
    now: 0,
    winner: 0,
    history: [],
    message: {
      error: false,
      content: "",
    },
  });

  useEffect(() => {
    console.log("HELLO TEST!");
    console.log("RAILWAY_STATIC_URL", process.env.RAILWAY_STATIC_URL);

    console.log(process.env);

    const s = io(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : process.env.RAILWAY_STATIC_URL || "https://aviuane.onrender.com"
    );
    setSocket(s);
    setLoading(false);

    return () => {
      console.log("goodbye in useEffect cleanup");
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("CONNECTED", data => {
      console.log("This is what I got from server", data);
      console.log("\n");

      const temp = { ...game };
      temp.code = data.mainRoom;
      temp.player.planes = data.planes;
      temp.turn = data.turn;

      setGame(temp);
    });

    socket.on("ROOM_NOT_FOUND", () => {
      alert("ROOM NOT FOUND!!!");
    });

    socket.on("CAPACITY_FULL", () => {
      alert("CAPACITY FULL!!");
    });

    socket.on("USER_IN_GAME", () => {
      alert("USER IN GAME!");
    });

    socket.on("USER_JOINED", () => {
      setGame(curr => ({
        ...curr,
        opponent: { ...curr.opponent, connected: true },
        message: { error: false, content: "" },
      }));
    });

    socket.on("USER_TOGGLE_READY", ({ id, ready }) => {
      if (id === socket.id) {
        setGame(curr => ({ ...curr, player: { ...curr.player, ready } }));
      } else {
        setGame(curr => ({ ...curr, opponent: { ...curr.opponent, ready } }));
      }
    });

    socket.on("GAME_STARTED", ({ now }) => {
      setGame(curr => ({ ...curr, started: true, now }));
    });

    socket.on("ROUND_OVER", ({ now, history }) => {
      setGame(curr => ({ ...curr, now, history }));
    });

    socket.on("PLANES", ({ planes }) => {
      setGame(curr => ({ ...curr, player: { ...curr.player, planes } }));
    });

    socket.on("GAME_OVER", ({ winner, opponentPlanes }) => {
      setGame(curr => ({
        ...curr,
        finished: true,
        winner: winner,
        opponent: { ...curr.opponent, planes: opponentPlanes },
      }));
    });

    socket.on("USER_TOGGLE_PLAY_AGAIN", ({ id, playAgain }) => {
      if (id === socket.id) {
        setGame(curr => ({ ...curr, player: { ...curr.player, playAgain } }));
      } else {
        setGame(curr => ({ ...curr, opponent: { ...curr.opponent, playAgain } }));
      }
    });

    socket.on("PLAY_AGAIN", () => {
      setGame(curr => ({
        ...curr,
        started: false,
        finished: false,
        player: {
          ...curr.player,
          planes: [...curr.player.planes.map(x => ({ ...x, destroyed: false }))],
          ready: false,
          playAgain: false,
        },
        opponent: { ...curr.opponent, ready: false, playAgain: false, planes: [] },
        history: [],
      }));
    });

    socket.on("USER_DISCONNECTED", () => {
      setGame(curr => ({
        ...curr,
        player: { ...curr.player, ready: false },
        opponent: { ...curr.opponent, ready: false, connected: false },
        started: false,
        turn: 0,
        message: {
          error: true,
          content: "Opponent disconnected",
        },
      }));
    });
    // eslint-disable-next-line
  }, [socket]);

  const rotatePlane = plane => {
    if (game.player.ready) return;

    plane.posIndex = (plane.posIndex + 1) % 4;
    plane.pos = rotations[plane.posIndex];

    updatePieces(plane);

    game.player.planes.forEach(p => checkIfValid(p));

    setGame(curr => ({ ...curr }));
  };

  const checkIfValid = plane => {
    plane.valid = true;

    if (plane.pieces.some(x => x.row < 0 || x.row > 9 || x.col < 0 || x.col > 9)) plane.valid = false;

    const planes = game.player.planes.filter(x => x.id !== plane.id);

    planes.forEach(p => {
      const overlapping = plane.pieces.some(x => p.pieces.some(y => y.row === x.row && y.col === x.col));

      if (overlapping) {
        plane.valid = false;
        p.valid = false;
      }
    });
  };

  const updatePieces = plane => {
    if (plane.pos === "N") {
      plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
      plane.pieces[1] = { row: plane.head.row + 1, col: plane.head.col - 2 };
      plane.pieces[2] = { row: plane.head.row + 1, col: plane.head.col - 1 };
      plane.pieces[3] = { row: plane.head.row + 1, col: plane.head.col };
      plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col + 1 };
      plane.pieces[5] = { row: plane.head.row + 1, col: plane.head.col + 2 };
      plane.pieces[6] = { row: plane.head.row + 2, col: plane.head.col };
      plane.pieces[7] = { row: plane.head.row + 3, col: plane.head.col - 1 };
      plane.pieces[8] = { row: plane.head.row + 3, col: plane.head.col };
      plane.pieces[9] = { row: plane.head.row + 3, col: plane.head.col + 1 };
    } else if (plane.pos === "E") {
      plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
      plane.pieces[1] = { row: plane.head.row - 2, col: plane.head.col - 1 };
      plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col - 1 };
      plane.pieces[3] = { row: plane.head.row, col: plane.head.col - 1 };
      plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col - 1 };
      plane.pieces[5] = { row: plane.head.row + 2, col: plane.head.col - 1 };
      plane.pieces[6] = { row: plane.head.row, col: plane.head.col - 2 };
      plane.pieces[7] = { row: plane.head.row - 1, col: plane.head.col - 3 };
      plane.pieces[8] = { row: plane.head.row, col: plane.head.col - 3 };
      plane.pieces[9] = { row: plane.head.row + 1, col: plane.head.col - 3 };
    } else if (plane.pos === "S") {
      plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
      plane.pieces[1] = { row: plane.head.row - 1, col: plane.head.col - 2 };
      plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col - 1 };
      plane.pieces[3] = { row: plane.head.row - 1, col: plane.head.col };
      plane.pieces[4] = { row: plane.head.row - 1, col: plane.head.col + 1 };
      plane.pieces[5] = { row: plane.head.row - 1, col: plane.head.col + 2 };
      plane.pieces[6] = { row: plane.head.row - 2, col: plane.head.col };
      plane.pieces[7] = { row: plane.head.row - 3, col: plane.head.col - 1 };
      plane.pieces[8] = { row: plane.head.row - 3, col: plane.head.col };
      plane.pieces[9] = { row: plane.head.row - 3, col: plane.head.col + 1 };
    } else {
      plane.pieces[0] = { row: plane.head.row, col: plane.head.col };
      plane.pieces[1] = { row: plane.head.row - 2, col: plane.head.col + 1 };
      plane.pieces[2] = { row: plane.head.row - 1, col: plane.head.col + 1 };
      plane.pieces[3] = { row: plane.head.row, col: plane.head.col + 1 };
      plane.pieces[4] = { row: plane.head.row + 1, col: plane.head.col + 1 };
      plane.pieces[5] = { row: plane.head.row + 2, col: plane.head.col + 1 };
      plane.pieces[6] = { row: plane.head.row, col: plane.head.col + 2 };
      plane.pieces[7] = { row: plane.head.row - 1, col: plane.head.col + 3 };
      plane.pieces[8] = { row: plane.head.row, col: plane.head.col + 3 };
      plane.pieces[9] = { row: plane.head.row + 1, col: plane.head.col + 3 };
    }
  };

  const handleOnStop = (plane, ui) => {
    plane.head.row = ui.y / 32;
    plane.head.col = ui.x / 32;

    updatePieces(plane);

    game.player.planes.forEach(p => checkIfValid(p));

    setGame(curr => ({ ...curr }));
  };

  const handleJoin = inputCode => {
    if (inputCode.toUpperCase() === game.code) return;

    socket.emit("JOIN", { code: inputCode });
    setGame(curr => ({ ...curr, turn: 1 }));
  };

  function handleToggleReady() {
    if (!game.player.ready) {
      socket.emit("USER_TOGGLE_READY", { planes: game.player.planes });
    } else {
      socket.emit("USER_TOGGLE_READY");
    }
  }

  const handleCellClick = ({ row, col }) => {
    if (game.finished || !game.started) return;
    if (game.turn !== game.now) return;
    if (game.history?.find(x => x.turn === game.turn && x.row === row && x.col === col)) return;

    socket.emit("ROUND_OVER", { playerTurn: game.turn, row, col });
  };

  const handleTogglePlayAgain = () => {
    socket.emit("USER_TOGGLE_PLAY_AGAIN");
  };

  const value = {
    game,
    rotatePlane,
    handleOnStop,
    handleJoin,
    handleToggleReady,
    handleCellClick,
    handleTogglePlayAgain,
  };

  return <GameContext.Provider value={value}>{!loading && children}</GameContext.Provider>;
}
