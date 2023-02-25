import React from "react";
import { useGame } from "./contexts/GameContext";
import Draggable from "react-draggable";

export default function Plane({ plane }) {
  const { player, rotatePlane, handleOnStop } = useGame();

  function test(e) {
    console.log(e);
    return false;
  }

  function handleOnAuxClick(e, plane) {
    if (e.button === 2) return;
    rotatePlane(plane);
  }

  return (
    <Draggable
      disabled={player.ready}
      bounds="parent"
      grid={[32, 32]}
      defaultPosition={{ x: plane.head.col * 32, y: plane.head.row * 32 }}
      onStop={(e, ui) => handleOnStop(plane, ui)}
    >
      <div
        className={`plane ${plane.pos} ${!plane.valid && "plane-not-valid"} ${plane.destroyed && "plane-destroyed"}`}
        onAuxClick={e => handleOnAuxClick(e, plane)}
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
