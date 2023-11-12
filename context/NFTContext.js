/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

import { MarketAddress, MarketAddressABI } from "./constants";

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const nftCurrency = "ETH";

  const checkIfWalletIsConnected = async () => {
    // check if user has metamask installed
    if (!window.ethereum) return alert("Please install Metamask!");
    // if metamask installed get accounts
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    // if accounts has a length of a count
    if (accounts.length) {
      // set it to the first account of the list
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No accounts found!");
    }

    console.log({ accounts });
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    // check again if a user has installed metamask
    if (!window.ethereum) return alert("Please install Metamask!");
    // to make a request to connect to a specific account
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);

    window.location.reload();
  };

  const uploadToIPFS = async;

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount }}>
      {children}
    </NFTContext.Provider>
  );
};
