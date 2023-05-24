import Web3 from "web3";
import { ethers } from "ethers";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { useSearchParams } from "react-router-dom";
import { styled } from "@mui/material/styles";
import History from './History';
import {
  Paper,
  Grid,
  Modal,
  Button,
  FormControl,
  Slider,
  InputBase,
  useMediaQuery,
  Typography,
  TextField
} from "@mui/material";
import {
  Settings,
} from "@mui/icons-material";
import tw from "twin.macro";
import LiquidityCmp from "./LiquidityCmp";
import { useWeightsData } from "../../config/chartData";
import { getKavaTx } from "../../services/kavaAPI";
import {
  getPoolData,
  getPoolBalance,
  removePool,
  fromWeiVal,
  getPoolSupply,
  calculateSwap,
  getPoolList,
  toLongNum,
  numFormat
} from "../../config/web3";
import { customPoolList, defaultProvider, userSettings } from "../../config/constants";
import { contractAddresses } from "../../config/constants";
import {
  LineChart,
  Line,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ADD_POOL, REMOVE_POOL } from "../../redux/constants";
import routerABI from "../../assets/abi/router";
import abiDecoder from "../../config/abiDecoder";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#07071c",
    border: "0px solid #ced4da",
    fontSize: 20,
    textAlign: "start",
    padding: "10px 16px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
      color: "white"
    },
  },
  icon: {
    color: "white",
  },
}));

