// SPDX-License-Identifier: UNLICENSED 

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";


contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    //create token ids: declare a variable _tokenIds set it to private it cannot be called outside of the class and is of a type Counters.Counter
    Counters.Counter private _tokenIds;
    Counters.Counter private _tokenSold;
     Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.025 ether;

    // owner of the contract:
    address payable owner;

    // keep up with all the nfts made: (passing an integer itemid and returns a market item)
    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    // this event will be triggered once a market item has been created
    event MarketItemCreated (
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    //function that is going to get called msg.sender that the owner of the contract is the one that is deploying it.
    constructor() ERC721('CryptoMark Tokens', 'CMT') {
        owner = payable(msg.sender);
    }

    // Check that we are the ower and and update price
    function updateListingPrice(uint _listingPrice) public payable {
        // require(condition to be met to start the function, error messge)
        require(owner == msg.sender, 'Only owner can update the price');

        listingPrice = _listingPrice;
    }

    // view means that the function is just returning something
    function getListingPrice() public view returns(uint256) {
        return listingPrice;
    }

    //createToken Function
    function createToken(string memory tokenURI, uint256 price) public payable returns(uint) {
        //update tokenIds by 1
        _tokenIds.increment();
        // get current value of tokenIds
        uint256 newTokenId = _tokenIds.current();
        //mint tokens
        _mint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);
        // take the token and list the item
        createMarketItem(newTokenId, price);

        return newTokenId;
    }
    // private because we call it in a funciton and not in the frontend
    function createMarketItem(uint256 tokenId, uint256 price) private{
        require(price > 0, 'Price must be higher than 0');
        require(msg.value == listingPrice, 'Price must be equal to listing price');

        //address(this) means the address of the person that is trying to create the item
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        //transfer the ownership of the nft to the contract
        // _transfer(from address, to address, tokenId)

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated (tokenId, msg.sender, address(this), price, false);
    }

    function resellToken(uint256 tokenId, uint256 price) public payable{
        // the user trying to resell the token must be the owner of the specific token with tokenId...
        require(idToMarketItem[tokenId].owner == msg.sender, 'Only item owner can perform this operation');

        require(msg.value == listingPrice, 'Price must be equal to listing price');

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        // the owner address(this) means it belongs to the smart contract of the nft marketplace
        idToMarketItem[tokenId].owner = payable(address(this));

        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) public payable {
        uint price = idToMarketItem[tokenId].price;
        require(msg.value == price, 'Please submit the asking price in order to complete the transaction');

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;

        //This operation may be part of a mechanism to mark a token as not currently being for sale or to reset the seller information associated with a particular token. It could be used in a smart contract where the zero address serves as a special value indicating that the token is not currently listed on a marketplace or doesn't have an associated seller.
        idToMarketItem[tokenId].seller = payable(address(0));

        _itemsSold.increment();

        // from the address(this) which is the marketplace address, send the NFT to the msg.sender which is the buyer now
        _transfer(address(this), msg.sender, tokenId);

        //transfer eth amount
        payable(owner).transfer(listingPrice); //sending the listing price to the owner, the person that created the nft marketplace
        payable(idToMarketItem[tokenId].seller).transfer(msg.value); //transfer the amount from the buyer to the seller
    }

    //fetch all unsolf items in the marketplace, this returns an array of market items, memory means some data to return
    function fetchMarketItems() public view returns(MarketItem[] memory) {
        // current item count, the N of items available
        uint itemCount = _tokenIds.current();
        // current unsold count
        uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        // we use a for loop and array here because we need to return an array. First, we make an items array of type MarketItems[], new market item array and also provide the length of the array created that why we pass (unsoldItemCount) which is the lenght of the array
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint i = 0; i < itemCount; i++){
            //check if item unsold, check if the owner of the item has an empty address(0), using i+1 because items start from 1, and the address(this) means this contract address
            if(idToMarketItem[ i + 1 ].owner == address(this)){
                uint currentId = i + 1;
               
                // map each market item to a (=) specific idToMarketItem
                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

     function fetchMyNFTs() public view returns(MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        //what is the number of items a user owns
        for(uint i = 0; i < totalItemCount; i++){
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }  
         MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint i = 0; i < totalItemCount; i++){
            if(idToMarketItem[ i + 1 ].owner == msg.sender){
                uint currentId = i + 1;
               
                // map each market item to a (=) specific idToMarketItem
                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchItemsListed() public view returns(MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        //what is the number of items a seller owns
        for(uint i = 0; i < totalItemCount; i++){
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }  
         MarketItem[] memory items = new MarketItem[](itemCount);

        for(uint i = 0; i < totalItemCount; i++){
            if(idToMarketItem[ i + 1 ].seller == msg.sender){
                uint currentId = i + 1;
               
                // map each market item to a (=) specific idToMarketItem
                MarketItem storage currentItem = idToMarketItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;

    }

}


