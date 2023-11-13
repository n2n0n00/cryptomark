/* eslint-disable global-require */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { Buffer } from "buffer";
import { MarketAddress, MarketAddressABI } from "./constants";

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

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

  // connect to ipfs through infura api method after 2022 starts here:

  const ipfsClient = require("ipfs-http-client");
  const projectId = "2Y4c5wsGemTP4vZbSoPrRdHvs9z";
  const projectSecret = "e2ff34904239a90be1c5ef952f4904d4";
  const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
    "base64"
  )}`;

  const client = ipfsClient.create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  // ends here

  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

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

  const uploadToInfuraIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://cryptomark.infura-ipfs.io/ipfs/${added.path}`;

      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  // declaring the parameters
  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner(); // who is creating the nft
    const price = ethers.utils.parseUnits(formInputPrice, "ether"); // using parseUnits because we are using human readable format
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();
    const transaction = await contract.createToken(url, price, {
      value: listingPrice.toString(),
    });
    await transaction.wait();
  };

  const fetchNFTs = async () => {
    const provider = new ethers.providers.JsonRpcBatchProvider();
    // to fetch all nfts in the marketplace use provider instead of signer
    const contract = fetchContract(provider);

    // an array of promises that contain the nft data
    const data = await contract.fetchMarketItems();

    // fetch all nfts promises simultaneously and then map over to get the data for each nft
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        // to get the title and description of the nft as metadata, thus we destructure the response into data and data into the properties
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);

        // to get the price, we are using formatUnits because we are reading from a very big number into a human readable number
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokeId: tokenId.toNumber(),
          seller,
          owner,
          image,
          description,
          name,
          tokenURI,
        };
      })
    );

    return items;
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = `https://cryptomark.infura-ipfs.io/ipfs/${added.path}`;

      // passing in the arguments
      await createSale(url, price);

      router.push("/");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data =
      type === "fetchItemsListed"
        ? await contract.fetchItemsListed()
        : await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();

    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    console.log("i am working up to here!");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    console.log("Error here 8");
    setIsLoadingNFT(true);

    await transaction.wait();

    setIsLoadingNFT(false);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToInfuraIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNft,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