export default function RLiquidity() {
  const grayColor = "#6d6d7d";
  const selected_chain = useSelector((state) => state.selectedChain);
  const uniList = useSelector((state) => state.tokenList);
  const poolList = useSelector((state) => state.poolList);
  const { account, connector } = useWeb3React();
  const [searchParams, setSearchParams] = useSearchParams();

  const [setting, setSetting] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [weightA, setWeightA] = useState(0.5);
  const [tokenA, setTokenA] = useState([]);
  const [tokenB, setTokenB] = useState([]);
  const [scale, setScale] = useState(50);
  const [lpPercentage, setLpPercentage] = useState(0.5);
  const [poolAmount, setPoolAmount] = useState(0);
  const [selectedItem, setSelectedItem] = useState(poolList[selected_chain][0]);
  const [filterData, setFilterData] = useState(poolList[selected_chain]);
  const [query, setQuery] = useState("");
  const [totalLPTokens, setTotalLPTokens] = useState(0);
  const [outTokenA, setOutTokenA] = useState(0);
  const [outTokenB, setOutTokenB] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [slippage, setSlippage] = useState(1);
  const [slippageFlag, setSlippageFlag] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [userERC20Transactions, setUserERC20Transactions] = useState({isLoad: false, data: []});

  const dispatch = useDispatch();
  const weightData = useWeightsData(selectedItem["address"].toLowerCase());
  const isMobile = useMediaQuery("(max-width:600px)");
  const provider = defaultProvider[selected_chain];

  const StyledModal = tw.div`
    flex
    flex-col
    relative
    m-auto
    top-1/4
    p-6
    shadow-box
    min-h-min
    transform -translate-x-1/2 -translate-y-1/2
    sm:w-1/3 w-11/12
  `;

  const clickConWallet = () => {
    document.getElementById("connect_wallet_btn").click();
  }

  const handleOpen = () => {
    setQuery("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleScale = async (event, newValue) => {
    setScale(newValue * 1);
    let weight1 = newValue / 100;
    setWeightA(weight1);
    await calculateOutput(totalLPTokens, value, weight1, tokenA, tokenB);
  };

  const handleValue = (event) => {
    setValue(toLongNum(event.target.value));
  } 

  const calculateOutput = async (totalLkTk, inValue, weight1, token1, token2) => {
    const poolData = await getPoolData(
      provider,
      selectedItem["address"]
    );

    let removeingPercentage = inValue / (Number(totalLkTk) + 0.0000000001);
    let standardOutA = removeingPercentage * poolData.balances[0];
    let standardOutB = removeingPercentage * poolData.balances[1];
    let reqWeightA = (1 - weight1) * 10 ** 18;
    let reqWeightB = weight1 * 10 ** 18;
    let outA = 0;
    let outB = 0;
    if (reqWeightB < Number(poolData.weights[1])) {
      outB = (standardOutB / poolData.weights[1]) * reqWeightB;
      let extraA = await
        calculateSwap(poolData.tokens[1], poolData, numFormat((standardOutB - outB) / 10 ** poolData.decimals[1])) *
        10 ** poolData.decimals[0];
      outA = standardOutA + extraA;
    } else {
      outA = (standardOutA / poolData.weights[0]) * reqWeightA;
      let extraB = await
        calculateSwap(poolData.tokens[0], poolData, numFormat((standardOutA - outA) / 10 ** poolData.decimals[0])) *
        10 ** poolData.decimals[1];
      outB = standardOutB + extraB;
    }

    const vaueA = Math.floor(outA).toLocaleString("fullwide", { useGrouping: false });
    const vaueB = Math.floor(outB).toLocaleString("fullwide", { useGrouping: false });
    const amount1 = fromWeiVal(provider, vaueA, poolData.decimals[0]);
    const amount2 = fromWeiVal(provider, vaueB, poolData.decimals[1]);
    setOutTokenA(amount1);
    setOutTokenB(amount2);
    if (token1.length !== 0 && token2.length !== 0)
      calculateImpact(poolData, amount1, amount2, token1, token2);
  };

  const calculateImpact = async (poolData, inVal, outVal, token1, token2) => {
    let weight_from;
    let weight_to;
    let balance_from;
    let balance_to;
    let decimal_from;
    let decimal_to;
    let amount1 = 0;
    let amount2 = 0;

    if (token1.address.toLowerCase() === poolData.tokens[0].toLowerCase()) {
      balance_from = poolData.balances[0];
      balance_to = poolData.balances[1];
      weight_from = poolData.weights[0];
      weight_to = poolData.weights[1];
      decimal_from = poolData.decimals[0];
      decimal_to = poolData.decimals[1];
      amount1 = inVal;
      amount2 = outVal;
    } else {
      weight_from = poolData.weights[1];
      weight_to = poolData.weights[0];
      balance_from = poolData.balances[1];
      balance_to = poolData.balances[0];
      decimal_from = poolData.decimals[1];
      decimal_to = poolData.decimals[0];
      amount1 = outVal;
      amount2 = inVal;
    }

    let price = (balance_to / 10 ** decimal_to) / weight_to / ((balance_from / 10 ** decimal_from) / weight_from);
    let remain_amount = 0;
    if (amount1 > amount2 * price) {
      remain_amount = (amount1 - amount2 * price) / (price);
      let amountOut = await calculateSwap(
        token1.address.toLowerCase() === poolData.tokens[0].toLowerCase() ? token2.address : token1.address,
        poolData,
        remain_amount
      );
      setPriceImpact(numFormat((amountOut / (remain_amount * price + 0.000000000000001) - 1) * 100));
    } else {
      remain_amount = (amount2 * price - amount1);
      let amountOut = await calculateSwap(
        token1.address.toLowerCase() === poolData.tokens[0].toLowerCase() ? token1.address : token2.address,
        poolData,
        remain_amount
      );

      setPriceImpact(numFormat((amountOut / (remain_amount / (price + 0.000000000000000001) + 0.0000000000000001) - 1) * 100));
    }
  }

  const filterLP = useCallback(async (e) => {
    if (Web3.utils.isAddress(query)) {
      const _filterData = await getPoolList(provider, query, uniList, selected_chain, poolList[selected_chain]);
      setFilterData(_filterData);
    } else if (query.length !== 0) {
      const filterDT = poolList[selected_chain].filter((item) => {
        return (
          item["symbols"][0].toLowerCase().indexOf(query) !== -1 ||
          item["symbols"][1].toLowerCase().indexOf(query) !== -1
        );
      });
      setFilterData(filterDT);
    } else {
      setFilterData(poolList[[selected_chain]]);
    }
  }, [query, poolList, provider, selected_chain, uniList]);

  const changeQuery = async (e) => {
    let search_qr = e.target.value.trim();
    setQuery(search_qr);
  }

  const getStatusData = async () => {
    const result1 = uniList[selected_chain].filter((item) => {
      return item.symbol === selectedItem['symbols'][0];
    });

    setTokenA(result1[0]);

    const result2 = uniList[selected_chain].filter((item) => {
      return item.symbol === selectedItem['symbols'][1];
    });

    setTokenB(result2[0]);
    if (account) {
      const provider = await connector.getProvider();
      const poolData = await getPoolData(
        provider,
        selectedItem["address"]
      );
      const weight1 = fromWeiVal(provider, poolData["weights"][0], "18");
      setWeightA(weight1);
      setScale((weight1 * 100));

      // const result1 = uniList[selected_chain].filter((item) => {
      //   return item.address.toLowerCase() === poolData["tokens"][0].toLowerCase();
      // });

      // setTokenA(result1[0]);

      // const result2 = uniList[selected_chain].filter((item) => {
      //   return item.address.toLowerCase() === poolData["tokens"][1].toLowerCase();
      // });

      // setTokenB(result2[0]);

      let amount = await getPoolBalance(
        account,
        provider,
        selectedItem["address"]
      );
      setPoolAmount(amount);
      setValue(amount * lpPercentage);
      let totalLPAmount = await getPoolSupply(
        provider,
        selectedItem["address"]
      );
      setTotalLPTokens(totalLPAmount);
      await calculateOutput(totalLPAmount, amount * lpPercentage, weight1, result1[0], result2[0]);
    }
  }

  const selectToken = async (item) => {
    setQuery("");
    handleClose();
    setSelectedItem(item);
  };

  const executeRemovePool = async () => {
    if (!(Number(value) <= 0)) {
      const provider = await connector.getProvider();
      let ratio = (1 - scale / 100).toFixed(8);
      let real_val = Number((Math.floor(poolAmount * Math.pow(10, 9)) / Math.pow(10, 9)).toFixed(9));
      real_val = toLongNum(real_val * lpPercentage);
      setRemoving(true);
      await removePool(
        account,
        provider,
        real_val,
        ratio,
        tokenA.address,
        tokenB.address,
        outTokenA,
        outTokenB,
        slippage * 0.01,
        contractAddresses[selected_chain]["router"]
      );
      setRemoving(false);
      await setTimeout(function() {
        fetchUserData();
      }, 10000);
      await getStatusData();
    }
  };

  const valueLabelFormat = (value) => {
    return value + "%";
  }

  const CustomTooltip0 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      var eventTime = new Date(payload[0].payload["timestamp"] * 1000);
      var year = eventTime.getUTCFullYear();
      var month =
        eventTime.getUTCMonth() + 1 < 10
          ? "0" + (eventTime.getUTCMonth() + 1)
          : eventTime.getUTCMonth() + 1;
      var day =
        eventTime.getUTCDate() < 10
          ? "0" + eventTime.getUTCDate()
          : eventTime.getUTCDate();
      var hour =
        eventTime.getUTCHours() < 10
          ? "0" + eventTime.getUTCHours()
          : eventTime.getUTCHours();
      var min =
        eventTime.getUTCMinutes() < 10
          ? "0" + eventTime.getUTCMinutes()
          : eventTime.getUTCMinutes();
      var sec =
        eventTime.getUTCSeconds() < 10
          ? "0" + eventTime.getUTCSeconds()
          : eventTime.getUTCSeconds();
      eventTime =
        year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
      return (
        <div
          className="custom-tooltip"
          style={{ backgroundColor: "white", padding: 5 }}
        >
          <p className="label fw-bold">{eventTime}</p>
          <p className="label">
            {payload[0].payload["token0"]} : {payload[0].payload["weight0"]}
          </p>
        </div>
      );
    }

    return null;
  };

  const CustomTooltip1 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      var eventTime = new Date(payload[0].payload["timestamp"] * 1000);
      var year = eventTime.getUTCFullYear();
      var month =
        eventTime.getUTCMonth() + 1 < 10
          ? "0" + (eventTime.getUTCMonth() + 1)
          : eventTime.getUTCMonth() + 1;
      var day =
        eventTime.getUTCDate() < 10
          ? "0" + eventTime.getUTCDate()
          : eventTime.getUTCDate();
      var hour =
        eventTime.getUTCHours() < 10
          ? "0" + eventTime.getUTCHours()
          : eventTime.getUTCHours();
      var min =
        eventTime.getUTCMinutes() < 10
          ? "0" + eventTime.getUTCMinutes()
          : eventTime.getUTCMinutes();
      var sec =
        eventTime.getUTCSeconds() < 10
          ? "0" + eventTime.getUTCSeconds()
          : eventTime.getUTCSeconds();
      eventTime =
        year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
      return (
        <div
          className="custom-tooltip"
          style={{ backgroundColor: "white", padding: 5 }}
        >
          <p className="label fw-bold">{eventTime}</p>
          <p className="label">
            {payload[0].payload["token1"]} : {payload[0].payload["weight1"]}
          </p>
        </div>
      );
    }

    return null;
  };

  const formattedWeightsData = useMemo(() => {
    if (weightData && weightData.weights) {
      return weightData.weights.map((item, index) => {
        var tempArr = {};
        tempArr["name"] = index;
        tempArr["weight0"] = Number(item.weight0).toFixed(2);
        tempArr["weight1"] = Number(item.weight1).toFixed(2);
        tempArr["token0"] = item.token0.symbol;
        tempArr["token1"] = item.token1.symbol;
        tempArr["timestamp"] = item.timestamp;
        return tempArr;
      });
    } else {
      return [];
    }
  }, [weightData]);

  const fetchUserData = async () => {
    const provider = await connector.getProvider();
    const web3 = new Web3(provider);
    abiDecoder.addABI(routerABI);
    getKavaTx(account, 150).then(async (response) => {
      let filteredThx = response;
      filteredThx.map((item) => {
        item.raw_input = abiDecoder.decodeMethod(item.input);
      });

      filteredThx = await filteredThx.filter((item) => {
        return (item.raw_input !== undefined && (item.raw_input.name === "exitPool"));
      });

      filteredThx.map(async (item) => {
        let item_token1 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[0].toLowerCase();
        });
        let item_token2 = uniList[selected_chain].filter((unit) => {
          return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[1].toLowerCase();
        });
        if(item_token1 && item_token2) {
          let userDT = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256"], item.raw_input.params[1].value.userData);
          web3.eth.getTransactionReceipt(item.hash, function(e, receipt) {
            const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
            item.amount1 = numFormat(decodedLogs[0].events[2].value[0]/10**item_token1[0].decimals);
            item.amount2 = numFormat(decodedLogs[0].events[2].value[1]/10**item_token2[0].decimals);
          });
          item.action_type = 2;
          item.token1_symbol = item_token1[0].symbol;
          item.token2_symbol = item_token2[0].symbol;
        } else {
          item.action_type = 2;
          item.token1_symbol = "Unknown";
          item.token2_symbol = "Unknown";
          item.amount1 = 0;
          item.amount2 = 0;
        }
      });
      setUserERC20Transactions({isLoad: true, data: filteredThx})
    });
  };

  const setInitialTokens = () => {
    const pool_addr = searchParams.get("pool");
    if(pool_addr) {
      let pool_item = poolList[selected_chain].filter((unit) => {
        return unit.address.toLowerCase() === pool_addr.toLowerCase();
      })[0];
      selectToken(pool_item);
    } else {
      selectToken(poolList[selected_chain][0]);
    }
  }

  const addPool = (e, index) => {
    e.stopPropagation();
    filterData[index].added = true;
    addToCustomList(filterData[index]);
    setFilterData([...filterData]);
  }

  const deletePool = (e, index) => {
    e.stopPropagation();
    filterData[index].added = false;
    removeFromCustomList(filterData[index]);
    setFilterData([...filterData]);
  }

  const addToCustomList = (data) => {
    let _userSetting = JSON.parse(localStorage.getItem(userSettings));
    if (!_userSetting) {
      _userSetting = {};
    }
    if (!_userSetting[customPoolList]) {
      _userSetting[customPoolList] = {};
      _userSetting[customPoolList][selected_chain] = [];
    }
    const index = _userSetting[customPoolList][selected_chain].findIndex(each => each.address === data.address);
    if (index !== -1) return;
    _userSetting[customPoolList][selected_chain].push(data);
    localStorage.setItem(userSettings, JSON.stringify(_userSetting));
    dispatch({
      type: ADD_POOL,
      payload: data,
      chain: selected_chain
    });
  }

  const removeFromCustomList = (data) => {
    let _userSetting = JSON.parse(localStorage.getItem(userSettings));
    if (!_userSetting) {
      _userSetting = {};
    }
    if (!_userSetting[customPoolList]) {
      _userSetting[customPoolList] = {};
      _userSetting[customPoolList][selected_chain] = [];
    }
    const index = _userSetting[customPoolList][selected_chain].findIndex(each => each.address === data.address);
    if (index !== -1) {
      _userSetting[customPoolList][selected_chain].splice(index, 1);
      localStorage.setItem(userSettings, JSON.stringify(_userSetting));
    }
    dispatch({
      type: REMOVE_POOL,
      payload: data,
      chain: selected_chain
    });
  }

  const setInLimit = async (percentage) => {
    setLpPercentage(percentage);
    setValue(poolAmount * (percentage));
    await calculateOutput(totalLPTokens, poolAmount * percentage, weightA, tokenA, tokenB);
  }

  useEffect(() => {
    filterLP(query);
  }, [query, filterLP]);


  useEffect(() => {
    getStatusData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem])

  useEffect(() => {
    const result1 = uniList[selected_chain].filter((item) => {
      return item.symbol === selectedItem['symbols'][0];
    });

    setTokenA(result1[0]);

    const result2 = uniList[selected_chain].filter((item) => {
      return item.symbol === selectedItem['symbols'][1];
    });

    setTokenB(result2[0]);
    if (account) {
      const getInfo = async () => {
        const provider = await connector.getProvider();
        const pData = await getPoolData(
          provider,
          selectedItem["address"]
        );
        const weight1 = fromWeiVal(provider, pData["weights"][1], "18");
        setWeightA(weight1);
        setScale((weight1 * 100));

        let amount = await getPoolBalance(
          account,
          provider,
          selectedItem["address"]
        );
        let amount2 = await getPoolSupply(
          provider,
          selectedItem["address"]
        );
        setPoolAmount(amount);
        amount = numFormat(amount);
        setTotalLPTokens(amount2);
        await calculateOutput(
          amount2,
          (amount * lpPercentage),
          weight1,
          result1[0],
          result2[0]
        );
      };

      getInfo();
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    setFilterData(poolList[selected_chain]);
    setInitialTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selected_chain, account]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Grid
        container
        sx={{ maxWidth: "1220px" }}
        border={0}
        columnSpacing={{ xs: 0, sm: 0, md: 2, lg: 2 }}
      >
        <LiquidityCmp />
        <Grid item xs={12} sm={12} md={5} sx={{ mt: 2 }} className="home__mainC">
          <Item sx={{ pl: 3, pr: 3, pb: 2 }} style={{ backgroundColor: "#12122c", borderRadius: "10px" }} className="home__main">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "600", color: "white" }}
                gutterBottom
                style={{ textAlign: "left", margin: "12px 0px" }}
              >
                Remove Liquidity
              </Typography>
              <span onClick={() => setSetting(!setting)} style={{ color: "white", float: "right", cursor: "pointer", marginTop: "15px" }}>
                <Settings />
              </span>
            </div>
            {
              setting ?
                <div>
                  <div className="s" style={{ float: "left", width: "100%" }}>
                    <span style={{ float: "left", color: grayColor }}>
                      Max Slippage:
                    </span>
                    <span style={{ float: "right", color: grayColor }}>
                      <span onClick={() => { setSlippage(0.1); }} style={{ color: slippage === 0.1 ? "lightblue" : "", cursor: "pointer" }}>0.1%</span>
                      <span onClick={() => { setSlippage(0.5); }} style={{ paddingLeft: "5px", color: slippage === 0.5 ? "lightblue" : "", cursor: "pointer" }}>0.5%</span>
                      <span onClick={() => { setSlippage(1); }} style={{ paddingLeft: "5px", color: slippage === 1 ? "lightblue" : "", cursor: "pointer" }}>1%</span>
                      <span onClick={() => { setSlippageFlag(!slippageFlag); }} style={{ paddingLeft: "5px", cursor: "pointer" }}>custom</span>
                    </span>
                    {slippageFlag && <Slider size="small" value={slippage} aria-label="Default" min={0.1} max={10} step={0.1} valueLabelDisplay="auto" getAriaValueText={valueLabelFormat} valueLabelFormat={valueLabelFormat} onChange={(e) => setSlippage(Number(e.target.value))} />}
                  </div>
                  <br />
                  <br />
                </div>
                : null
            }
            <FormControl
              sx={{ m: 0 }}
              style={{ alignItems: "flex-start", display: "inline" }}
              variant="standard"
              className="flex"
            >
              <div style={{ backgroundColor: "#12122c", marginTop: "24px" }}>
                <Button
                  style={{ width: "50%", float: "left", border: "0px", padding: "9px 8px", backgroundColor: "#07071c", minHeight: "48px", fontSize: isMobile ? "9px" : "10px" }}
                  startIcon={
                    <div style={{ float: "left" }}>
                      <img
                        src={selectedItem["logoURLs"][0]}
                        alt=""
                        style={{ float: "left" }}
                        className="w-4 md:w-5"
                      />
                      <img
                        src={selectedItem["logoURLs"][1]}
                        alt=""
                        style={{ float: "left", marginLeft: -5 }}
                        className="w-4 md:w-5"
                      />
                    </div>
                  }
                  onClick={handleOpen}
                  className="w-36 sm:w-48"
                >
                  {selectedItem["symbols"][0]} -{" "}
                  {selectedItem["symbols"][1]} LP
                </Button>
                <BootstrapInput
                  id="demo-customized-textbox"
                  type="text"
                  value={value}
                  min={0}
                  style={{
                    color: "#FFFFFF",
                    width: "50%",
                    float: "left",
                    borderLeft: "1px solid white",
                    borderRadius: "14px",
                  }}
                  onChange={handleValue}
                  onKeyUp={handleValue}
                />
              </div>
            </FormControl>
            {/* </FormControl> */}
            <div style={{ float: "left", width: "100%", marginBottom:"20px" }}>
              <span style={{ float: "left", color: grayColor }}>
                Balance: {numFormat(poolAmount)}
              </span>
              <span style={{ float: "right", color: lpPercentage===0.25?"lightblue":"gray" }}>
                <span style={{ cursor: "pointer" }} onClick={() => setInLimit(0.25)}>25%</span>
                <span style={{ paddingLeft: "5px", cursor: "pointer", color: lpPercentage===0.5?"lightblue":"gray" }} onClick={() => setInLimit(0.5)}>50%</span>
                <span style={{ paddingLeft: "5px", cursor: "pointer", color: lpPercentage===0.75?"lightblue":"gray" }} onClick={() => setInLimit(0.75)}>75%</span>
                <span style={{ paddingLeft: "5px", cursor: "pointer", color: lpPercentage===1?"lightblue":"gray" }} onClick={() => setInLimit(1)}>100%</span>
              </span>
            </div>
            {/* Drop down 2 Start  */}
            <div style={{ float:"left", width:"100%" }}>
              <FormControl
                sx={{ m: 0 }}
                style={{ float:"left", width:"100%" }}
                variant="standard"
              >
                <div style={{ backgroundColor: "#12122c", marginTop: "15px" }}>
                  <Button
                    style={{ width: "50%", float: "left", border: "0px", padding: "9px 8px", fontSize: "13px", backgroundColor: "#07071c", color: "white", minHeight: 49 }}
                    startIcon={
                      <img
                        src={tokenB.logoURL}
                        alt=""
                        style={{ height: 30 }}
                      />
                    }
                    disabled={true}
                  >
                    {tokenB.symbol}
                  </Button>
                  <BootstrapInput
                    id="demo-customized-textbox"
                    type="text"
                    value={numFormat(outTokenB)}
                    style={{
                      color: "#FFFFFF",
                      width: "50%",
                      float: "left",
                      borderLeft: "1px solid white",
                      borderRadius: "14px",
                    }}
                    readOnly={true}
                  />
                </div>
              </FormControl>
              <FormControl
                sx={{ m: 0 }}
                style={{ float:"left", width:"100%", marginTop:"1px" }}
                variant="standard"
              >
                <div style={{ backgroundColor: "#12122c", marginBottom: "15px" }}>
                  <Button
                    style={{ width: "50%", float: "left", border: "0px", padding: "9px 8px", fontSize: "13px", backgroundColor: "#07071c", color: "white", minHeight: 49 }}
                    startIcon={
                      <img
                        src={tokenA.logoURL}
                        alt=""
                        style={{ height: 30 }}
                      />
                    }
                    disabled={true}
                  >
                    {tokenA.symbol}
                  </Button>
                  <BootstrapInput
                    id="demo-customized-textbox"
                    type="text"
                    value={numFormat(outTokenA)}
                    style={{
                      color: "#FFFFFF",
                      width: "50%",
                      float: "left",
                      borderLeft: "1px solid white",
                      borderRadius: "14px",
                    }}
                    readOnly={true}
                  />
                </div>
                <br />
              </FormControl>
            </div>
            <br />
            <br />
            <div style={{ color: "white", display: "block", textAlign: "left", marginTop: "9px", marginBottom: "12px" }}>
              <span>Ratio {numFormat(scale)}% {tokenB.symbol} - {numFormat(100 - scale)}% {tokenA.symbol}</span>
            </div>
            <div className="mt-2">
              <div className="s" sx={{ width: "100%" }}>
                <span style={{ float: "left", color: grayColor }}>
                  Change Ratio:
                </span>
              </div>
              <Slider
                size="small"
                value={scale}
                onChange={handleScale}
                step={0.1}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </div>
            <div style={{ float: "left", width: "100%", marginTop: "10px" }}>
              <span style={{ float: "left", color: "white" }}>
                Price Impact:
              </span>
              <div style={{ float: "right", display: "inline" }}>
                <span style={{ textAlign: "right", color: "white" }}>{priceImpact}%</span>
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="">
                {account &&
                  <Button
                    size={isMobile ? "small" : "large"}
                    variant="contained"
                    sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                    onClick={executeRemovePool}
                    style={{
                      background: (Number(value) === 0 || removing) ? "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)" : "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                      color: (Number(value) === 0 || removing) ? "#ddd" : "#fff",
                    }}
                    disabled={Number(value) === 0 || removing}
                  >
                    {Number(poolAmount) === 0 ? "No Liquidity Found" :
                      (Number(value) === 0
                        ? "Define your Liquidity Input"
                        : (removing ? "Removing Liquidity" : "Confirm")
                      )
                    }
                  </Button>
                }
                {!account &&
                  <Button
                    size={isMobile ? "small" : "large"}
                    variant="contained"
                    sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                    onClick={clickConWallet}
                    style={{
                      background: "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                      color: "#fff",
                      textAlign: "center",
                      marginRight: "8px",
                      maxHeight: 57
                    }}
                    className="btn-primary font-bold w-full dark:text-black flex-1"
                  >
                    {"Connect to Wallet"}
                  </Button>
                }
              </div>
            </div>
          </Item>
        </Grid>
        <Grid item xs={12} sm={12} md={7} sx={{ mt: 2 }} className="chart__main">
          <Item sx={{ pt: 3, pl: 3, pr: 3, pb: 2, mb: 2 }} style={{ backgroundColor: "#12122c", borderRadius: "10px" }} className="chart">
            <div className="flex-1 w-full mb-4">
              {formattedWeightsData[0] && (
                <h3 className="model-title mb-2" style={{ fontSize: 18, color: "white" }}>
                  <b>{formattedWeightsData[0]["token0"]}</b> weight
                </h3>
              )}
              <ResponsiveContainer width="95%" height={250}>
                <LineChart
                  width={isMobile ? 400 : 500}
                  height={200}
                  data={formattedWeightsData}
                  syncId="anyId"
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* <XAxis dataKey="name" /> */}
                  <YAxis ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} />
                  <Tooltip content={<CustomTooltip0 />} />
                  <Line
                    type="monotone"
                    dataKey="weight0"
                    stroke="#8884d8"
                    fill="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              {formattedWeightsData[0] && (
                <h3 className="model-title mb-2 mt-4" style={{ fontSize: 18, color: "white" }}>
                  <b>{formattedWeightsData[0]["token1"]}</b> weight
                </h3>
              )}
              <ResponsiveContainer width="95%" height={250}>
                <LineChart
                  width={isMobile ? 400 : 500}
                  height={200}
                  data={formattedWeightsData}
                  syncId="anyId"
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* <XAxis dataKey="name" /> */}
                  <YAxis ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} />
                  <Tooltip content={<CustomTooltip1 />} />
                  <Line
                    type="monotone"
                    dataKey="weight1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    strokeWidth={2}
                  />
                  {/* <Brush height={25} /> */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Item>
          {account &&
            <Item sx={{ pl: 3, pr: 3, pb: 2, pt: 3 }} style={{ backgroundColor: "#12122c", textAlign: "left", borderRadius: "10px" }} className="history">
              <span style={{ textAlign: "start", color: "white" }}>History:</span>
              <hr></hr>
              <History data={userERC20Transactions} />
            </Item>
          }
        </Grid>
        <Modal
          open={open}
          onClose={handleClose}
        >
          <StyledModal className="bg-modal">
            <h3 className="model-title mb-6" style={{ color: "#fff" }}>Remove Liquidity</h3>
            <TextField
              autoFocus={true}
              value={query}
              onChange={changeQuery}
              label="Search"
              inputProps={{
                type: "search",
                style: { color: "#bbb" },
              }}
              InputLabelProps={{
                style: { color: "#bbb" },
              }}
            />
            <hr className="my-6" />
            <ul className="flex flex-col gap-y-6 max-h-[250px]" style={{ overflowY: "scroll" }}>
              {filterData.map((item, index) => {
                if (item.custom) {
                  return (
                    <li
                      key={item["address"] + index}
                      className="flex justify-between items-center gap-x-1 thelist p-[5px]"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectToken(item)}
                    >
                      <div className="relative flex gap-x-1">
                        <div className="relative flex">
                          <img src={item["logoURLs"][0]} alt="" className="w-[32px] h-[32px]" />
                          <img
                            className="z-10 relative right-2 w-[32px] h-[32px]"
                            src={item["logoURLs"][1]}
                            alt=""
                          />
                        </div>
                        <p className="text-light-primary text-lg" >
                          {item["symbols"][0]} - {item["symbols"][1]} LP Token
                        </p>
                      </div>
                      {
                        item.added
                          ? <button className="text-light-primary text-md mr-2" onClick={(e) => deletePool(e, index)}>delete</button>
                          : <button className="text-light-primary text-md mr-2" onClick={(e) => addPool(e, index)}>add</button>
                      }
                    </li>
                  );
                } else {
                  return (
                    <li
                      key={item["address"] + index}
                      className="flex gap-x-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectToken(item)}
                    >
                      <div className="relative flex">
                        <img src={item["logoURLs"][0]} alt="" className="w-[32px] h-[32px]" />
                        <img
                          className="z-10 relative right-2 w-[32px] h-[32px]"
                          src={item["logoURLs"][1]}
                          alt=""
                        />
                      </div>
                      <p className="text-light-primary text-lg" >
                        {item["symbols"][0]} - {item["symbols"][1]} LP Token
                      </p>
                    </li>
                  );
                }
              })}
            </ul>
          </StyledModal>
        </Modal>
      </Grid>
    </div>
  );
}
