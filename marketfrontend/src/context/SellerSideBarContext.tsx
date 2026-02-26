import { createContext, useContext, useState } from "react";

interface SellerSideBarContextType {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SellerSideBarContext = createContext<
  SellerSideBarContextType | undefined
>(undefined);

export const SellerSideBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setOpen] = useState<boolean>(true);

  return (
    <SellerSideBarContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </SellerSideBarContext.Provider>
  );
};

export const useSellerSideBarContext = () => {
  const context = useContext(SellerSideBarContext);
  if (context === undefined) {
    throw new Error(
      "useSellerSideBarContext must be used within a SellerSideBarProvider",
    );
  }
  return context;
};
