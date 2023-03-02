import React from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useUserInterface } from "../contexts/UserInterfaceContext";
import CustomButton from "./CustomButton";

const Navbar = () => {
  const { darkTheme, toggleDarkTheme } = useUserInterface();

  return (
    <div className="navbar">
      <div>Aviuane</div>
      <div onClick={toggleDarkTheme}>
        {darkTheme ? <CustomButton icon={<MdDarkMode />} /> : <CustomButton icon={<MdLightMode />} />}
      </div>
    </div>
  );
};

export default Navbar;
