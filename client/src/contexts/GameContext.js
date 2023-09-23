import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import Loader from "../components/Loader";
import { rotations, defaultPlanes } from "../data/data";
import { useUserInterface } from "./UserInterfaceContext";

import AngryEmoji from "../assets/angry-emoji.png";
import ClownEmoji from "../assets/clown-emoji.png";
import FlushedEmoji from "../assets/flushed-emoji.png";
import LaughingEmoji from "../assets/laughing-emoji.png";
import ThinkingEmoji from "../assets/thinking-emoji.png";

const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const emotes = [AngryEmoji, ClownEmoji, FlushedEmoji, LaughingEmoji, ThinkingEmoji];

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState(null);
  const [myTurn, setMyTurn] = useState(0);
  const [planeSelected, setPlaneSelected] = useState(null);
  const [myPlanes, setMyPlanes] = useState([]);
  const [opponentPlanes, setOpponentPlanes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [emotesToDisplay, setEmotesToDisplay] = useState([]);

  const { toggleShowSettingsModal } = useUserInterface();

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
      setLoading(false);
      setGame(data);
      setMyPlanes(defaultPlanes.slice(0, data.numOfPlanes));
    });

    socket.on("STATE_CHANGED", data => {
      setGame(data);
      setErrorMessage("");

      if (data.players.some(x => x.disconnected)) {
        setErrorMessage("Opponent disconnected!");
      }

      if (data.players.every(x => x.playAgain)) {
        setOpponentPlanes([]);
      }

      toggleShowSettingsModal(false);
    });

    socket.on("SET_MY_TURN", turn => {
      setMyTurn(turn);
    });

    socket.on("CANNOT_JOIN", message => {
      setErrorMessage(message);
    });

    socket.on("PLANES", ({ id, planes }) => {
      if (id === socket.id) {
        setMyPlanes([]);
        setTimeout(() => {
          setMyPlanes(planes);
        }, 1);
      } else {
        setOpponentPlanes(planes);
      }
    });

    socket.on("EMOTE", ({ index, left }) => {
      const key = new Date().getTime();

      setEmotesToDisplay(curr => [...curr, { index, key, left }]);

      setTimeout(() => {
        setEmotesToDisplay(curr => curr.filter(x => x.key !== key));
      }, 3000);
    });
  }, [socket]);

  const rotatePlane = (plane, dir = 1) => {
    if (game.started || game.finished || game.players[myTurn].ready) return;

    setPlaneSelected(plane);

    plane.posIndex = dir === 1 ? (plane.posIndex + 1) % 4 : (plane.posIndex + 3) % 4;
    plane.pos = rotations[plane.posIndex];

    updatePieces(plane);

    myPlanes.forEach(p => checkIfValid(p));

    setGame(curr => ({ ...curr }));
  };

  const checkIfValid = plane => {
    plane.valid = true;

    if (plane.pieces.some(x => x.row < 0 || x.row >= game.gridSize || x.col < 0 || x.col >= game.gridSize))
      plane.valid = false;

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

  function handleSettingsChange({ gridSize, numOfPlanes }) {
    socket.emit("SETTINGS_CHANGED", { gridSize, numOfPlanes });
  }

  const handleCellClick = cell => {
    if (!game.started || game.finished || game.players.some(x => x.disconnected)) return;
    if (game.started && game.turn !== myTurn) return;
    if (game.history.find(x => x.turn === myTurn && x.cell === cell)) return;

    socket.emit("ROUND_OVER", { playerTurn: game.turn, cell });
  };

  const handleTogglePlayAgain = () => {
    socket.emit("USER_TOGGLE_PLAY_AGAIN");
  };

  const selectPlane = plane => {
    if (game.started || game.finished || game.players[myTurn].ready) return;
    setPlaneSelected(plane);
  };

  const resetPlaneSelected = () => {
    setPlaneSelected(null);
  };

  const handleLeave = () => {
    setMyTurn(0);
    socket.emit("LEAVE");
    setErrorMessage("");
    setMyPlanes(curr => curr.map(p => ({ ...p, destroyed: false })));
    setOpponentPlanes([]);
  };

  const handleSendEmote = index => {
    socket.emit("EMOTE", index);
  };

  const value = {
    game,
    myPlanes,
    loading,
    planeSelected,
    opponentPlanes,
    myTurn,
    errorMessage,
    emotes,
    emotesToDisplay,
    rotatePlane,
    handleOnStop,
    handleJoin,
    handleToggleReady,
    handleCellClick,
    handleTogglePlayAgain,
    selectPlane,
    resetPlaneSelected,
    handleLeave,
    handleSettingsChange,
    handleSendEmote,
  };

  return <GameContext.Provider value={value}>{loading ? <Loader /> : children}</GameContext.Provider>;
}
