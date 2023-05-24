import Web3 from "web3";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WalletConnectors from "../../config/connectors";
import { useWeb3React } from "@web3-react/core";
import {
  Grid,
  Button,
  Box,
  Hidden,
  Menu,
  MenuItem,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import logo from "../../images/logo.svg";
import useStyles from "../../assets/styles";
import Navigation from "./Navigation";

import ConnectWallet from "../web3/ConnectWallet";
import { ConnectedWallet } from "../../config/wallets";
import { SELECT_CHAIN } from "../../redux/constants";

function Header(props) {
  const { window } = props;
  const cWallet = ConnectedWallet();
  const selected_chain = useSelector((state) => state.selectedChain);
  const isMobile = useMediaQuery("(max-width:600px)");
  const darkFontColor = "#FFF";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [wrongChain, setWrongChain] = useState(false);
  const [openWalletList, setOpenWalletList] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chainLabel, setChainLabel] = useState(selected_chain);
  const [noDetected, setNoDetected] = useState(true);

  const dispatch = useDispatch();
  const classes = useStyles.header();
  const menuOpen = Boolean(anchorEl);
  const { injected } = WalletConnectors();
  const {
    account,
    active,
    activate,
    deactivate,
    chainChanged,
  } = useWeb3React();


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <div style={{display:"flex", justifyContent:"center", padding:"20px 0px"}}>
        <img
          src={logo}
          width="150px"
          alt="Logo"
        
        />
      </div>
      <List>
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"Swap"} />
            </ListItemButton>
          </ListItem>
        </Link>
        {/* <Link to="#" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"About Us"} />
            </ListItemButton>
          </ListItem>
        </Link> */}
        {/* <Link to="#" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"Contact Us"} />
            </ListItemButton>
          </ListItem>
        </Link> */}
        <Link to="/add_liquidity" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"Liquidity"} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link to="/user_dashboard" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"Dashboard"} />
            </ListItemButton>
          </ListItem>
        </Link>
        <Link to="/staking_pool" style={{ textDecoration: "none", color: "white" }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={"Earn"} />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
      <Box className={classes.actionGroup} style={{ justifyContent: "center" }}>
        <Box className={classes.connectWallet}>
          {(() => {
            if (wrongChain) {
              return (
                <Button
                  variant="contained"
                  className="btn-primary dark:text-dark-primary w-full"
                  id="connect_wallet_btn"
                  style={{
                    borderRadius: "0px",
                    height: 44,
                    fontSize: 18,
                  }}
                  onClick={() => {
                    setOpenWalletList(true);
                  }}
                >
                  Wrong Chain
                </Button>
              );
            } else {
              if (account)
                return (
                  <Button
                    variant="contained"
                    className="btn-primary dark:text-dark-primary w-full"
                    style={{
                      borderRadius: "0px",
                      height: 44,
                      fontSize: 14,
                    }}
                    startIcon={
                      cWallet && (
                        <img
                          width={22}
                          src={cWallet.logo}
                          alt={cWallet.name}
                        />
                      )
                    }
                    onClick={() => {
                      setOpenWalletList(true);
                    }}
                  >
                    {`${account.substring(
                      0,
                      8
                    )} ... ${account.substring(
                      account.length - 4
                    )}`}
                  </Button>
                );
              else
                return (
                  <Button
                    variant="contained"
                    id="connect_wallet_btn"
                    className="btn-primary dark:text-dark-primary w-full"
                    style={{
                      borderRadius: "0px",
                      height: 44,
                      fontSize: 18,
                    }}
                    onClick={() => {
                      setOpenWalletList(true);
                    }}
                  >
                    Connect Wallet
                  </Button>
                );
            }
          })()}
        </Box>
      </Box>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChain = async (chain) => {
    handleClose();
    if (chain !== "") {
      if (chainLabel !== chain) {
        setChainLabel(chain);
        deactivate();
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleWrongChain = async () => {
    if (account) {
      setNoDetected(false);
    }
    if (!noDetected) {
      const provider = await injected.getProvider();
      const web3 = new Web3(provider);
      let current_chainId = await web3.eth.getChainId();
      current_chainId = Number(current_chainId);
      if (chainLabel === "kava" && current_chainId === 2222) {
        setWrongChain(false);
      } else {
        setWrongChain(true);
      }
    }
  };

  const handleChainLabel = () => {
    dispatch({
      type: SELECT_CHAIN,
      payload: chainLabel,
    });
  };

  useEffect(() => {
    handleWrongChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activate, deactivate, active, chainChanged, chainLabel]);

  useEffect(() => {
    handleChainLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainLabel]);

  return (
    <div className="s" style={{ display: "flex", justifyContent: "center", padding: isMobile ? "16px" : "16px 0px" }}>
      {/* <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}> */}
      {/* Header Start  */}
      <Grid
        container
        maxWidth="lg"
        columnSpacing={{ xs: 0, sm: 0, md: 0 }}
        sx={{ pb: 1 }}
        className="header"
        style={{ justifyContent: "space-between"}}
        
      >
        {/* Logo Grid */}
        <Grid
          item
          xs={5}
          sm={5}
          md={6}
          lg={6}
          sx={{ display: "flex", justifyContent: "flex-start"}}
        >
          <Box
            elevation={1}
            style={{ backgroundColor: "transparent", color: darkFontColor }}
          >
            <img
              src={logo}
              width="150px"
              alt="Logo"
              style={{marginTop: isMobile ? "6px" : "6px", marginLeft:"2px"}}
            />
          </Box>
        </Grid>

        {/* Logo Right Side Grid  */}
        <Grid
          item
          xs={5}
          sm={5}
          md={6}
          lg={6}
          sx={{ display: "flex", justifyContent: "end" }}

        >
          <Box
            elevation={1}
            style={{ backgroundColor: "transparent", color: darkFontColor, marginRight:"8px" }}
          >
            <Stack spacing={1} direction="row">
              <Button
                id="basic-button"
                className="transition-all duration-300"
                aria-controls={menuOpen ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? "true" : undefined}
                onClick={handleClick}
                style={{ fontWeight: "bold", fontSize: "16px", color: "white" }}
              >
                {chainLabel}
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={(e) => setAnchorEl(false)}
                onClick={(e) => setAnchorEl(false)}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                classes={{
                  paper: classes.darkMenuWrapper,
                }}
              >
                <MenuItem key="kava" onClick={() => handleChain("kava")}>
                  Kava
                </MenuItem>
              </Menu>
              <Hidden mdDown={true}>
                {/* <Button
                  size="large"
                  color="primary"
                  variant="contained"
                  sx={{ width: 200, padding: 2, fontWeight: "550" }}
                  style={{
                    background:
                      "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                  }}
                >
                  CONNECT WALLET
                </Button> */}
                <Box className={classes.actionGroup}>
                  <Box className={classes.connectWallet}>
                    {(() => {
                      if (wrongChain) {
                        return (
                          <Button
                            variant="contained"
                            className="btn-primary dark:text-dark-primary w-full"
                            id="connect_wallet_btn"
                            style={{
                              borderRadius: "4px",
                              height: 44,
                              fontSize: 18,
                              background:
                              "linear-gradient(to right bottom, #13a8ff, #0074f0)"
                            }}
                            onClick={() => {
                              setOpenWalletList(true);
                            }}
                          >
                            Wrong Chain
                          </Button>
                        );
                      } else {
                        if (account)
                          return (
                            <Button
                              variant="contained"
                              className="btn-primary dark:text-dark-primary w-full"
                              style={{
                                borderRadius: "4px",
                                height: 44,
                                fontSize: 14,
                                background:
                      "linear-gradient(to right bottom, #13a8ff, #0074f0)"
                              }}
                              startIcon={
                                cWallet && (
                                  <img
                                    width={22}
                                    src={cWallet.logo}
                                    alt={cWallet.name}
                                  />
                                )
                              }
                              onClick={() => {
                                setOpenWalletList(true);
                              }}
                            >
                              {`${account.substring(
                                0,
                                8
                              )} ... ${account.substring(
                                account.length - 4
                              )}`}
                            </Button>
                          );
                        else
                          return (
                            <Button
                              variant="contained"
                              id="connect_wallet_btn"
                              className="btn-primary dark:text-dark-primary w-full"
                              style={{
                                borderRadius: "4px",
                                height: 44,
                                fontSize: 18,
                                background:
                      "linear-gradient(to right bottom, #13a8ff, #0074f0)",
                              }}
                              onClick={() => {
                                setOpenWalletList(true);
                              }}
                            >
                              Connect Wallet
                            </Button>
                          );
                      }
                    })()}
                  </Box>
                </Box>
              </Hidden>
              <Hidden mdUp={true}>
                <Grid item
                  xs={2}
                  sm={2}
                  md={2}
                  lg={6}
                  sx={{ display: "flex", justifyContent: "flex-end",marginLeft: 20, marginRight: 0 }}>
                  <Toolbar style={{ padding: "0px", marginLeft: "10px" }}>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2, display: { md: "none" } }}
                      style={{ padding: "0px", margin: 0 }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Box component="nav">
                      <Drawer
                        container={container}
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                          keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                          display: { xs: "block", sm: "block", md: "none", lg: "none" },
                          "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: "70%",
                            backgroundColor: "#07071c"
                          },
                        }}
                      >
                        {drawer}
                      </Drawer>
                    </Box>
                  </Toolbar>
                </Grid>
              </Hidden>
            </Stack>
          </Box>
        </Grid>

        {/* Mobile menu  */}

        {/* Header Section 1 End  */}

        {/* APP bar start  main menu*/}
        <Hidden mdDown={true}>
          <Navigation />
        </Hidden>
        {/* App Bar closed */}
      </Grid>
      <ConnectWallet
        isOpen={openWalletList}
        setIsOpen={setOpenWalletList}
        chain={chainLabel}
        setIsWrongChain={setWrongChain}
        setIsNoDetected={setNoDetected}
        wrongChain={wrongChain}
        dark={true}
      />
    </div>
  );
}

export default Header;
