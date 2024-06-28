import React, { useEffect, useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { useStateContext } from '../contexts/ContextProvider';
import {
  enable as enableDarkMode,
  disable as disableDarkMode,
  auto as followSystemColorScheme,
  exportGeneratedCSS as collectCSS,
  isEnabled as isDarkReaderEnabled
} from 'darkreader';
import {
  getAuth,
  signOut
} from 'firebase/auth';

import { FaMoon, FaSun ,FaSignOutAlt} from 'react-icons/fa';  

const NavButton = ({ customFunc, icon, color, dotColor }) => (
  <button
    type="button"
    onClick={() => customFunc()}
    style={{ color }}
    className="relative text-xl rounded-full p-3 hover:bg-light-gray"
  >
    <span style={{ background: dotColor }} className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2" />
    {icon}
  </button>
);


const Navbar = () => {
  const { currentColor, activeMenu, setActiveMenu, setScreenSize, screenSize } = useStateContext();
  const [isDarkMode, setDarkMode] = useState(false);
  const auth = getAuth();

  const handlelogout = () => {
    signOut(auth);
    window.location.href = "/"; 
  }

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);



  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  useEffect(() => {
    handleDarkMode();
  }, [isDarkMode]);

  const handleDarkMode = () => {
    if (isDarkMode) {
      enableDarkMode({
        brightness: 100,
        contrast: 90,
        sepia: 10,
      });
    } else {
      disableDarkMode();
    }
  };

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <div className="flex justify-between mb-4 p-4 bg-white  relative items-center w-full  drop-shadow-xl rounded-md">
      <NavButton title="Menu" customFunc={handleActiveMenu} color={currentColor} icon={<AiOutlineMenu />} />
      <div className='flex '>
      {isDarkMode ? (
        <NavButton title="Toggle Light Mode" customFunc={toggleDarkMode} color={currentColor} icon={<FaSun />} transitionDuration="2s" />
      ) : (
        <NavButton title="Toggle Dark Mode" customFunc={toggleDarkMode} color={currentColor} icon={<FaMoon />}  transitionDuration="2s"/>
        )}
         <NavButton title="Log Out" customFunc={handlelogout} color={currentColor} icon={<FaSignOutAlt />}  transitionDuration="2s"/>
        </div>
    </div>
  );
};

export default Navbar;

