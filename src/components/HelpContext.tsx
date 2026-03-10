"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface HelpContextType {
  isOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  toggleHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);
  const toggleHelp = () => setIsOpen((prev) => !prev);

  return (
    <HelpContext.Provider value={{ isOpen, openHelp, closeHelp, toggleHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
}
