import React from "react";
import { useGame } from "../contexts/GameContext";
import CustomButton from "./CustomButton";
import { MdKeyboardBackspace, MdRotate90DegreesCcw, MdCheck, MdClose } from "react-icons/md";

const ActionsButtons = ({ primary }) => {
  const { game, myPlanes, myTurn, planeSelected, handleLeave, handleToggleReady, handleTogglePlayAgain, rotatePlane } =
    useGame();

  return (
    <div className="actions-buttons-container">
      {primary && (
        <div className="row">
          <div className="row-item">
            {!game.joinable ? (
              <CustomButton tooltip="Leave" icon={<MdKeyboardBackspace />} onClick={handleLeave} />
            ) : null}

            {!game.started && !game.finished ? (
              <>
                <CustomButton
                  tooltip="Rotate Counterclockwise"
                  cn={"rotate-btn"}
                  disabled={!planeSelected}
                  icon={<MdRotate90DegreesCcw />}
                  onClick={() => rotatePlane(planeSelected, -1)}
                />
                <CustomButton
                  tooltip="Rotate Clockwise"
                  cn={"rotate-btn"}
                  disabled={!planeSelected}
                  icon={<MdRotate90DegreesCcw style={{ transform: "scaleX(-1)" }} />}
                  onClick={() => rotatePlane(planeSelected)}
                />
              </>
            ) : null}
          </div>

          <div className="row-item">
            {game.players.length === 2 && !game.players.some(x => x.disconnected) && !game.started && !game.finished ? (
              <CustomButton
                tooltip={"Toggle Ready"}
                icon={game.players[myTurn].ready ? <MdCheck /> : <MdClose />}
                cn={game.players[myTurn].ready ? "ready" : "not-ready"}
                // disabled={game.players[myTurn].planes.some(x => !x.valid)}
                disabled={myPlanes.some(x => !x.valid)}
                onClick={handleToggleReady}
                text="Ready"
              />
            ) : null}

            {game.players.length === 2 && !game.players.some(x => x.disconnected) && game.finished ? (
              <CustomButton
                tooltip={"Toggle Ready"}
                icon={game.players[myTurn].playAgain ? <MdCheck /> : <MdClose />}
                cn={game.players[myTurn].playAgain ? "ready" : "not-ready"}
                onClick={handleTogglePlayAgain}
                text="Play again"
              />
            ) : null}
          </div>
        </div>
      )}

      {!primary && (
        <div className="row">
          {game.players.length === 2 && !game.players.some(x => x.disconnected) && !game.started && !game.finished ? (
            <div className="ready-container">
              <div className={game.players[(myTurn + 1) % 2].ready ? "ready" : "not-ready"}></div>
              Opponent
            </div>
          ) : null}

          {game.players.length === 2 && !game.players.some(x => x.disconnected) && game.finished ? (
            <div className="ready-container">
              <div className={game.players[(myTurn + 1) % 2].playAgain ? "ready" : "not-ready"}></div>
              Opponent
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ActionsButtons;
