import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
    Grid,
    useMediaQuery,
    Paper,
    Button,
    Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

// Import ethers and bech32
import { ethers } from 'ethers';
import bech32 from 'bech32';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: "theme.palette.text.secondary",
}));

export default function Ramp() {
    const { account } = useWeb3React();

    const isMobile = useMediaQuery("(max-width:600px)");
    const darkFontColor = "#FFFFFF";
    const [kavaAddress, setKavaAddress] = useState("");

    const ethToKavaAddress = (ethereumAddress) => {
        try {
            return bech32.encode(
                'kava',
                bech32.toWords(
                    ethers.utils.arrayify(ethers.utils.getAddress(ethereumAddress))
                )
            );
        } catch (err) {
            return '';
        };

    };

    useEffect(() => {
        let kavaAddr = ethToKavaAddress(account);
        setKavaAddress(kavaAddr);
    }, [account]);

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <Grid
                container
                sx={{ maxWidth: "1220px" }}
                border={0}
                columnSpacing={{ xs: 0, sm: 0, md: 2, lg: 2 }}
            >
                <Grid item={true} xs={12} sm={12} md={6} lg={4} >
                    <Item
                        elevation={1}
                        style={{ backgroundColor: "transparent", color: darkFontColor, boxShadow: "0px 0px 0px 0px", padding: "0px 0px 8px 0px" }}
                    >
                        <Stack spacing={2} direction={isMobile ? "column" : "row"} className="swap_bh">
                            <Link to="/">
                                <Button
                                    size="large"
                                    variant="contained"
                                    sx={{ width: 200, padding: 2, fontWeight: "bold", backgroundColor: "#12122c!important" }}
                                >
                                    ON-CHAIN
                                </Button>
                            </Link>
                            <Link to="/ramp" style={{ textDecoration: "none" }}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    sx={{
                                        width: 200,
                                        padding: 2,
                                        fontWeight: "bold",
                                    }}
                                    style={{
                                        background:
                                            "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                                    }}
                                >
                                    ON-OFF-RAMP
                                </Button>
                            </Link>
                            <Link to="/cross_chain">
                                <Button
                                    size="large"
                                    variant="contained"
                                    sx={{ width: 200, padding: 2, fontWeight: "bold", backgroundColor: "#12122c!important" }}
                                >
                                    CROSS-CHAIN
                                </Button>
                            </Link>
                        </Stack>
                    </Item>
                </Grid>
                <Grid item={true} xs={12} sx={{ p: 1 }}>
                    <iframe height="755" title="Transak On/Off Ramp Widget"
                        src={"https://global.transak.com?apiKey=b4a16117-a759-43c5-a95e-6f4832ebd835&cryptoCurrencyCode=KAVA&walletAddress="+kavaAddress}
                        frameBorder="no" allowtransparency="true" allowFullScreen=""
                        style={{ display: "block", width: "100%", maxHeight: "755px", maxWidth: "500px" }}>
                    </iframe>
                    {/* <iframe height="755" title="Transak On/Off Ramp Widget"
                        src={"https://global-stg.transak.com?apiKey=cf5868eb-a8bb-45c8-a2db-4309e5f8b412&defaultCryptoCurrency=KAVA"}
                        frameBorder="no" allowtransparency="true" allowFullScreen=""
                        style={{ display: "block", width: "100%", maxHeight: "755px", maxWidth: "500px" }}>
                    </iframe> */}
                </Grid>
            </Grid>
        </div>
    );
}
