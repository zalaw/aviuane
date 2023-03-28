import React from "react";
import { useGame } from "../contexts/GameContext";
import Draggable from "react-draggable";

export default function Plane({ plane }) {
  const { game, myTurn, planeSelected, handleOnStop, rotatePlane, selectPlane } = useGame();

  const handleRotatePlane = (e, plane) => {
    e.preventDefault();
    rotatePlane(plane);
  };

  return (
    <Draggable
      disabled={game.started || game.finished || game.players[myTurn].ready}
      bounds="parent"
      grid={[32, 32]}
      defaultPosition={{ x: plane.head.col * 32, y: plane.head.row * 32 }}
      onStop={(e, ui) => handleOnStop(plane, ui)}
    >
      <div
        className={`plane ${planeSelected?.id === plane.id ? "plane-selected" : ""} ${
          !game.started && !game.finished && !game.players[myTurn].ready ? "plane-movable" : ""
        } ${plane.pos} ${!plane.valid ? "plane-not-valid" : ""} ${plane.destroyed ? "plane-destroyed" : ""}`}
        onClick={() => selectPlane(plane)}
        onTouchStart={() => selectPlane(plane)}
        onContextMenu={e => handleRotatePlane(e, plane)}
      >
        <div className="plane-piece head h1"></div>
        <div className="plane-piece big-wing bw1"></div>
        <div className="plane-piece big-wing bw2"></div>
        <div className="plane-piece big-wing bw3"></div>
        <div className="plane-piece big-wing bw4"></div>
        <div className="plane-piece big-wing bw5"></div>
        <div className="plane-piece body b1"></div>
        <div className="plane-piece small-wing sw1"></div>
        <div className="plane-piece small-wing sw2"></div>
        <div className="plane-piece small-wing sw3"></div>
      </div>
    </Draggable>
  );
}
