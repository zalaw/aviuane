import React from "react";
import { useGame } from "../contexts/GameContext";
import Draggable from "react-draggable";

export default function Plane({ plane }) {
  const { game, myTurn, planeSelected, handleOnStop, rotatePlane, selectPlane } = useGame();

  const disabled = game.started || game.finished || game.players[myTurn].ready;
  const planeSelectedClass = planeSelected?.id === plane.id ? "plane-selected" : "";
  const planeMovableClass = !game.started && !game.finished && !game.players[myTurn].ready ? "plane-movable" : "";
  const planeNotValidClass = !plane.valid ? "plane-not-valid" : "";
  const planeDestroyedClass = plane.destroyed ? "plane-destroyed" : "";

  const handleRotatePlane = (e, plane) => {
    e.preventDefault();
    rotatePlane(plane);
  };

  return (
    <Draggable
      disabled={disabled}
      bounds={{ left: 0, top: 0, right: game.gridSize * 32 - 32, bottom: game.gridSize * 32 - 32 }}
      grid={[32, 32]}
      defaultPosition={{ x: plane.head.col * 32, y: plane.head.row * 32 }}
      onStop={(e, ui) => handleOnStop(plane, ui)}
    >
      <div
        className={`plane ${plane.pos} ${planeSelectedClass} ${planeMovableClass} ${planeNotValidClass} ${planeDestroyedClass}`}
        onMouseDownCapture={() => selectPlane(plane)}
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
