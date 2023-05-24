import Web3 from "web3";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { styled } from "@mui/material/styles";
import "./Navigation.css";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Menu,
  Fade,
  MenuItem,
  CircularProgress,
  Button,
  useMediaQuery
} from "@mui/material";
import { HelpOutline } from '@mui/icons-material';
import Popover from '@mui/material/Popover';
import { makeStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DashboardCmp from "./DashboardCmp";
import { getKavaERC20, getKavaTx } from "../../services/kavaAPI";
import { poolList, farmingPoolList } from "../../config/constants";
import { getHoldingInLP, getHoldingInFarms } from "../../config/web3";
import routerABI from "../../assets/abi/router";
import abiDecoder from "../../config/abiDecoder";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "theme.palette.text.secondary",
}));

export const useStyles = makeStyles(() => ({
  menu: {
    "& .MuiPaper-root": {
      backgroundColor: "#07071c",
      color: "white"
    }
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: "#07071c",
      color: "white"
    }
  }
}));

export default function UDashboard() {
  const { account, connector } = useWeb3React();
  const selected_chain = useSelector((state) => state.selectedChain);
  const uniList = useSelector((state) => state.tokenList);

  const [pools, setPools] = useState({ isLoad: false, data: [], total: 0 });
  const [userERC20, setUserERC20] = useState({ isLoad: false, data: [], total: 0 });
  const [userERC20Transactions, setUserERC20Transactions] = useState({ isLoad: false, data: [] });
  const [popupPool, setPopupPool] = useState("");
  const [popupToken, setPopupToken] = useState("");
  const [popupTokenSymbol, setPopupTokenSymbol] = useState("");
  const [colorFlags, setColorFlags] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorEl1, setAnchorEl1] = React.useState(null);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const [anchorEl3, setAnchorEl3] = React.useState(null);
  const open = Boolean(anchorEl);
  const open1 = Boolean(anchorEl1);
  const open2 = Boolean(anchorEl2);
  const open3 = Boolean(anchorEl3);
  
  const classes = useStyles();

  const isMobile = useMediaQuery("(max-width:600px)");

  const handleClick = (event, pool_addr) => {
    setAnchorEl(event.currentTarget);
    setPopupPool(pool_addr);
  };

  const handleClick1 = (event, token_addr, symbol) => {
    setAnchorEl1(event.currentTarget);
    setPopupToken(token_addr);
    setPopupTokenSymbol(symbol);
  };

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  }

  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClose1 = () => {
    setAnchorEl1(null);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  }

  const handleClose3 = () => {
    setAnchorEl3(null);
  }

  const fetchUserData = async () => {
    const provider = await connector.getProvider();
    const web3 = new Web3(provider);
    abiDecoder.addABI(routerABI);
    // Get Kava Token
    getKavaERC20(account).then(async (response) => {
      let filteredTokens = response.filter((item) => {
        return item.symbol !== "Gamut-LP"
      });
      let totalTokemAmount = 0;
      filteredTokens.map(async (item) => {
        item.eth_bal = numFormat(item.balance / 10 ** item.decimals);
        await axios
          .get(
            `https://coins.llama.fi/prices/current/kava:${item.contractAddress}?searchWidth=6h`
          )
          .then(async (response) => {
            totalTokemAmount += (response?.data?.coins[Object.keys(response?.data?.coins)[0]]) ? response?.data?.coins[Object.keys(response?.data?.coins)[0]]?.price * item.eth_bal : 0;
          });
      });
      let coinAmount = await web3.eth.getBalance(account);
      coinAmount = numFormat(coinAmount / 10 ** 18);

      filteredTokens.splice(0, 0, { name: "Kava Coin", contractAddress: account, eth_bal: coinAmount, symbol: "KAVA", price: response?.data?.coins[Object.keys(response?.data?.coins)[0]]?.price });

      await axios
        .get(
          `https://coins.llama.fi/prices/current/kava:0x0000000000000000000000000000000000000000?searchWidth=6h`
        )
        .then(async (response) => {
          totalTokemAmount += response?.data?.coins[Object.keys(response?.data?.coins)[0]]?.price * coinAmount;
          console.log(response?.data?.coins[Object.keys(response?.data?.coins)[0]]?.price * coinAmount);
        });
      setUserERC20({ isLoad: true, data: filteredTokens, total: numFormat(totalTokemAmount) });
    });
    getKavaTx(account, 35).then(async (response) => {
      let filteredThx = response;

      await filteredThx.map((item) => {
        item.raw_input = abiDecoder.decodeMethod(item.input);
      });

      filteredThx = await filteredThx.filter((item) => {
        return item.raw_input !== undefined;
      });

      await filteredThx.map(async (item) => {
        item.raw_input = abiDecoder.decodeMethod(item.input);
        if (item.raw_input === undefined) {
          item.action_type = 3;
        } else if (item.raw_input.name === "swap") {
          let item_token1 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[0].value.tokenIn.toLowerCase();
          });
          let item_token2 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[0].value.tokenOut.toLowerCase();
          });
          if (item_token1 && item_token2) {
            item.action_type = 0;
            item.token1_symbol = item_token1[0].symbol;
            item.token2_symbol = item_token2[0].symbol;
            web3.eth.getTransactionReceipt(item.hash, function (e, receipt) {
              const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
              item.amount1 = numFormat(decodedLogs[0].events[2].value / 10 ** item_token1[0].decimals);
              item.amount2 = numFormat(decodedLogs[0].events[3].value / 10 ** item_token2[0].decimals);
            });
          } else {
            item.action_type = 0;
            item.token1_symbol = "Unknown";
            item.token2_symbol = "Unknown";
            item.amount1 = 0;
            item.amount2 = 0;
          }
        } else if (item.raw_input.name === "batchSwap") {
          let item_token1 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value[0].toLowerCase();
          });
          let item_token2 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value[item.raw_input.params[1].value.length - 1].toLowerCase();
          });
          if (item_token1 && item_token2) {
            item.action_type = 0;
            item.token1_symbol = item_token1[0].symbol;
            item.token2_symbol = item_token2[0].symbol;
            web3.eth.getTransactionReceipt(item.hash, function (e, receipt) {
              const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
              item.amount1 = numFormat(decodedLogs[0].events[2].value / 10 ** item_token1[0].decimals);
              item.amount2 = numFormat(decodedLogs[decodedLogs.length - 1].events[3].value / 10 ** item_token2[0].decimals);
            });
          } else {
            item.action_type = 0;
            item.token1_symbol = "Unknown";
            item.token2_symbol = "Unknown";
            item.amount1 = 0;
            item.amount2 = 0;
          }
        } else if (item.raw_input.name === "joinPool") {
          let item_token1 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[0].toLowerCase();
          });
          let item_token2 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[1].toLowerCase();
          });
          if (item_token1 && item_token2) {
            let userDT = [];
            try {
              userDT = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256[]", "uint256"], item.raw_input.params[1].value.userData);
              item.amount1 = numFormat((userDT[1][0]._hex).toString() / 10 ** item_token1[0].decimals);
              item.amount2 = numFormat((userDT[1][1]._hex).toString() / 10 ** item_token2[0].decimals);
            } catch (e) {
              userDT = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256", "uint256", "uint256"], item.raw_input.params[1].value.userData);
              item.amount1 = numFormat((userDT[1]._hex).toString() / 10 ** item_token1[0].decimals);
              item.amount2 = numFormat((userDT[2]._hex).toString() / 10 ** item_token2[0].decimals);
            }
            item.action_type = 1;
            item.token1_symbol = item_token1[0].symbol;
            item.token2_symbol = item_token2[0].symbol;
          } else {
            item.action_type = 1;
            item.token1_symbol = "Unknown";
            item.token2_symbol = "Unknown";
            item.amount1 = 0;
            item.amount2 = 0;
          }
        } else if (item.raw_input.name === "exitPool") {
          let item_token1 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[0].toLowerCase();
          });
          let item_token2 = uniList[selected_chain].filter((unit) => {
            return unit.address.toLowerCase() === item.raw_input.params[1].value.tokens[1].toLowerCase();
          });
          if (item_token1 && item_token2) {
            let userDT = ethers.utils.defaultAbiCoder.decode(["uint256", "uint256"], item.raw_input.params[1].value.userData);
            web3.eth.getTransactionReceipt(item.hash, function (e, receipt) {
              const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
              item.amount1 = numFormat(decodedLogs[0].events[2].value[0] / 10 ** item_token1[0].decimals);
              item.amount2 = numFormat(decodedLogs[0].events[2].value[1] / 10 ** item_token2[0].decimals);
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
        } else {
          item.action_type = 3;
        }
      });
      filteredThx.filter((item) => {
        return item.action_type !== 3;
      });
      await setUserERC20Transactions({ isLoad: true, data: filteredThx })
    });
  };

  const handleWalletTVL = async () => {
    const provider = await connector.getProvider();
    const UserLPTokens = await getHoldingInLP(
      provider,
      account,
      poolList[selected_chain]
    );

    const userStakedLPTokens = await getHoldingInFarms(
      provider,
      account,
      farmingPoolList[selected_chain]
    );

    let totalLP = 0;
    let totalStaked = 0;
    let poolFlags = [];
    UserLPTokens[1]?.map(
      (pool) => {
        poolFlags.push(Math.random() < 0.5 ? true : false);
        totalLP += parseFloat(pool?.totalSupply);
      }
    );
    userStakedLPTokens?.map(
      (farm) => {
        poolFlags.push(Math.random() < 0.5 ? true : false);
        totalStaked += parseFloat(farm?.stakedValUSD);
      }
    );
    setColorFlags(poolFlags);
    setPools({ isLoad: true, data1: UserLPTokens[1], data2: userStakedLPTokens, total1: numFormat(totalLP), total2: numFormat(totalStaked) });
  };

  const numFormat = (val) => {
    if (Math.abs(val) > 1)
      return Number(val).toFixed(4) * 1;
    else if (Math.abs(val) > 0.001)
      return Number(val).toFixed(6) * 1;
    else if (Math.abs(val) > 0.00001)
      return Number(val).toFixed(8) * 1;
    else
      return Number(val).toFixed(8) * 1;
  }

  const clickConWallet = () => {
    document.getElementById("connect_wallet_btn").click();
  };

  useEffect(() => {
    if (account === undefined) return;
    const getInfo = async () => {
      fetchUserData();
      setTimeout(function () {
        handleWalletTVL();
      }, 1000);
    };
    getInfo();
  }, [account]);

  useEffect(() => {
    setInterval(function () {
      let ranNum = Math.floor(Math.random() * colorFlags.length * 2);
      if (ranNum < colorFlags.length) {
        let newArr = [...colorFlags];
        newArr[ranNum] = Math.random() > 0.5 ? true : false;
        setColorFlags(newArr);
      }
    }, 10000);
  }, [account, pools]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Grid
        container
        sx={{ maxWidth: "1220px" }}
        border={0}
        columnSpacing={{ xs: 0, sm: 0, md: 2, lg: 2 }}
      >
        <DashboardCmp />
        {/* Column 1 */}
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{ mt: 2, flexDirection: "column" }}
          className="home__mainC"
        >
          <div style={{ width: "100%" }}>
            <h3 className="text-white text-xl text-left font-semibold mb-2 ml-2">
              Liquidity Value: ${pools.total1}
            </h3>
          </div>
          <Item
            sx={{ pt: 2, pl: 1, pr: 1, pb: 2 }}
            style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            className=""
          >
            <TableContainer component={Paper} style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px" }}>
              <Table sx={{ minWidth: 550 }} aria-label="simple table">
                <TableHead>
                  <TableRow style={{ color: "white" }}>
                    <TableCell align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      #
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      Pools
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      User LP Tokens
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      APR
                    </TableCell>
                    <TableCell align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      <HelpOutline
                        aria-owns={open2 ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handleClick2}
                        onMouseLeave={handleClose2}
                      />
                      <Popover
                        sx={{
                          pointerEvents: 'none'
                        }}
                        open={open2}
                        anchorEl={anchorEl2}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        onClose={handleClose2}
                        disableRestoreFocus
                        className={classes.popover}
                      >
                        <Typography sx={{ p: 1, fontSize: 13 }}>Shows whether the APR <br />is currently increasing <br />or decreasing.</Typography>
                      </Popover>
                    </TableCell>
                    <TableCell align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                {(account && pools.isLoad) && (
                  <TableBody>
                    {pools?.data1?.map((pool, poolIndex) => {
                      return (
                        <TableRow
                          key={poolIndex + "list"}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row" align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            {poolIndex + 1}
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            <div className="flex justify-left">
                              <img
                                src={
                                  pool?.logoURLs[0]
                                }
                                alt=""
                                className="h-5 w-5"
                              />
                              <img
                                className="z-10 relative right-2 h-5 w-5"
                                src={
                                  pool?.logoURLs[1]
                                }
                                alt=""
                              />
                              <p>
                                {
                                  pool?.symbols[0]
                                }
                                {" "}/{" "}
                                {
                                  pool?.symbols[1]
                                }
                              </p>
                            </div>
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            <h3 className="font-medium">

                              ${numFormat(pool?.totalSupply)}
                            </h3>
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            {numFormat(pool?.apr)}%{" "}
                          </TableCell>
                          <TableCell align="center">
                            <span style={{ color: colorFlags[poolIndex] ? "red" : "green" }}>+/-</span>
                          </TableCell>
                          <TableCell align="center" style={{ paddingTop: 5, paddingBottom: 5 }}>
                            <IconButton
                              aria-label="more"
                              id="long-button"
                              style={{ color: "white" }}
                              aria-controls={open ? 'long-menu' : undefined}
                              aria-expanded={open ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={(e) => handleClick(e, pool.address.toLowerCase())}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              id="fade-menu"
                              MenuListProps={{
                                'aria-labelledby': 'fade-button',
                              }}
                              anchorEl={anchorEl}
                              open={open}
                              onClose={handleClose}
                              TransitionComponent={Fade}
                              className={classes.menu}
                            >
                              <Link to={"/add_liquidity?pool=" + popupPool}>
                                <MenuItem onClick={handleClose}>Add Pool</MenuItem>
                              </Link>
                              <Link to={"/remove_liquidity?pool=" + popupPool}>
                                <MenuItem onClick={handleClose}>Remove Pool</MenuItem>
                              </Link>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                )}
                {(account && !pools.isLoad) &&
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <div style={{ minHeight: "170px", textAlign: "center" }}>
                          <CircularProgress style={{ marginTop: "65px" }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                }
                {!account &&
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
                      </TableCell>
                    </TableRow>
                  </TableBody>
                }
              </Table>
            </TableContainer >
          </Item>
          <div style={{ width: "100%" }}>
            <h3 className="text-white text-xl text-left font-semibold mb-2 ml-2 mt-5">
              Total Staked Value: ${pools.total2}
            </h3>
          </div>
          <Item
            sx={{ pt: 2, pl: 1, pr: 1, pb: 2 }}
            style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            className=""
          >
            <TableContainer component={Paper} style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px" }}>
              <Table sx={{ minWidth: 550, mt: 2 }} aria-label="simple table">
                <TableHead>
                  <TableRow style={{ color: "white" }}>
                    <TableCell align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      #
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      Pools
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      LP Staked
                    </TableCell>
                    <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      Pending Reward
                    </TableCell>
                    <TableCell align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                {(account && pools.isLoad) && (
                  <TableBody>
                    {pools?.data2?.map((farm, farmIndex) => {
                      return (
                        <TableRow
                          key={farmIndex + "list"}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row" align="center" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            {farmIndex + 1}
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            <div className="flex justify-left">
                              <img
                                src={
                                  farm?.logoURLs[0]
                                }
                                alt=""
                                className="h-5 w-5"
                              />
                              <img
                                className="z-10 relative right-2 h-5 w-5"
                                src={
                                  farm?.logoURLs[1]
                                }
                                alt=""
                              />
                              <p>
                                {
                                  farm?.symbols[0]
                                }
                                {" "}/{" "}
                                {
                                  farm?.symbols[1]
                                }
                              </p>
                            </div>
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            <h3 className="font-medium">

                              ${numFormat(farm?.stakedValUSD)}
                            </h3>
                          </TableCell>
                          <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                            ${numFormat(farm?.pendingRewardUSD)}
                          </TableCell>
                          <TableCell align="center" style={{ paddingTop: 5, paddingBottom: 5 }}>
                            <IconButton
                              aria-label="more"
                              id="long-button"
                              style={{ color: "white" }}
                              aria-controls={open ? 'long-menu' : undefined}
                              aria-expanded={open ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={handleClick3}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              id="fade-menu"
                              MenuListProps={{
                                'aria-labelledby': 'fade-button',
                              }}
                              anchorEl={anchorEl3}
                              open={open3}
                              onClose={handleClose3}
                              TransitionComponent={Fade}
                              className={classes.menu}
                            >
                              <Link to={"/staking_pool"}>
                                <MenuItem onClick={handleClose3}>Claim Reward</MenuItem>
                              </Link>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                )}
                {(account && !pools.isLoad) &&
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <div style={{ minHeight: "170px", textAlign: "center" }}>
                          <CircularProgress style={{ marginTop: "65px" }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                }
                {!account &&
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
                      </TableCell>
                    </TableRow>
                  </TableBody>
                }
              </Table>
            </TableContainer >
          </Item>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{ mt: 2, flexDirection: "column" }}
          className="home__mainC"
        >
          <h3
            xs={12}
            sm={12}
            md={12}
            className="text-white text-xl text-left font-semibold mb-2 ml-2 w-full">
            Tokens Value: ${userERC20.total}
          </h3>
          <Item
            xs={12}
            sm={12}
            md={12}
            sx={{ pt: 2, pl: 1, pr: 1, pb: 2 }}
            style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            className=""
          >
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
              className="text-white"
            >
              {/* Table */}
              <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg" style={{ boxShadow: "0px 0px 0px 0px" }}>
                <TableContainer component={Paper} style={{ backgroundColor: "transparent" }}>
                  <Table sx={{ minWidth: 550 }} aria-label="simple table">
                    <TableHead>
                      <TableRow style={{ color: "white" }}>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Token
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Address
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Balance
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    {(account && userERC20.isLoad) &&
                      <TableBody>
                        {userERC20.data?.map((token, index) => (
                          <TableRow
                            key={token?.name + index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell align="left" style={{ paddingTop: 10, paddingBottom: 10 }}>
                              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  window.open(
                                    "https://explorer.kava.io/address/" +
                                    token?.contractAddress + "/transactions",
                                    "_blank"
                                  )
                                }
                                className="font-medium text-blue-600 dark:text-blue-500">
                                {token?.name}
                              </span>
                            </TableCell>
                            <TableCell align="left" style={{ color: "white", paddingTop: 10, paddingBottom: 10 }}>
                              {token?.contractAddress?.slice(0, 6) +
                                "..." +
                                token?.contractAddress?.slice(38, -1)}
                            </TableCell>
                            <TableCell component="th" scope="row" align="left" style={{ color: "white", paddingTop: 15, paddingBottom: 15 }}>
                              {token?.eth_bal} {token?.symbol}
                            </TableCell>
                            <TableCell align="center" style={{ paddingTop: 5, paddingBottom: 5 }}>
                              <IconButton
                                aria-label="more"
                                id="long-button"
                                style={{ color: "white" }}
                                aria-controls={open1 ? 'long-menu' : undefined}
                                aria-expanded={open1 ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={(e) => handleClick1(e, token?.contractAddress.toLowerCase(), token.symbol)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                id="fade-menu"
                                MenuListProps={{
                                  'aria-labelledby': 'fade-button',
                                }}
                                anchorEl={anchorEl1}
                                open={open1}
                                onClose={handleClose1}
                                TransitionComponent={Fade}
                                className={classes.menu}
                              >
                                <Link to={"/?token=" + popupToken}>
                                  <MenuItem onClick={handleClose1}>Swap {popupTokenSymbol}</MenuItem>
                                </Link>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    }
                    {(account && !userERC20.isLoad) &&
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <div style={{ minHeight: "170px", textAlign: "center" }}>
                              <CircularProgress style={{ marginTop: "65px" }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    }
                    {!account &&
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
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
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    }
                  </Table>
                </TableContainer>
              </div>
            </div>
          </Item>
        </Grid>
        {/* Transaction Table */}
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          sx={{ mt: 2, flexDirection: "column" }}
          className="home__mainC"
        >
          <h3 className="text-white text-xl text-left font-semibold mb-2 ml-2">
            Transactions
          </h3>
          <Item
            // sx={{ pl: 3, pr: 3, pb: 2 }}
            style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            className=""
          >
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
              className="text-white"
            >
              {/* Table */}
              <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg" style={{ boxShadow: "0px 0px 0px 0px" }}>
                <TableContainer component={Paper} style={{ backgroundColor: "transparent" }}>
                  <Table sx={{ minWidth: 600 }} aria-label="simple table">
                    <TableHead >
                      <TableRow style={{ color: "white" }}>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Action
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Block
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Token Amount
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Token Amount
                        </TableCell>
                        <TableCell align="left" style={{ color: "white", paddingTop: 5, paddingBottom: 5 }}>
                          Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    {(account && userERC20Transactions.isLoad) &&
                      <TableBody>
                        {userERC20Transactions.data?.map((token, index) => (
                          <TableRow
                            key={token?.blockHash + index} // blockNumber
                            onClick={() =>
                              window.open(
                                "https://explorer.kava.io/tx/" +
                                token?.hash +
                                "/internal-transactions",
                                "_blank"
                              )
                            }
                            style={{ cursor: "pointer" }}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            {token.action_type === 0 &&
                              <TableCell component="th" scope="row" align="left" style={{ paddingTop: 15, paddingBottom: 15 }}>
                                <span className="font-medium text-blue-600 dark:text-blue-500">SWAP {token.token1_symbol} for {token.token2_symbol}</span>
                              </TableCell>
                            }
                            {token.action_type === 1 &&
                              <TableCell component="th" scope="row" align="left" style={{ paddingTop: 15, paddingBottom: 15 }}>
                                <span className="font-medium text-blue-600 dark:text-blue-500">ADD {token.token1_symbol} & {token.token2_symbol}</span>
                              </TableCell>
                            }
                            {token.action_type === 2 &&
                              <TableCell component="th" scope="row" align="left" style={{ paddingTop: 15, paddingBottom: 15 }}>
                                <span className="font-medium text-blue-600 dark:text-blue-500">REMOVE {token.token1_symbol} & {token.token2_symbol}</span>
                              </TableCell>
                            }
                            <TableCell align="left" style={{ color: "white", paddingTop: 10, paddingBottom: 10 }}>
                              {token?.blockNumber}
                            </TableCell>
                            <TableCell align="left" style={{ color: "white", paddingTop: 10, paddingBottom: 10 }}>
                              {token.amount1 ? token.amount1 : "..."} {token?.token1_symbol}
                            </TableCell>
                            <TableCell align="left" style={{ color: "white", paddingTop: 10, paddingBottom: 10 }}>
                              {token.amount2 ? token.amount2 : "..."} {token?.token2_symbol}
                            </TableCell>
                            <TableCell align="left" style={{ color: "white", paddingTop: 10, paddingBottom: 10 }}>
                              {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(token?.timeStamp * 1000)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    }
                    {(account && !userERC20Transactions.isLoad) &&
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <div style={{ minHeight: "170px", textAlign: "center" }}>
                              <CircularProgress style={{ marginTop: "65px" }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    }
                    {!account &&
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
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
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    }
                  </Table>
                </TableContainer>
              </div>
            </div>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}
