"use client";
import React, { useContext } from "react";
import { WalletContext } from "@/context/Wallet";
import { connectWallet } from "@/utils/connectWallet";
import { NeoCyberButton } from "./ui/neo-cyber-button";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletButton = () => {
  const {
    setIsConnected,
    setUserAddress,
    setSigner,
    isConnected,
    userAddress,
  } = useContext(WalletContext);

  return (
    <div className="flex justify-center">
      <NeoCyberButton
        disabled={isConnected}
        onClick={async () => {
          await connectWallet(setIsConnected, setUserAddress, setSigner);
        }}
        className="w-full text-xs" // Adjusted size for potential long text
        variant={isConnected ? "secondary" : "primary"}
      >
        {userAddress
          ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
          : "CONNECT WALLET"}
      </NeoCyberButton>
    </div>
  );
};

export default WalletButton;
