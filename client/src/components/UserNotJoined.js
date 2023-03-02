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
      <CustomInput onChange={e => setInputValue(e.target.value)} maxLength={4} placeholder={"yooo"} />
      <CustomButton
        onClick={() => handleJoin(inputValue)}
        disabled={inputValue.length !== 4 || inputValue.toUpperCase() === game.code}
        text="Join"
        icon={<MdOutlineChevronRight />}
      />
    </div>
  );
};

export default UserNotJoined;
