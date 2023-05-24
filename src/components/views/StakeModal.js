import React, { useEffect, useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { Modal, Grid, Paper, InputBase, Typography, Button, useMediaQuery } from '@mui/material'
import tw from "twin.macro";
import { styled } from "@mui/material/styles";
import {
    numFormat,
    toLongNum,
    stakePool,
    unStakePool
} from "../../config/web3";


const StyledModal = tw.div`
  flex
  flex-col
  relative
  m-auto
  top-1/4
  p-4
  min-h-min
  transform -translate-x-1/2 -translate-y-1/2
  lg:w-2/5 md:w-2/3 w-10/12
`;

const Item = styled(Paper)(() => ({
    backgroundColor: "#1A2027",
    padding: "8px",
    width: "100%",
    textAlign: "center",
    color: "lightgray",
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

export default function StakeModal({ mopen, handleClose, mtype, poolData }) {
    const { account, connector } = useWeb3React();
    const [stakeVal, setStakeVal] = useState(0);
    const [staking, setStaking] = useState(false);
    const [limitFlag, setLimitFlag] = useState(0);

    const isMobile = useMediaQuery("(max-width:600px)");

    const handleStakeVal = (event) => {
        let e_val = event.target.value;
        if (e_val.charAt(0) === "0" && e_val.charAt(1) !== "." && e_val.length > 1)
            e_val = e_val.substr(1);
        e_val = Number(e_val) > 10 ** -8 ? Number(e_val) : toLongNum(e_val);
        setStakeVal(e_val);
        if (mtype === 1) {
            if (Number(poolData?.userlp) === Number(e_val))
                setLimitFlag(1);
            else if (poolData?.userlp / 1.3333 === Number(e_val))
                setLimitFlag(1.3333);
            else if ((poolData?.userlp / 2 === Number(e_val)))
                setLimitFlag(2);
            else if ((poolData?.userlp / 4 === Number(e_val)))
                setLimitFlag(4);
            else
                setLimitFlag(0);
        } else {
            if (Number(poolData?.stakedVal) === Number(e_val))
                setLimitFlag(1);
            else if (poolData?.stakedVal / 1.3333 === Number(e_val))
                setLimitFlag(1.3333);
            else if ((poolData?.stakedVal / 2 === Number(e_val)))
                setLimitFlag(2);
            else if ((poolData?.stakedVal / 4 === Number(e_val)))
                setLimitFlag(4);
            else
                setLimitFlag(0);
        }
    }

    const setInLimit = (userlp, position) => {
        setLimitFlag(position);
        let e_val = (userlp / position).toString();
        if (e_val.charAt(0) === "0" && e_val.charAt(1) !== "." && e_val.length > 1)
            e_val = e_val.substr(1);
        e_val = Number(e_val) > 10 ** -8 ? Number(e_val) : toLongNum(e_val);
        setStakeVal(e_val);
    }

    const executeStake = async (farmingPoolAddr, value) => {
        const provider = await connector.getProvider();
        setStaking(true);
        if (mtype === 1)
            await stakePool(account, provider, value, farmingPoolAddr, setStaking);
        else if (mtype === 2)
            await unStakePool(account, provider, value, farmingPoolAddr, setStaking);
        setStaking(false);
    }

    useEffect(() => {
        setStakeVal(0);
        setLimitFlag(0);
    }, [mopen]);

    return (
        <Modal
            open={mopen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <StyledModal className="bg-modal" style={{ paddingLeft: isMobile ? "8px" : "24px", paddingRight: isMobile ? "8px" : "24px" }}>
                {mtype === 1 &&
                    <Typography className="model-title mb-3 text-wight" sx={{ color: "#fff", fontWeight: "bold", fontSize: "24px" }}>Stake LP tokens</Typography>
                }
                {mtype === 2 &&
                    <Typography className="model-title mb-3 text-wight" sx={{ color: "#fff", fontWeight: "bold", fontSize: "24px" }}>Unstake LP tokens</Typography>
                }
                <hr />
                <Grid sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mt: 3, mb: 1 }}>
                    <Item sx={{ pl: 0, pr: 0, pb: 2 }} style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px" }}>
                        <Typography sx={{ color: "#6d6d7d", fontWeight: "bold", ml: isMobile ? "51%" : "41%", textAlign: "left", fontSize: isMobile ? 13 : 16 }}>
                            ~{numFormat(poolData?.userSupplyUSD * stakeVal / (Number(poolData?.userlp) + 0.0000000000000001))}{" "}USD
                        </Typography>
                        <div style={{ backgroundColor: "#12122c" }}>
                            <Button
                                style={{ width: isMobile ? "50%" : "40%", float: "left", border: "0px", padding: "9px 8px", backgroundColor: "#07071c", minHeight: isMobile ? "43px" : "48px", fontSize: isMobile ? "8px" : "10px" }}
                                startIcon={
                                    <div style={{ float: "left" }}>
                                        <img
                                            src={poolData?.logoURLs[0]}
                                            alt=""
                                            style={{ float: "left" }}
                                            className="w-3 md:w-5"
                                        />
                                        <img
                                            src={poolData?.logoURLs[1]}
                                            alt=""
                                            style={{ float: "left", marginLeft: -5 }}
                                            className="w-3 md:w-5"
                                        />
                                    </div>
                                }
                                className="w-36 sm:w-48"
                            >
                                {poolData?.symbols[0]} -{" "}
                                {poolData?.symbols[1]} LP
                            </Button>
                            <BootstrapInput
                                id="demo-customized-textbox"
                                type="text"
                                value={stakeVal}
                                inputProps={{ min: 0, max: mtype === 1 ? Number(poolData?.userlp) : Number(poolData?.stakedVal) }}
                                onChange={(e) => handleStakeVal(e)}
                                onKeyUp={(e) => handleStakeVal(e)}
                                style={{
                                    color: "#FFFFFF",
                                    width: isMobile ? "50%" : "60%",
                                    float: "left",
                                    borderLeft: "1px solid white",
                                    borderRadius: "14px",
                                    fontSize: isMobile ? 16 : 20,
                                }}
                            />
                        </div>
                        <div style={{ width: "100%", marginTop: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ color: "#6d6d7d", display: "flex", justifyContent: "left", fontSize: isMobile ? 13 : 14, mt: 0.3 }}>
                                Balance: {mtype === 1 ? numFormat(poolData?.userlp) : numFormat(poolData?.stakedVal)}
                            </Typography>
                            <p style={{ display: "flex", color: "#6d6d7d", fontSize: isMobile ? 13 : 16 }}>
                                <span style={{ cursor: "pointer", color: limitFlag === 4 ? "lightblue" : "" }}
                                    onClick={() => setInLimit(mtype === 1 ? poolData?.userlp : poolData?.stakedVal, 4)}
                                >
                                    25%
                                </span>
                                <span
                                    style={{
                                        paddingLeft: "5px", cursor: "pointer",
                                        color: limitFlag === 2 ? "lightblue" : ""
                                    }}
                                    onClick={() => setInLimit(mtype === 1 ? poolData?.userlp : poolData?.stakedVal, 2)}
                                >
                                    50%
                                </span>
                                <span
                                    style={{
                                        paddingLeft: "5px", cursor: "pointer",
                                        color: limitFlag === 1.3333 ? "lightblue" : ""
                                    }}
                                    onClick={() => setInLimit(mtype === 1 ? poolData?.userlp : poolData?.stakedVal, 1.3333)}
                                >
                                    75%
                                </span>
                                <span
                                    style={{
                                        paddingLeft: "5px", cursor: "pointer",
                                        color: limitFlag === 1 ? "lightblue" : ""
                                    }}
                                    onClick={() => setInLimit(mtype === 1 ? poolData?.userlp : poolData?.stakedVal, 1)}
                                >
                                    100%
                                </span>
                            </p>
                        </div>
                    </Item>
                    <div style={{ width: "100%", marginTop: "20px", display: "flex", justifyContent: "right", alignItems: "center" }}>
                        <Button
                            size="small"
                            variant="contained"
                            sx={{
                                width: isMobile ? "45%" : "35%",
                                padding: 1,
                                fontWeight: "bold",
                                background:
                                    "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)",
                                color: "#ddd!important"
                            }}
                            disabled={staking}
                            onClick={handleClose}
                        >
                            {staking ? "In Progress" : "Cancel"}
                        </Button>
                        {mtype === 1 &&
                            <Button
                                size="small"
                                variant="contained"
                                disabled={staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.userlp)}
                                sx={{
                                    width: isMobile ? "45%" : "35%",
                                    background: (staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.userlp)) ?
                                        "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)" : "",
                                    marginLeft: 2,
                                    padding: 1,
                                    color: (staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.userlp)) ? "#ddd!important" : "",
                                    fontWeight: "bold",
                                }}
                                onClick={() => executeStake(poolData?.farmingPoolAddress, stakeVal)}
                            >
                                {staking ? "In Progress" : (Number(stakeVal) === 0 ? "Set Amount" : (Number(stakeVal) > Number(poolData?.userlp) ? "Wrong Amount" : "Confirm"))}
                            </Button>
                        }
                        {mtype === 2 &&
                            <Button
                                size="small"
                                variant="contained"
                                disabled={staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.stakedVal)}
                                sx={{
                                    width: isMobile ? "45%" : "35%",
                                    background: (staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.stakedVal)) ?
                                        "linear-gradient(to right bottom, #5e5c5c, #5f6a9d)" : "",
                                    marginLeft: 2,
                                    padding: 1,
                                    color: (staking || Number(stakeVal) === 0 || Number(stakeVal) > Number(poolData?.stakedVal)) ? "#ddd!important" : "",
                                    fontWeight: "bold",
                                }}
                                onClick={() => executeStake(poolData?.farmingPoolAddress, stakeVal)}
                            >
                                {staking ? "In Progress" : (Number(stakeVal) === 0 ? "Set Amount" : (Number(stakeVal) > Number(poolData?.stakedVal) ? "Wrong Amount" : "Confirm"))}
                            </Button>
                        }
                    </div>
                </Grid>
            </StyledModal>
        </Modal>
    )
}
