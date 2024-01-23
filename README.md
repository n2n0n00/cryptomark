# CryptoMark - A Web3 NFT Marketplace

CryptoMark is a decentralized NFT (Non-Fungible Token) marketplace built with Solidity, Next.js, React, and Hardhat. It allows users to create, buy, and sell NFTs securely on the (Eth/Testnet) blockchain.
![cryptomark1](https://github.com/n2n0n00/cryptomark/assets/40828429/79504a14-5da4-4dd1-aa79-f8d469d8c443)


## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)

## Features

- Create and mint NFTs
- List NFTs for sale
- Buy and sell NFTs using Ethereum
- Wallet integration for user authentication
- Explore NFT marketplace

## Technologies

- [Solidity](https://docs.soliditylang.org/en/v0.8.28/)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Hardhat](https://hardhat.org/)
- [Infura IPFS API](https://www.infura.io/product/ipfs)
- [Tailwind CSS](https://tailwindcss.com/)

![ds](https://github.com/n2n0n00/cryptomark/assets/40828429/149c1959-4b95-4355-8e22-3096357bb27d)


## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/getting-started/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/web3nftmarketplace.git
cd web3nftmarketplace

2. Install dependencies:

```bash
npm install
````

3. Environment Variables:

```bash
 const ipfsClient = require("ipfs-http-client");
  const projectId = "";
  const projectSecret = "";
  const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
    "base64"
  )}`;
```

4. Start the development server:
```bash
npm run dev
6. Start Hardhat Node:
```bash
npx hardhat node
npx hardhat run --network localhost scripts/deploy.js
```

