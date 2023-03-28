import React, { useState } from "react";
import { useGame } from "../contexts/GameContext";
import CustomButton from "./CustomButton";
import { MdOutlineChevronRight } from "react-icons/md";
import CustomInput from "./CustomInput";

const UserNotJoined = () => {
  const { game, handleJoin } = useGame();

  const [inputValue, setInputValue] = useState("");

  return (
    <div className="user-not-joined-container">
      <div className="user-not-joined-input-row">
        <CustomInput onChange={e => setInputValue(e.target.value)} maxLength={4} placeholder={"Your friend's code"} />
        <CustomButton
          onClick={() => handleJoin(inputValue)}
          disabled={inputValue.length !== 4 || inputValue.toUpperCase() === game.code}
          text="Join"
          icon={<MdOutlineChevronRight />}
        />
      </div>
    </div>
  );
};

export default UserNotJoined;
