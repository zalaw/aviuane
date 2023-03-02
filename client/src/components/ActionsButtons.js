import React from "react";
import { useGame } from "../contexts/GameContext";
import CustomButton from "./CustomButton";
import { MdKeyboardBackspace, MdRotate90DegreesCcw, MdCheck, MdClose } from "react-icons/md";

const ActionsButtons = ({ primary }) => {
  const { game, handleLeave, handleToggleReady, handleTogglePlayAgain, rotatePlane } = useGame();

  return (
    <div className="actions-buttons-container">
      {primary && (
        <div className="row">
          <div className="row-item">
            {game.opponent.connected ? (
              <CustomButton
                tooltip="Leave"
                disabled={!game.opponent.connected}
                icon={<MdKeyboardBackspace />}
                onClick={handleLeave}
              />
            ) : null}

            {game.started ? null : (
              <>
                <CustomButton
                  tooltip="Rotate Counterclockwise"
                  cn={"rotate-btn"}
                  disabled={!game.planeSelected}
                  icon={<MdRotate90DegreesCcw />}
                  onClick={() => rotatePlane(game.planeSelected, -1)}
                />
                <CustomButton
                  tooltip="Rotate Clockwise"
                  cn={"rotate-btn"}
                  disabled={!game.planeSelected}
                  icon={<MdRotate90DegreesCcw style={{ transform: "scaleX(-1)" }} />}
                  onClick={() => rotatePlane(game.planeSelected)}
                />
              </>
            )}
          </div>
          <div className="row-item">
            {game.opponent.connected && !game.started ? (
              <CustomButton
                tooltip={"Toggle Ready"}
                icon={game.player.ready ? <MdCheck /> : <MdClose />}
                cn={game.player.ready ? "ready" : "not-ready"}
                disabled={!game.opponent.connected || game.player.planes.some(x => !x.valid)}
                onClick={handleToggleReady}
                text="Ready"
              />
            ) : null}

            {game.opponent.connected && game.finished ? (
              <CustomButton
                tooltip={"Toggle Ready"}
                icon={game.player.playAgain ? <MdCheck /> : <MdClose />}
                cn={game.player.playAgain ? "ready" : "not-ready"}
                onClick={handleTogglePlayAgain}
                text="Play again"
              />
            ) : null}
          </div>
        </div>
      )}

      {!primary && (
        <div className="row">
          {game.opponent.connected && !game.started ? (
            <div className="ready-container">
              <div className={game.opponent.ready ? "ready" : "not-ready"}></div>
              Opponent
            </div>
          ) : null}

          {game.opponent.connected && game.finished ? (
            <div className="ready-container">
              <div className={game.opponent.playAgain ? "ready" : "not-ready"}></div>
              Opponent
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ActionsButtons;
