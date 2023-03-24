import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Loader from "../components/Loader";
import { rotations, defaultPlanes } from "../data/data";

const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState(null);
  const [myTurn, setMyTurn] = useState(0);
  const [planeSelected, setPlaneSelected] = useState(null);
  const [myPlanes, setMyPlanes] = useState(defaultPlanes);
  const [opponentPlanes, setOpponentPlanes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const s = io(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : "https://aviuane.up.railway.app/" || "https://aviuane.onrender.com",
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      }
    );
    setSocket(s);

    return () => {
      console.log("goodbye in useEffect cleanup");
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("CONNECTED", data => {
      setGame(data);
      setLoading(false);
    });

    socket.on("STATE_CHANGED", data => {
      setGame(data);
      setErrorMessage("");

      if (!data.joinable && data.players.length === 1) {
        setErrorMessage("Opponent disconnected!");
      }

      if (data.players.every(x => x.playAgain)) {
        setOpponentPlanes([]);
      }
    });

    socket.on("SET_MY_TURN", turn => {
      setMyTurn(turn);
    });

    socket.on("CANNOT_JOIN", message => {
      setErrorMessage(message);
    });

    socket.on("PLANES", ({ id, planes }) => {
      if (id === socket.id) {
        setMyPlanes(planes);
      } else {
        setOpponentPlanes(planes);
      }
    });
  }, [socket]);

  const rotatePlane = (plane, dir = 1) => {
    if (game.players[myTurn].ready) return;

    setPlaneSelected(plane);

    plane.posIndex = dir === 1 ? (plane.posIndex + 1) % 4 : (plane.posIndex + 3) % 4;
    plane.pos = rotations[plane.posIndex];

    updatePieces(plane);

    myPlanes.forEach(p => checkIfValid(p));

    setGame(curr => ({ ...curr }));
  };

  const checkIfValid = plane => {
    plane.valid = true;

    if (plane.pieces.some(x => x.row < 0 || x.row > 9 || x.col < 0 || x.col > 9)) plane.valid = false;

    // const planes = game.players[myTurn].planes.filter(x => x.id !== plane.id);
    const planes = myPlanes.filter(x => x.id !== plane.id);

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

    // game.players[myTurn].planes.forEach(p => checkIfValid(p));
    myPlanes.forEach(p => checkIfValid(p));

    setGame(curr => ({ ...curr }));
  };

  const handleJoin = inputCode => {
    if (inputCode.toUpperCase() === game.code) return;
    socket.emit("JOIN", { code: inputCode, planes: myPlanes });
    setErrorMessage("");
  };

  function handleToggleReady() {
    socket.emit("USER_TOGGLE_READY", { planes: myPlanes });
  }

  const handleCellClick = cell => {
    if (!game.started || game.finished) return;
    if (!game.started && game.turn !== myTurn) return;

    socket.emit("ROUND_OVER", { playerTurn: game.turn, cell });
  };

  const handleTogglePlayAgain = () => {
    socket.emit("USER_TOGGLE_PLAY_AGAIN");
  };

  const selectPlane = plane => {
    if (game.players[myTurn].ready || game.started) return;
    setPlaneSelected(plane);
  };

  const resetPlaneSelected = () => {
    setPlaneSelected(null);
  };

  const handleLeave = () => {
    socket.emit("LEAVE");
    setErrorMessage("");
    setMyPlanes(curr => curr.map(p => ({ ...p, destroyed: false })));
    setOpponentPlanes([]);
  };

  const value = {
    game,
    myPlanes,
    loading,
    planeSelected,
    opponentPlanes,
    myTurn,
    errorMessage,
    rotatePlane,
    handleOnStop,
    handleJoin,
    handleToggleReady,
    handleCellClick,
    handleTogglePlayAgain,
    selectPlane,
    resetPlaneSelected,
    handleLeave,
  };

  return <GameContext.Provider value={value}>{loading ? <Loader /> : children}</GameContext.Provider>;
}
