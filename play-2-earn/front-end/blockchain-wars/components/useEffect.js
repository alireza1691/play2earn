useEffect(() => {
  const fetchData = async () => {
    try {
      const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
      const imgURL = await lands.URI();
      setLandImgUrl(imgURL);

      let mintedLands = [];
      let tokenIds = [];
      let commoditiesBal = [];
      let events = [];

      const response = await etherScanApiCall();
      console.log(response);
      events = response.data.result;
      console.log(events);
      for (let index = 0; index < events.length; index++) {
        const topics = events[index].topics;

        if (
          Array.isArray(topics) &&
          topics.length === 4 &&
          topics[1] ===
            "0x0000000000000000000000000000000000000000000000000000000000000000" &&
          100 <= parseInt(topics[3], 16) <= 200
        ) {
          mintedLands.push(parseInt(topics[3], 16).toString());
        }
        if (address) {
          const landBalance = await lands.balanceOf(address);
          setOwnedLands(landBalance);
          if (
            landBalance > 0 &&
            Array.isArray(topics) &&
            topics.length === 4 &&
            topics[2] === convertAddress(address.toLowerCase())
          ) {
            tokenIds.push(parseInt(topics[3], 16));
            const stoneBal = await lands.getAssetBal(
              parseInt(topics[3], 16),
              0
            );
            const woodBal = await lands.getAssetBal(parseInt(topics[3], 16), 1);
            const ironBal = await lands.getAssetBal(parseInt(topics[3], 16), 2);
            const goldBal = await lands.getAssetBal(parseInt(topics[3], 16), 3);
            const foodBal = await lands.getAssetBal(parseInt(topics[3], 16), 4);
            const landBalances = {
              stone: ethers.utils.formatEther(stoneBal.toString()),
              wood: ethers.utils.formatEther(woodBal.toString()),
              iron: ethers.utils.formatEther(ironBal.toString()),
              gold: ethers.utils.formatEther(goldBal.toString()),
              food: ethers.utils.formatEther(foodBal.toString()),
            };
            commoditiesBal.push(landBalances);
          }
        }
      }

      setConnectedAddressLands(tokenIds);
      setCommoditiesBalance(commoditiesBal);
      setMintedLands(mintedLands);
      // console.log("evets of lands:", eventsOfLands);
      // eventsOfLands = events;
      console.log(mintedLands);
    } catch (error) {
      console.error("Error fetching contract events:", error);
    }
  };
  fetchData();
}, [previousResponse]);

const etherScanApiCall = async () => {
  if (previousResponse == undefined) {
    try {
      const response = await axios.get(
        `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&apikey=${apiKey}`
      );
      console.log("Fetched events");
      return response;
    } catch (error) {}
  } else {
    return previousResponse;
  }
};

const dataLoad = async () => {
  let mintedLands = [];
  try {
    const response = await axios.get(
      `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&apikey=${apiKey}`
    );
    console.log(response);
    events = response.data.result;
    console.log(events);
    for (let index = 0; index < events.length; index++) {
      const topics = events[index].topics;

      if (
        Array.isArray(topics) &&
        topics.length === 4 &&
        topics[1] ===
          "0x0000000000000000000000000000000000000000000000000000000000000000" &&
        100 <= parseInt(topics[3], 16) <= 200
      ) {
        mintedLands.push(parseInt(topics[3], 16).toString());
      }
    }
    setMintedLands(mintedLands);
    console.log(mintedLands);
  } catch (error) {
    console.error("Error fetching contract events:", error);
  }
};
