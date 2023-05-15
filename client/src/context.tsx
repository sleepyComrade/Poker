import { createContext, useContext } from "react";

export const AppContext = createContext({scale: 1});
export const useAppContext = () => {
  return useContext(AppContext);
}