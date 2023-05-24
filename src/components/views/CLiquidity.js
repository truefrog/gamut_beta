import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Grid,
  useMediaQuery,
  Button,
  FormControl,
  InputBase,
  Typography,
  Slider,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {
  AddCircleOutline,
} from "@mui/icons-material";
import {
  getPoolAddress,
  getTokenBalance,
  tokenApproval,
  approveToken,
  getPoolData,
  createPool,
  initAddPool,
  numFormat
} from "../../config/web3";
import LiquidityCmp from "./LiquidityCmp";
import { contractAddresses } from "../../config/constants";
import TokenList from "./TokenList";

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

export default function CLiquidity() {
  const grayColor = "#6d6d7d";
  const selected_chain = useSelector((state) => state.selectedChain);
  const uniList = useSelector((state) => state.tokenList);
  const { account, connector } = useWeb3React();

  const [mopen, setMopen] = useState(false);
  const [selected, setSelected] = React.useState(0);
  const [inToken, setInToken] = useState(uniList[selected_chain][0]);
  const [outToken, setOutToken] = useState(uniList[selected_chain][1]);
  const [inVal, setInVal] = useState(0);
  const [outVal, setOutVal] = useState(0);
  const [inBal, setInBal] = useState(0);
  const [outBal, setOutBal] = useState(0);
  const [position1, setPosition1] = useState(0);
  const [position2, setPosition2] = useState(0);
  const [tradingFee, setTradingFee] = useState(0.1);
  const [pairStatus, setPairStatus] = useState(0);
  const [weight, setWeight] = useState(50);
  const [limitedOut, setLimitedout] = useState(false);
  const [creating, setCreating] = useState(false);

  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleMopen = (val) => {
    setSelected(val);
    setMopen(true);
  };

  const handleClose = () => setMopen(false);

  const selectToken = async (token, selected) => {
    handleClose();
    if (selected === 0) {
      setInToken(token);
    } else if (selected === 1) {
      setOutToken(token);
    }
    if (account) {
      const provider = await connector.getProvider();
      const bal = await getTokenBalance(provider, token["address"], account);
      if (selected === 0) {
        setInBal(bal);
        let inLimBal = bal ? bal.toString().replaceAll(",", "") : 0;
        let outLimBal = outBal ? outBal.toString().replaceAll(",", "") : 0;
        if (
          Number(inVal) > 0 &&
          Number(outVal) > 0 &&
          Number(inVal) <= Number(inLimBal) &&
          Number(outVal) <= Number(outLimBal)
        )
          setLimitedout(false);
        else setLimitedout(true);
        await checkPairStatus(token['address'].toLowerCase(), outToken['address'].toLowerCase());
      } else if (selected === 1) {
        setOutBal(bal);
        let inLimBal = inBal ? inBal.toString().replaceAll(",", "") : 0;
        let outLimBal = bal ? bal.toString().replaceAll(",", "") : 0;
        if (
          Number(inVal) > 0 &&
          Number(outVal) > 0 &&
          Number(inVal) <= Number(inLimBal) &&
          Number(outVal) <= Number(outLimBal)
        )
          setLimitedout(false);
        else setLimitedout(true);
        await checkPairStatus(inToken['address'].toLowerCase(), token['address'].toLowerCase());
      }
    }
  };

  const checkPairStatus = async (token1Addr, token2Addr) => {
    const provider = await connector.getProvider();
    if (token1Addr === token2Addr
      || (token1Addr === "0x0000000000000000000000000000000000000000" && token2Addr.toLowerCase() === "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b".toLowerCase())
      || (token2Addr === "0x0000000000000000000000000000000000000000" && token1Addr.toLowerCase() === "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b".toLowerCase()))
      setPairStatus(1);
    else {
      try {
        const poolAddr = await getPoolAddress(
          provider,
          token1Addr === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : token1Addr,
          token2Addr === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : token2Addr,
          contractAddresses[selected_chain]["hedgeFactory"]
        );
        if (poolAddr === "0x0000000000000000000000000000000000000000")
          setPairStatus(2);
        else {
          const poolData = await getPoolData(provider, poolAddr);
          if (Number(poolData.balances[0]) === 0) {
            let approved1 = 0;
            if (token1Addr !== "0x0000000000000000000000000000000000000000")
              approved1 = await tokenApproval(account, provider, token1Addr, contractAddresses[selected_chain]["router"]);
            if (approved1 < inVal && token1Addr !== "0x0000000000000000000000000000000000000000")
              setPairStatus(3);
            else {
              let approved2 = 0;
              if (token2Addr !== "0x0000000000000000000000000000000000000000")
                approved2 = await tokenApproval(account, provider, token2Addr, contractAddresses[selected_chain]["router"]);
              if (approved2 < outVal && token2Addr !== "0x0000000000000000000000000000000000000000")
                setPairStatus(4)
              else {
                setPairStatus(5);
              }
            }
          } else {
            setPairStatus(0);
          }
        }
      } catch (error) {
        setPairStatus(2);
      }
    }
  }

  const handleInVal = (e) => {
    let e_val = e.target.value;
    if (e_val.charAt(0) === "0" && e_val.charAt(1) !== "." && e_val.length > 1)
      e_val = e_val.substr(1);
    setInVal(e_val);
    let inLimBal = inBal.toString().replaceAll(",", "");
    let outLimBal = outBal.toString().replaceAll(",", "");
    if (
      Number(e_val) > 0 &&
      Number(outVal) > 0 &&
      Number(e_val) <= Number(inLimBal) &&
      Number(outVal) <= Number(outLimBal)
    )
      setLimitedout(false);
    else setLimitedout(true);
  }

  const handleOutVal = (e) => {
    let e_val = e.target.value;
    if (e_val.charAt(0) === "0" && e_val.charAt(1) !== "." && e_val.length > 1)
      e_val = e_val.substr(1);
    setOutVal(e_val);
    let inLimBal = inBal.toString().replaceAll(",", "");
    let outLimBal = outBal.toString().replaceAll(",", "");
    if (
      Number(e_val) > 0 &&
      Number(inVal) > 0 &&
      Number(e_val) <= Number(outLimBal) &&
      Number(inVal) <= Number(inLimBal)
    )
      setLimitedout(false);
    else setLimitedout(true);
  }

  const executeCreatePool = async () => {
    const provider = await connector.getProvider();
    try {
      if (pairStatus === 2) {
        setCreating(true);
        await createPool(account, provider,
          inToken["address"] === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : inToken["address"],
          outToken["address"] === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : outToken["address"],
          weight / 100, 1 - weight / 100, contractAddresses[selected_chain]["hedgeFactory"], tradingFee);
        setCreating(false);
        checkPairStatus(inToken['address'].toLowerCase(), outToken['address'].toLowerCase());
      }
      if (pairStatus === 3) {
        setCreating(true);
        await approveToken(account, provider, inToken["address"], inVal * 1.1, contractAddresses[selected_chain]["router"]);
        setCreating(false);
        checkPairStatus(inToken['address'].toLowerCase(), outToken['address'].toLowerCase());
      }
      if (pairStatus === 4) {
        setCreating(true);
        await approveToken(account, provider, outToken["address"], outVal * 1.1, contractAddresses[selected_chain]["router"]);
        setCreating(false);
        checkPairStatus(inToken['address'].toLowerCase(), outToken['address'].toLowerCase());
      }
      if (pairStatus === 5) {
        setCreating(true);
        const poolAddr = await getPoolAddress(
          provider,
          inToken["address"] === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : inToken["address"],
          outToken["address"] === "0x0000000000000000000000000000000000000000" ? "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" : outToken["address"],
          contractAddresses[selected_chain]["hedgeFactory"]
        );
        const poolData = await getPoolData(provider, poolAddr);
        if (poolData.tokens[0].toLowerCase() === inToken["address"].toLowerCase()
          ||
          (inToken["address"] === "0x0000000000000000000000000000000000000000" && poolData.tokens[0].toLowerCase() === "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b".toLowerCase())) {
          await initAddPool(account, provider, outToken["address"], inToken["address"], outVal, inVal, contractAddresses[selected_chain]["router"]);
        }
        else {
          await initAddPool(account, provider, inToken["address"], outToken["address"], inVal, outVal, contractAddresses[selected_chain]["router"]);
        }
        setCreating(false);
        checkPairStatus(inToken['address'].toLowerCase(), outToken['address'].toLowerCase());
      }

    } catch (e) {
      console.log(e.message);
    }
  }

  const setInLimit = async (position) => {
    if (inBal) {
      setPosition1(position);
      let val1 = inBal ? inBal.toString().replaceAll(",", "") : 0;
      setInVal(val1 / position);
      setLimitedout(false);
    }
  };

  const setOutLimit = async (position) => {
    if (outBal) {
      setPosition2(position);
      let val2 = outBal ? outBal.toString().replaceAll(",", "") : 0;
      setOutVal(val2 / position);
      setLimitedout(false);
    }
  };

  const clickConWallet = () => {
    document.getElementById("connect_wallet_btn").click();
  };

  useEffect(() => {
    selectToken(uniList[selected_chain][0], 0);
    selectToken(uniList[selected_chain][1], 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, dispatch, selected_chain]);

  useEffect(() => {
    if (account) {
      checkPairStatus(inToken['address'].toLowerCase(), outToken['address'].toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inVal, outVal]);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingBottom: "30px" }}>
      <Grid
        container
        sx={{ maxWidth: "1220px" }}
        border={0}
        columnSpacing={{ xs: 0, sm: 0, md: 2, lg: 2 }}
      >
        <LiquidityCmp />
        <Grid item xs={12} sm={12} md={5} sx={{ mt: 2 }} className="home__mainC">
          <Item sx={{ pl: 3, pr: 3, pb: 2 }} style={{ backgroundColor: "#12122c", borderRadius: "10px", float: "left", width: "100%" }} className="home__main">

            <Typography
              variant="h5"
              sx={{ fontWeight: "600", color: "white" }}
              gutterBottom
              style={{ textAlign: "left", margin: "12px 0px" }}

            >
              Create Pool
            </Typography>

            {/* Drop down Start  */}

            <FormControl
              sx={{ m: 0 }}
              style={{ alignItems: "flex-start", display: "inline" }}
              variant="standard"
            >

              <div style={{ backgroundColor: "#12122c" }}>
                <Button
                  style={{ width: "40%", float: "left", border: "0px", padding: "9px 8px", fontSize: "13px", backgroundColor: "#07071c", color: "white", minHeight: 49 }}
                  onClick={() => handleMopen(0)}
                  startIcon={
                    <img
                      alt=""
                      src={inToken['logoURL']}
                      style={{ height: 30 }}
                    />
                  }
                >
                  {inToken['symbol']}
                </Button>
                <BootstrapInput
                  type="number"
                  value={numFormat(inVal)}
                  onChange={handleInVal}
                  inputProps={{ min: 0, max: Number(inBal.toString().replaceAll(",", "")) }}
                  readOnly={(pairStatus === 2 || pairStatus === 3 || pairStatus === 4 || pairStatus === 5) ? false : true}
                  style={{
                    color: "#FFFFFF",
                    width: "60%",
                    float: "left",
                    borderLeft: "1px solid white",
                    borderRadius: "14px",
                  }}
                />
              </div>
              <div style={{ display: "block", float: "left", width: "100%" }}>
                <span style={{ float: "left", color: grayColor }}>
                  Balance: {numFormat(inBal)}
                </span>
                <span style={{ float: "right", color: grayColor }}>
                  <span style={{ cursor: "pointer", color: position1 === 4 ? "lightblue" : "gray" }} onClick={() => setInLimit(4)}>25%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position1 === 2 ? "lightblue" : "gray" }} onClick={() => setInLimit(2)}>50%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position1 === 1.3333 ? "lightblue" : "gray" }} onClick={() => setInLimit(1.3333)}>75%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position1 === 1 ? "lightblue" : "gray" }} onClick={() => setInLimit(1)}>100%</span>
                </span>
              </div>
            </FormControl>
            <div>
              <AddCircleOutline
                sx={{ color: "white", fontSize: "32px", mt: 1, mb: 3 }}
              />
            </div>
            <FormControl
              sx={{ m: 0 }}
              style={{ alignItems: "flex-start", display: "inline" }}
              variant="standard"
            >
              <div>
                <Button
                  style={{ width: "40%", float: "left", border: "0px", padding: "9px 8px", fontSize: "13px", backgroundColor: "#07071c", color: "white", minHeight: 49 }}
                  onClick={() => handleMopen(1)}
                  startIcon={
                    <img
                      alt=""
                      src={outToken['logoURL']}
                      style={{ height: 30 }}
                    />
                  }
                >
                  {outToken['symbol']}
                </Button>
                <BootstrapInput
                  type="number"
                  value={numFormat(outVal)}
                  onChange={handleOutVal}
                  min={0}
                  max={Number(outBal.toString().replaceAll(",", ""))}
                  readOnly={(pairStatus === 2 || pairStatus === 3 || pairStatus === 4 || pairStatus === 5) ? false : true}
                  style={{
                    color: "#FFFFFF",
                    width: "60%",
                    float: "left",
                    borderLeft: "1px solid white",
                    borderRadius: "14px",
                  }}
                />
              </div>
              <div style={{ display: "block", float: "left", width: "100%" }}>
                <span style={{ float: "left", color: grayColor }}>
                  Balance: {numFormat(outBal)}
                </span>
                <span style={{ float: "right", color: grayColor }}>
                  <span style={{ cursor: "pointer", color: position2 === 4 ? "lightblue" : "gray" }} onClick={() => setOutLimit(4)}>25%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position2 === 2 ? "lightblue" : "gray" }} onClick={() => setOutLimit(2)}>50%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position2 === 1.3333 ? "lightblue" : "gray" }} onClick={() => setOutLimit(1.3333)}>75%</span>
                  <span style={{ paddingLeft: "5px", cursor: "pointer", color: position2 === 1 ? "lightblue" : "gray" }} onClick={() => setOutLimit(1)}>100%</span>
                </span>
              </div>
            </FormControl>
            <div style={{ float: "left", marginTop: "20px", width: "100%" }}>
              <div style={{ float: "left", width: "100%" }}>
                <span style={{ float: "left", color: "white", fontSize: "18px" }}>
                  Trading Fee:{" "}
                </span>

                <div style={{ float: "right", display: "inline", fontSize: "18px" }}>
                  <span style={{ color: tradingFee === 0.1 ? "lightblue" : "gray", cursor: "pointer" }} onClick={() => setTradingFee(0.1)}>0.1%</span>
                  <span style={{ color: tradingFee === 0.2 ? "lightblue" : "gray", paddingLeft: "10px", cursor: "pointer" }} onClick={() => setTradingFee(0.2)}>0.2%</span>
                  <span style={{ color: tradingFee === 0.3 ? "lightblue" : "gray", paddingLeft: "10px", cursor: "pointer" }} onClick={() => setTradingFee(0.3)}>0.3%</span>
                </div>
              </div>
              {account &&
                <>
                  {pairStatus === 0 &&
                    <Button
                      size={isMobile ? "small" : "large"}
                      variant="contained"
                      sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                      style={{
                        color: "white",
                        background:
                          "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)",
                        textAlign: "center",
                      }}
                      disabled={true}
                    >
                      Existing Pair
                    </Button>
                  }
                  {pairStatus === 1 &&
                    <Button
                      size={isMobile ? "small" : "large"}
                      variant="contained"
                      sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                      disabled={true}
                      style={{
                        color: "white",
                        background:
                          "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)",
                        textAlign: "center",
                      }}
                    >
                      Same Token Pair
                    </Button>
                  }
                  {(pairStatus !== 0 && pairStatus !== 1 && limitedOut) ? (
                    <Button
                      size={isMobile ? "small" : "large"}
                      variant="contained"
                      sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                      style={{
                        color: "white",
                        background:
                          "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)",
                        textAlign: "center",
                      }}
                    >
                      {(Number(inBal.toString().replaceAll(",", "")) <= 0 || Number(outBal.toString().replaceAll(",", "")) <= 0) ? `Insufficient Funds` : "Define your Liquidity Input"}
                    </Button>
                  ) : (
                    <>
                      {creating &&
                        <LoadingButton
                          loading={creating}
                          size={isMobile ? "small" : "large"}
                          variant="contained"
                          sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                          style={{
                            color: "white",
                            background:
                              "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)",
                            textAlign: "center",
                          }}
                          disabled={true}
                        >
                          Processing...
                        </LoadingButton>
                      }
                      {!creating && pairStatus === 2 &&
                        <Button
                          size={isMobile ? "small" : "large"}
                          variant="contained"
                          onClick={executeCreatePool}
                          sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                          style={{
                            background:
                              "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                            textAlign: "center",
                          }}
                        >
                          CREATE POOL
                        </Button>
                      }
                      {!creating && pairStatus === 3 &&
                        <Button
                          size={isMobile ? "small" : "large"}
                          variant="contained"
                          onClick={executeCreatePool}
                          sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                          style={{
                            background:
                              "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                            textAlign: "center",
                          }}
                        >
                          Approve {inToken['symbol']}
                        </Button>
                      }
                      {!creating && pairStatus === 4 &&
                        <Button
                          size={isMobile ? "small" : "large"}
                          variant="contained"
                          onClick={executeCreatePool}
                          sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                          style={{
                            background:
                              "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                            textAlign: "center",
                          }}
                        >
                          Approve {outToken['symbol']}
                        </Button>
                      }
                      {!creating && pairStatus === 5 &&
                        <Button
                          size={isMobile ? "small" : "large"}
                          variant="contained"
                          onClick={executeCreatePool}
                          sx={{ width: "100%", padding: 2, fontWeight: "bold", mt: 2 }}
                          style={{
                            background:
                              "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                            textAlign: "center",
                          }}
                        >
                          Add Initial Liquidity
                        </Button>
                      }
                    </>
                  )
                  }
                </>
              }
              {!account && (
                <Button
                  size="large"
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
              )}
            </div>
          </Item>
        </Grid>
        <Grid item xs={12} sm={12} md={7} sx={{ mt: 2 }}>
          {/* <Item sx={{ pt: 3, pl: 3, pr: 3, pb: 2, mb: 2 }} style={{ backgroundColor: "#12122c", borderRadius: "10px", color: "white" }} className="chart">
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 22 }}>Pool Creation Guide </h2>
              <ol>
                <li style={{ fontSize: "19px" }}>
                  Choose two token which have no existing liquidity Pool.
                </li>
              </ol>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>
          </Item> */}
          {(pairStatus === 2 || pairStatus === 3 || pairStatus === 4 || pairStatus === 5) && <Item sx={{ pt: 3, pl: 3, pr: 3, pb: 2, mb: 4 }} style={{ backgroundColor: "#12122c", borderRadius: "10px", color: "white" }} className="chart">
            <Stepper activeStep={pairStatus - 2} alternativeLabel>
              <Step>
                <StepLabel sx={{ color: "#fff" }}>Create Liquidity Pool</StepLabel>
              </Step>
              <Step>
                <StepLabel>Approve Token {inToken['symbol']}</StepLabel>
              </Step>
              <Step>
                <StepLabel>Approve Token {outToken['symbol']}</StepLabel>
              </Step>
              <Step>
                <StepLabel>Add Intial Liquidty</StepLabel>
              </Step>
            </Stepper>
          </Item>}
        </Grid >
        <TokenList mopen={mopen} handleClose={handleClose} selectToken={selectToken} uniList={uniList} selected_chain={selected_chain} selected={selected} />
      </Grid >
    </div >
  );
}
