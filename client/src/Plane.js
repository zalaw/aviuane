import React from "react";
import { useGame } from "./contexts/GameContext";
import Draggable from "react-draggable";

export default function Plane({ plane }) {
  const { game, handleOnStop, rotatePlane } = useGame();

  const handleRotatePlane = (e, plane) => {
    e.preventDefault();
    rotatePlane(plane);
  };

  return (
    <Draggable
      disabled={game.player.ready}
      bounds="parent"
      grid={[32, 32]}
      defaultPosition={{ x: plane.head.col * 32, y: plane.head.row * 32 }}
      onStop={(e, ui) => handleOnStop(plane, ui)}
    >
      <div
        className={`plane ${!game.player.ready ? "plane-movable" : ""} ${plane.pos} ${
          !plane.valid ? "plane-not-valid" : ""
        } ${plane.destroyed ? "plane-destroyed" : ""}`}
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
