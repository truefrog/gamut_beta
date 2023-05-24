import Web3 from "web3";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// ** Web3 React
import {
    NoEthereumProviderError,
    UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
    URI_AVAILABLE,
    UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from "@web3-react/walletconnect-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";

// Import ethers and bech32
import { ethers } from 'ethers';
import bech32 from 'bech32';

// ** Import Material-Ui Components

import {
    Box,
    List,
    Alert,
    Dialog,
    Button,
    ListItem,
    Typography,
    DialogTitle,
    ButtonGroup,
    ListItemText,
    ListItemIcon,
    TextField,
    CircularProgress,
    useMediaQuery,
} from "@mui/material"

// ** Import Material Icons
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import ReplayIcon from "@mui/icons-material/Replay";

// ** Import Assets
import useStyles from "../../assets/styles";
import { Wallets, ConnectedWallet } from "../../config/wallets";
import changeChain from "../../config/changeChain";
import walletConnectors from "../../config/connectors";
import { useEagerConnect, useInactiveListener } from "../../hooks";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CHANGE_WALLET } from "../../redux/constants";

const ConnectWallet = ({
    isOpen,
    setIsOpen,
    chain,
    wrongChain,
    setIsNoDetected,
    setIsWrongChain,
    dark,
}) => {
    const classes = useStyles.base();
    const dispatch = useDispatch();

    const isMobile = useMediaQuery("(max-width:600px)");

    const [kavaAddr, setKavaAddr] = useState("");

    const triedEager = useEagerConnect();
    const {
        activate,
        active,
        account,
        deactivate,
        connector,
        error,
        setError,
    } = useWeb3React();
    const cWallet = ConnectedWallet();
    const { injected, walletconnect } = walletConnectors();

    const [activatingConnector, setActivatingConnector] = React.useState();

    useEffect(() => {
        dispatch({
            type: CHANGE_WALLET,
            payload: account,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        let kavaAdr = ethToKavaAddress(account);
        setKavaAddr(kavaAdr);
    }, [account]);
    // ** Actions
    const copyAddress = () => {
        alert(`Copied to clipboard.`, "info");
    };
    const viewBlockUrl = (account) => {
        window.open(`https://www.mintscan.io/kava/address/${account}`);
    };

    // const viewBlockUrl2 = (account) => {
    //     window.open(`https://polygonscan.com/address/${account}`);
    // };

    useInactiveListener(!triedEager);

    // ** Actions
    const retryConnect = () => {
        setError(false);
    };
    const onConnectWallet = async (item) => {
        const provider = await injected.getProvider();
        const web3 = new Web3(provider);
        let current_chainId = await web3.eth.getChainId();
        current_chainId = Number(current_chainId);
        if (!(current_chainId === 3 || current_chainId === 4002))
            handleChainChange();
        setActivatingConnector(item.connector);
        await activate(item.connector);
    };
    const onDeactiveWallet = () => {
        deactivate();
    };
    const handleCloseWalletList = () => {
        setIsOpen(false);
    };
    const getErrorMessage = (error) => {
        if (error instanceof NoEthereumProviderError) {
            return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
        } else if (error instanceof UnsupportedChainIdError) {
            setIsNoDetected(false);
            setIsWrongChain(true);
            return "You're connected to an unsupported network.";
        } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect ||
            error instanceof UserRejectedRequestErrorFrame
        ) {
            return "Please authorize this website to access your Ethereum account.";
        } else {
            console.error(error);
            return "An unknown error occurred. Check the console for more details.";
        }
    };

    const handleChainChange = async () => {
        setIsOpen(false);
        await changeChain(chain);
    };

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
        const initialData = async () => {
            const logURI = (uri) => { };
            walletconnect.on(URI_AVAILABLE, logURI);
            return () => {
                walletconnect.off(URI_AVAILABLE, logURI);
            };
        };
        initialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    return (
        <Dialog
            className={`${dark
                    ? "dark transition-all duration-700 ease-in-out"
                    : "light transition-all duration-700 ease-in-out"
                } transition-all duration-700 ease-in-out`}
            onClose={handleCloseWalletList}
            classes={{
                paper: dark ? classes.darkConnectWallet : classes.connectWallet,
            }}
            open={isOpen}
            fullWidth={true}
        >
            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button color="primary" onClick={() => retryConnect()}>
                            <ReplayIcon />
                        </Button>
                    }
                >
                    {getErrorMessage(error)}
                </Alert>
            )}
            <DialogTitle className="action" style={{ paddingLeft: 0 }}>
                {active && !wrongChain && (
                    <Typography style={{ fontSize: 20 }}>Account</Typography>
                )}
                {wrongChain && (
                    <Typography style={{ fontSize: 20 }}>Change Network</Typography>
                )}
                {!account && !wrongChain && (
                    <Typography style={{ fontSize: 20 }}>Connect Your Wallet</Typography>
                )}
            </DialogTitle>
            {active &&
                (!wrongChain ? (
                    <Box className={classes.connectWalletButton}>
                        {cWallet && (
                            <Button endIcon={<img src={cWallet.logo} alt={cWallet.name} />}>
                                <Typography variant="caption">
                                    {`${cWallet.name} Connected`}
                                </Typography>
                            </Button>
                        )}
                        <div className="flex flex-col">
                            {account && <p className="address-description" style={{color:"#4b98bb", marginTop:"6px"}}>KAVA EVM Address</p>}
                            <TextField
                                inputProps={{
                                    readOnly: true,
                                    style: { color: "#4b98bb", border: "1px solid gray", fontFamily:"monospace" },
                                }}
                                value={
                                    account
                                        ? (isMobile?`${account.toLowerCase().substring(0, 12)} ... ${account.toLowerCase().substring(account.length-12)}`:`${account.toLowerCase().substring(0, 16)} ... ${account.toLowerCase().substring(account.length-15)}`)
                                        : "Connect Wallet"
                                }
                            />
                            {!isMobile && 
                                <CopyToClipboard text={account} onCopy={() => copyAddress()}>
                                    <FileCopyOutlinedIcon style={{width:"20px", position:"absolute", top:"148px", right:"30px", cursor:"pointer"}} onClick={() => copyAddress()}/>
                                </CopyToClipboard>
                            }
                            {isMobile && 
                                <CopyToClipboard text={account} onCopy={() => copyAddress()}>
                                    <FileCopyOutlinedIcon style={{width:"20px", position:"absolute", top:"140px", right:"30px", cursor:"pointer"}} onClick={() => copyAddress()}/>
                                </CopyToClipboard>
                            }
                            {account && <p className="address-description" style={{color:"#4b98bb", marginTop:"6px", whiteSpace:"nowrap" }}>KAVA Address(deposit KAVA from central exchanges)</p>}
                            <TextField
                                inputProps={{
                                    readOnly: true,
                                    style: { color: "#4b98bb", border: "1px solid gray", fontFamily:"monospace" },
                                }}
                                value={
                                    account
                                        ? (isMobile?`${kavaAddr.substring(0, 12)} ... ${kavaAddr.substring(kavaAddr.length-12)}`:`${kavaAddr.substring(0, 16)} ... ${kavaAddr.substring(kavaAddr.length-15)}`)
                                        : "Connect Wallet"
                                }
                            />
                            {!isMobile &&
                                <CopyToClipboard text={kavaAddr} onCopy={() => copyAddress()}>
                                    <FileCopyOutlinedIcon style={{width:"20px", position:"absolute", top:"215px", right:"30px", cursor:"pointer"}} onClick={() => copyAddress()}/>
                                </CopyToClipboard>
                            }
                            {isMobile &&
                                <CopyToClipboard text={kavaAddr} onCopy={() => copyAddress()}>
                                    <FileCopyOutlinedIcon style={{width:"20px", position:"absolute", top:"199px", right:"30px", cursor:"pointer"}} onClick={() => copyAddress()}/>
                                </CopyToClipboard>
                            }
                        </div>
                        <div style={{width:"flex", display:"contents"}}>
                            <ButtonGroup
                                className="buttonGroup"
                                color="primary"
                                style={{paddingLeft:"0px", paddingRight:"0px"}}
                                aria-label="outlined primary button group"
                            >
                                <Button
                                    style={{width:"50%"}}
                                    onClick={() => viewBlockUrl(account)}
                                    startIcon={<OpenInNewOutlinedIcon />}
                                >
                                    <Typography variant="caption">View</Typography>
                                </Button>
                                <Button
                                    style={{width:"50%"}}
                                    onClick={() => onDeactiveWallet()}
                                    startIcon={<ExitToAppOutlinedIcon />}
                                >
                                    <Typography variant="caption">Deactivate</Typography>
                                </Button>
                            </ButtonGroup>
                        </div>
                    </Box>
                ) : (
                    <button
                        variant="contained"
                        className="btn-primary w-full"
                        style={{ borderRadius: "0px", minHeight: 44, fontSize: 15, color:"white", backgroundColor:"#0074f0" }}
                        onClick={handleChainChange}
                    >
                        Connect to {chain.toUpperCase()}
                    </button>
                ))}
            {!active ? (
                !wrongChain ? (
                    <List className="wallet-list">
                        {Wallets.map((item, idx) => {
                            const activating = item.connector === activatingConnector;
                            const connected = item.connector === connector;
                            const disabled =
                                !triedEager || !!activatingConnector || connected || !!error;
                            return (
                                <ListItem
                                    button
                                    key={idx}
                                    className="item"
                                    disabled={disabled}
                                    onClick={() => onConnectWallet(item)}
                                >
                                    <ListItemIcon className="symbol">
                                        {activating ? (
                                            <CircularProgress />
                                        ) : (
                                            <img src={item.logo} alt={item.logo} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        secondaryTypographyProps={{ color: "#4b6998" }}
                                        secondary={
                                            activating ? "Initializing..." : item.description
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                ) : (
                    <Button
                        variant="contained"
                        className="btn-primary w-full"
                        style={{ minHeight: 44, fontSize: 15, color:"white", backgroundColor:"#0074f0", borderRadius:"4px" }}
                        onClick={handleChainChange}
                    >
                        Connect to {chain.toUpperCase()}
                    </Button>
                )
            ) : (
                ""
            )}
        </Dialog>
    );
};

export default ConnectWallet;
