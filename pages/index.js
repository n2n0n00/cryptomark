/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable quotes */
import { useState, useEffect, useRef, useContext } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Banner, CreatorCard, NFTCard, SearchBar } from "../components";
import images from "../assets/index";
import { makeid } from "../utils/makeId";
import { NFTContext } from "../context/NFTContext";
import { getCreators } from "../utils/getTopCreators";
import { shortenAddress } from "../utils/shortenAddress";

const Home = () => {
  const { fetchNFTs } = useContext(NFTContext);
  const [hideButtons, setHideButtons] = useState(false);
  const parentRef = useRef(null);
  const scrollRef = useRef(null);
  const { theme } = useTheme();
  const [NFTs, setNFTs] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [activeSelect, setActiveSelect] = useState("Recently Added");
  useEffect(() => {
    fetchNFTs().then((items) => {
      setNFTs(items);
      setNftsCopy(items);
      console.log(items);
    });
  }, []);

  useEffect(() => {
    const sortedNfts = [...NFTs];

    switch (activeSelect) {
      case "Price (low to high)":
        setNFTs(sortedNfts.sort((a, b) => a.price - b.price));
        break;
      case "Price (high to low)":
        setNFTs(sortedNfts.sort((a, b) => b.price - a.price));
        break;
      case "Recently added":
        setNFTs(sortedNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;
      default:
        setNFTs(NFTs);
        break;
    }
  }, [activeSelect]);

  const handleScroll = (direction) => {
    const { current } = scrollRef;

    // if window width = 1800 then move by 270 otherwise move by 210
    const scrollAmount = window.innerWidth > 1800 ? 270 : 210;

    if (direction === "left") {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;

    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHideButtons(false);
    } else {
      setHideButtons(true);
    }
  };

  const onHandleSearch = (value) => {
    const filteredNfts = NFTs.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNFTs(filteredNfts);
    } else {
      setNFTs(nftsCopy);
    }
  };

  const onClearSearch = () => {
    if (NFTs.length && nftsCopy.length) {
      setNFTs(nftsCopy);
    }
  };

  useEffect(() => {
    isScrollable();
    // add a listener when the window is resized and call isScrollable
    window.addEventListener("resize", isScrollable);

    // remove the event listener to follow best practices
    return () => {
      window.removeEventListener("resize", isScrollable);
    };
  });

  const getTopCreators = getCreators(nftsCopy);

  console.log(getTopCreators);

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-full minmd:w-4/5">
        <Banner
          name={
            <>
              Discover, collect, and sell <br /> extraordinary NFTs
            </>
          }
          childStyles="md:text-4xl sm:text-2xl xs:text-xl text-left"
          parentStyle="justify-start mb-7 h-72 sm:h-60 p-12 xs:p-4 xs:h-44 rounded-3xl"
        />

        <div>
          <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0s">
            Best Creators
          </h1>

          <div className="relative flex-1 max-w-full flex mt-3" ref={parentRef}>
            <div
              className="flex flex-row w-max overflow-x-scroll no-scrollbar select-none"
              ref={scrollRef}
            >
              {getTopCreators.map((creator, i) => (
                <CreatorCard
                  key={creator.seller}
                  rank={i + 1}
                  creatorImage={images[`creator${i + 1}`]}
                  creatorName={shortenAddress(creator.seller)}
                  creatorEths={creator.sum}
                />
              ))}
              {!hideButtons && (
                <>
                  <div
                    className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer left-0"
                    onClick={() => handleScroll("left")}
                  >
                    <Image
                      src={images.left}
                      layout="fill"
                      objectFit="contain"
                      alt="left_arrow"
                      className={theme === "light" && "filter invert"}
                    />
                  </div>
                  <div
                    className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer right-0"
                    onClick={() => handleScroll("right")}
                  >
                    <Image
                      src={images.right}
                      layout="fill"
                      objectFit="contain"
                      alt="left_arrow"
                      className={theme === "light" && "filter invert"}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between flex-col mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start">
              <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4 flex-1">
                Hot Bids
              </h1>
              <div className="flex-2 sm:w-full flex flex-row sm:flex-col">
                <SearchBar
                  activeSelect={activeSelect}
                  setActiveSelect={setActiveSelect}
                  handleSearch={onHandleSearch}
                  clearSearch={onClearSearch}
                />
              </div>
              <div className="mt-3 w-full flex flex-wrap md:justify-center justify-center">
                {NFTs.map((nft) => (
                  <NFTCard key={nft.tokenId} nft={nft} />
                ))}
                {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <NFTCard
                    key={`nft-${i}`}
                    nft={{
                      i,
                      name: `Nifty NFT ${i}`,
                      price: (10 - i * 0.534).toFixed(2),
                      seller: `0x${makeid(3)}...${makeid(4)}`,
                      onwer: `0x${makeid(3)}...${makeid(4)}`,
                      description: "Cool NFT for sale!",
                    }}
                  />
                ))} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
