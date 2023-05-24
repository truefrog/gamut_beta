
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

export default function CrossChain() {
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
                            <Link to="/ramp">
                                <Button
                                    size="large"
                                    variant="contained"
                                    sx={{ width: 200, padding: 2, fontWeight: "bold", backgroundColor: "#12122c!important" }}
                                >
                                    ON-OFF-RAMP
                                </Button>
                            </Link>
                            <Link to="/cross_chain" style={{ textDecoration: "none" }}>
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
                                    CROSS-CHAIN
                                </Button>
                            </Link>
                        </Stack>
                    </Item>
                </Grid>
                <Grid item={true} xs={12} sx={{ p: 1, display: "flex" }}>
                    <iframe
                        title="squid_widget"
                        width="420"
                        height="641"
                        src="https://widget.squidrouter.com/iframe?config=%7B%22companyName%22%3A%22Gamut%22%2C%22style%22%3A%7B%22neutralContent%22%3A%22%23959BB2%22%2C%22baseContent%22%3A%22%23E8ECF2%22%2C%22base100%22%3A%22%2307071C%22%2C%22base200%22%3A%22%23121226%22%2C%22base300%22%3A%22%23171D2B%22%2C%22error%22%3A%22%23ED6A5E%22%2C%22warning%22%3A%22%23FFB155%22%2C%22success%22%3A%22%2362C555%22%2C%22primary%22%3A%22%230583F4%22%2C%22secondary%22%3A%22%230583F4%22%2C%22secondaryContent%22%3A%22%23191C29%22%2C%22neutral%22%3A%22%2312122C%22%2C%22roundedBtn%22%3A%225px%22%2C%22roundedBox%22%3A%225px%22%2C%22roundedDropDown%22%3A%227px%22%2C%22displayDivider%22%3Atrue%7D%2C%22slippage%22%3A1.5%2C%22infiniteApproval%22%3Afalse%2C%22enableExpress%22%3Afalse%2C%22apiUrl%22%3A%22https%3A%2F%2Fapi.squidrouter.com%22%2C%22mainLogoUrl%22%3A%22https%3A%2F%2Fi.ibb.co%2F2gvt4XC%2Flogo-bow.png%22%2C%22comingSoonChainIds%22%3A%5B%22cosmoshub-4%22%2C%22injective-1%22%2C%22axelar-dojo-1%22%2C%22kichain-2%22%5D%2C%22titles%22%3A%7B%22swap%22%3A%22Convert%22%2C%22settings%22%3A%22Settings%22%2C%22wallets%22%3A%22Wallets%22%2C%22tokens%22%3A%22Tokens%22%2C%22chains%22%3A%22Chains%22%2C%22history%22%3A%22History%22%2C%22transaction%22%3A%22Transaction%22%2C%22allTokens%22%3A%22Tokens%22%2C%22destination%22%3A%22Destination%20address%22%7D%2C%22priceImpactWarnings%22%3A%7B%22warning%22%3A3%2C%22critical%22%3A5%7D%7D"
                    />
                </Grid>
            </Grid>
        </div>
    );
}
