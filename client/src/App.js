import { useGame } from "./contexts/GameContext";
import Grid from "./Grid";
import Plane from "./Plane";

function App() {
  const { socket, code, opponent, gameStarted, turn, now, history } = useGame();

  return (
    <>
      {/* <p>code: {code}</p> */}
      {/* <p>id: {socket.id}</p> */}
      {/* <p>{turn}</p>
      <p>{JSON.stringify(history, null, 2)}</p>
      <p>My history: {JSON.stringify(history?.filter(x => x.turn === turn))}</p>
      <p>Opponent history: {JSON.stringify(history?.filter(x => x.turn !== turn))}</p> */}

      {gameStarted && <div className="event">{now === turn ? <p>Your turn</p> : <p>Waiting for opponent</p>}</div>}
      {!opponent && (
        <p className="code">
          Your room code is <b>{code}</b>
        </p>
      )}

      <div className="grid-container">
        <Grid primary={true} />
        <Grid />
      </div>

      <div className="history-container">
        {history?.map((x, i) => {
          return (
            <p key={i}>
              {x.turn === turn ? "You" : "Opponent"}: {x.row + 1}
              {String.fromCharCode(65 + x.col)}
            </p>
          );
        })}
      </div>

      {/* <div className="planes-container">
        <Plane />
        <Plane />
        <Plane />
      </div> */}
    </>
  );
}

export default App;
