import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

const initialState = {
  activeMenu:true,
  isLoading:true,
  showNew:false,
  showUpdate:false,
  tableControl:false,
  showFacture:false,
  isLoggedIn:false,
};

export const ContextProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true);
  const [screenSize, setScreenSize] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false); 
  const [showNew, setShowNew] = useState(false); 
  const [showUpdate, setShowUpdate] = useState(false); 
  const [tableControl, setTableControl] = useState(false); 
  const [showFacture, setShowFacture] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  return (
    <StateContext.Provider
      value={{
        isLoading, 
        setIsLoading, 
        isLoggedIn,
        setIsLoggedIn,
        showNew, 
        setShowNew, 
        showUpdate, 
        setShowUpdate,
        tableControl,
        setTableControl, 
        showFacture,
        setShowFacture,
        activeMenu,
        setActiveMenu,
        screenSize,
        setScreenSize,
        initialState,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
