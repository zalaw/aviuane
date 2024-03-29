import React from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { IoMdHelp } from "react-icons/io";
import { useUserInterface } from "../contexts/UserInterfaceContext";
import CustomButton from "./CustomButton";

const Navbar = () => {
  const { darkTheme, toggleDarkTheme, toggleShowHelpModal } = useUserInterface();

  return (
    <div className="navbar">
      <div>Aviuane</div>

      <div className="navbar-right">
        <div onClick={toggleShowHelpModal}>
          <CustomButton icon={<IoMdHelp />} />
        </div>
        <div onClick={toggleDarkTheme}>
          {darkTheme ? <CustomButton icon={<MdDarkMode />} /> : <CustomButton icon={<MdLightMode />} />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
