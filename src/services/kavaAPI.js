import axios from "axios";

export const getKavaERC20 = (address) => {
  const options = {
    method: "GET",
    url: `https://explorer.kava.io/api?address=${address}`, // Test Address: 0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b
    params: {
      module: "account",
      action: "tokenlist",
    },
    headers: {
      accept: "application/json",
    },
  };

  const data = axios
    .request(options)
    .then((response) => {
      return response?.data?.result;
    })
    .catch((error) => {
      console.error("Get User NFT Error:", error);
    });

  return data;
};

export const getKavaTx = (address, limit) => {
  // console.log("Addresswa:", address);
  const options = {
    method: "GET",
    url: `https://explorer.kava.io/api?address=${address}`, //0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b
    params: {
      module: "account",
      action: "txlist",
      startblock: "4656916",
      offset: limit,
      page: 1,
    },
    headers: {
      accept: "application/json",
    },
  };

  const data = axios
    .request(options)
    .then((response) => {
      // console.log("All DATA:", response.data);
      return response?.data?.result;
    })
    .catch((error) => {
      console.error("Get User NFT Error:", error);
    });

  return data;
};
