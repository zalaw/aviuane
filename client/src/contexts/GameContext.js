import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { rotations, defaultPlanes } from "../data/data";

const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [player, setPlayer] = useState({ ready: false, planes: defaultPlanes });
  const [opponent, setOpponent] = useState(null);
  const [code, setCode] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [now, setNow] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    const _socket = io(
      process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://aviuane.onrender.com"
    );

    // const _socket = io("http://localhost:3001");

    console.log(process.env.NODE_ENV);

    _socket.on("connect", () => {
      setSocket(_socket);

      _socket.on("CONNECTED", ({ code }) => {
        setCode(code);
      });

      _socket.on("ROOM_NOT_FOUND", () => {
        alert("Room not found!");
      });

      _socket.on("CAPACITY_FULL", () => {
        alert("Capacity is full!");
      });

      _socket.on("USER_IN_GAME", () => {
        alert("Player is already in another game!");
      });

      _socket.on("USER_JOINED", () => {
        setOpponent({ ready: false });
      });

      _socket.on("USER_TOGGLE_READY", ({ id }) => {
        if (id === _socket.id) {
          setPlayer(curr => ({ ...curr, ready: !curr.ready }));
        } else {
          setOpponent(curr => ({ ...curr, ready: !curr.ready }));
        }
      });

      _socket.on("GAME_STARTED", ({ turn }) => {
        setGameStarted(true);
        setNow(turn);
      });

      _socket.on("ROUND_OVER", ({ nowTurn, history }) => {
        console.log("round over");

        setHistory(history);

        // if (nowTurn === turn) {
        //   console.log("aici");

        //   player.planes.forEach(p => {
        //     const lastHistory = history[history.length - 1];

        //     if (lastHistory)
        //   })
        // }

        setNow(nowTurn);
      });

      _socket.on("JUST_FOR_YOU", ({ planes }) => {
        console.log("oh baby");
        setPlayer(curr => {
          return {
            ...curr,
            planes: planes,
          };
        });
      });

      _socket.on("USER_LEFT", () => {
        alert("Opponent disconnected");
        setOpponent(null);
        setGameStarted(false);
      });

      setLoading(false);
    });
    //   planes: [
    //     {
    //       id: 1,
    //       head: { row: 0, col: 2 },
    //       pieces: [
    //         { row: 0, col: 2 },
    //         { row: 1, col: 0 },
    //         { row: 1, col: 1 },
    //         { row: 1, col: 2 },
    //         { row: 1, col: 3 },
    //         { row: 1, col: 4 },
    //         { row: 2, col: 2 },
    //         { row: 3, col: 1 },
    //         { row: 3, col: 2 },
    //         { row: 3, col: 3 },
    //       ],
    //       posIndex: 0,
    //       pos: "N",
    //       valid: true,
    //       destroyed: false,
    //     },
    //     {
    //       id: 2,
    //       head: { row: 0, col: 7 },
    //       pieces: [
    //         { row: 0, col: 7 },
    //         { row: 1, col: 5 },
    //         { row: 1, col: 6 },
    //         { row: 1, col: 7 },
    //         { row: 1, col: 8 },
    //         { row: 1, col: 9 },
    //         { row: 2, col: 7 },
    //         { row: 3, col: 6 },
    //         { row: 3, col: 7 },
    //         { row: 3, col: 8 },
    //       ],
    //       posIndex: 0,
    //       pos: "N",
    //       valid: true,
    //       destroyed: false,
    //     },
    //     {
    //       id: 3,
    //       head: { row: 6, col: 2 },
    //       pieces: [
    //         { row: 6, col: 2 },
    //         { row: 7, col: 0 },
    //         { row: 7, col: 1 },
    //         { row: 7, col: 2 },
    //         { row: 7, col: 3 },
    //         { row: 7, col: 4 },
    //         { row: 8, col: 2 },
    //         { row: 9, col: 1 },
    //         { row: 9, col: 2 },
    //         { row: 9, col: 3 },
    //       ],
    //       posIndex: 0,
    //       pos: "N",
    //       valid: true,
    //       destroyed: false,
    //     },
    //   ],
    // });

    return () => {
      _socket.disconnect();
      setOpponent(null);
      setGameStarted(false);
    };
  }, []);

  function rotatePlane(plane) {
    if (player.ready) return;

    plane.posIndex = (plane.posIndex + 1) % 4;
    plane.pos = rotations[plane.posIndex];

    updatePieces(plane);

    checkIfValid(player.planes[0]);
    checkIfValid(player.planes[1]);
    checkIfValid(player.planes[2]);

    setPlayer(curr => {
      return {
        ...curr,
        planes: player.planes,
      };
    });
  }

  function checkIfValid(plane) {
    plane.valid = true;

    if (plane.pieces.some(x => x.row < 0 || x.row > 9 || x.col < 0 || x.col > 9)) plane.valid = false;

    const planes = player.planes.filter(x => x.id !== plane.id);

    planes.forEach(x => {
      const overlapping = plane.pieces.some(y => x.pieces.some(z => z.row === y.row && z.col === y.col));

      if (overlapping) {
        plane.valid = false;
        x.valid = false;
      }
    });
  }

  function updatePieces(plane) {
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
  }

  function handleOnStop(plane, ui) {
    plane.head.row = ui.y / 32;
    plane.head.col = ui.x / 32;

    updatePieces(plane);

    checkIfValid(player.planes[0]);
    checkIfValid(player.planes[1]);
    checkIfValid(player.planes[2]);

    setPlayer(cur => {
      return {
        ...cur,
        planes: player.planes,
      };
    });
  }

  function joinRoom(inputCode) {
    console.log("todo");

    // if (code === inputCode.toUpperCase()) return;

    setTurn(1);

    socket.emit("JOIN", { code: inputCode });
  }

  function handleToggleReady() {
    console.log(player.ready);

    if (!player.ready) {
      socket.emit("USER_TOGGLE_READY", { planes: player.planes });
    } else {
      socket.emit("USER_TOGGLE_READY");
    }

    // setPlayer(prev => {
    //   return {
    //     ...prev,
    //     ready: !prev.ready,
    //   };
    // });
  }

  function handleCellClick({ row, col }) {
    if (turn !== now) return;
    if (history?.find(x => x.turn === turn && x.row === row && x.col === col)) return;

    socket.emit("ROUND_OVER", { playerTurn: turn, row, col });
  }

  const value = {
    player,
    opponent,
    code,
    rotatePlane,
    handleOnStop,
    joinRoom,
    handleToggleReady,
    socket,
    gameStarted,
    turn,
    now,
    handleCellClick,
    history,
  };

  return <GameContext.Provider value={value}>{!loading && children}</GameContext.Provider>;
}
