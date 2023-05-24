import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Stack,
  useMediaQuery,
  Typography,
  Switch,
  FormLabel,
  FormControl,
  Select,
  MenuItem,
  FilledInput
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getAllFarmPools
} from "../../config/web3";
import { farmingPoolList } from "../../config/constants";
import StakingCmp from "./StakingCmp";
import Farms from "./Farms";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 30,
    height: 22,
    borderRadius: 3,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 4,
    opacity: 1,
    backgroundColor: 'rgba(255,255,255,.35)',
    boxSizing: 'border-box',
  },
}));

const StyledSelect = styled(Select)`
  color: white;
  & > div {
    padding-top:5px;
  },
  &:before, &:after {
    border-width:0px!important;
  },
  & > svg {
    top:3px
  }
`;

const StyledInput = styled(FilledInput)`
  color: white;
  & > input {
    padding-top:5px;
    color:white;
  },
  &:before, &:after {
    border-width:0px!important;
  },
`;

export const useStyles = makeStyles(() => ({
  paper: {
    "&.MuiPaper-root": {
      backgroundColor: "#5e5e6b",
      color: "white",
      fontWeight: "bold"
    },
  }
}));

export default function StackingPool() {

  const selected_chain = useSelector((state) => state.selectedChain);
  const farmingPoolListData = farmingPoolList[selected_chain];
  const { account, connector } = useWeb3React();
  const classes = useStyles();

  const [statusFlag, setStatusFlag] = useState(false);
  const [stakedFlag, setStakedFlag] = useState(false);
  const [sortBy, setSortBy] = useState(1);
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [pools, setPools] = useState({ isLoad: false, data: [] });

  const isMobile = useMediaQuery("(max-width:600px)");

  const handleStatus = () => {
    setStatusFlag(!statusFlag);
    filteringData(!statusFlag, stakedFlag, sortBy, query);
  }

  const handleStaked = () => {
    setStakedFlag(!stakedFlag);
    filteringData(statusFlag, !stakedFlag, sortBy, query);
  }

  const handleSortBy = (event) => {
    let sorting_val = Number(event.target.value);
    setSortBy(sorting_val);
    filteringData(statusFlag, stakedFlag, sorting_val, query);
  }

  const handleQuery = (event) => {
    let new_query = event.target.value;
    setQuery(new_query);
    filteringData(statusFlag, stakedFlag, sortBy, new_query);
  }

  const filteringData = (status, staked, sortby, cquery) => {
    let oldData = [...pools.data];
    oldData = oldData.filter((item) => {
      return item.finished === status;
    });

    if (staked)
      oldData = oldData.filter((item) => {
        return Number(item.stakedVal) > 0;
      });

    oldData = oldData.filter((item) => {
      return item.symbols[0].toLowerCase().indexOf(cquery.toLowerCase()) !== -1 || item.symbols[1].toLowerCase().indexOf(cquery.toLowerCase()) !== -1;
    });

    if (sortby === 1)
      oldData.sort((a, b) => (b.totalStakedUSD > a.totalStakedUSD) ? 1 : -1);
    else if (sortby === 2)
      oldData.sort((a, b) => (b.apr > a.apr) ? 1 : -1);
    else if (sortby === 3)
      oldData.sort((a, b) => (b.pendingReward > a.pendingReward) ? 1 : -1);
    else if (sortby === 4)
      oldData.sort((a, b) => (b.totalSupplyUSD > a.totalSupplyUSD) ? 1 : -1);
    else if (sortby === 5)
      oldData.sort((a, b) => (b.startBlock > a.startBlock) ? 1 : -1);
    setFilteredData(oldData);
  }

  const handlePoolData = async () => {
    const provider = await connector.getProvider();
    getAllFarmPools(
      provider,
      account,
      farmingPoolListData
    ).then((response) => {
      setPools({
        isLoad: true,
        data: response,
      });
      let tempData = [...response];
      tempData.sort((a, b) =>
        (b.totalStakedUSD > a.totalStakedUSD) ? 1 : -1);
      setFilteredData(tempData);
    });
  };

  useEffect(() => {
    if (account)
      handlePoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Grid
        sx={{ width: "1220px", justifyContent: "center", padding: isMobile ? "0px 4px" : "0px 8px" }}
        border={0}
        columnSpacing={{ xs: 0, sm: 0, md: 2, lg: 2 }}
      >
        <StakingCmp />
        <Grid
          container
          sx={{ pl: 0 }}
        >
          <Grid item={true} xs={12} sm={6} md={3} sx={{ mt: 2 }} className="home__mainC">
            <Item
              elevation={1}
              style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px", padding: "0px 18px", minWidth: "180px" }}
            >
              <Stack direction="row" spacing={1} alignItems="start">
                <div className="flex flex-col">
                  <FormLabel component="legend" sx={{ fontSize: 10, display: "flex", fontWeight: "bold", color: "#1c63eb" }}>FILTER BY</FormLabel>
                  <Stack direction="row" spacing={1} sx={{ mt:0.4 }}>
                    <Typography style={{ color: "white", fontSize: 14, display: "flex", alignItems: "center" }}>Finished</Typography>
                    <AntSwitch defaultChecked onChange={handleStatus} inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography style={{ color: "white", fontSize: 14, display: "flex", alignItems: "center" }}>Live</Typography>
                  </Stack>
                </div>
              </Stack>
            </Item>
          </Grid>
          <Grid item={true} xs={12} sm={6} md={3} sx={{ mt: 2 }} className="home__mainC">
            <Item
              elevation={1}
              style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px", padding: "0px 16px", marginLeft: 0, minWidth: "180px" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <div className="flex flex-col">
                  <FormLabel component="legend" sx={{ fontSize: 10, display: "flex", fontWeight: "bold", color: "#1c63eb" }}>FILTER BY</FormLabel>
                  <Stack direction="row" spacing={1} sx={{ mt:0.4 }}>
                    <AntSwitch onChange={handleStaked} inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography style={{ color: "white", fontSize: 14, display: "flex", alignItems: "center" }}>Stacked Only</Typography>
                  </Stack>
                </div>
              </Stack>
            </Item>
          </Grid>
          <Grid item={true} xs={12} sm={6} md={3} sx={{ mt: 2 }} className="home__mainC">
            <Item
              elevation={1}
              style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px", padding: "0px 16px", minWidth: "180px" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <div className="flex flex-col">
                  <FormLabel component="legend" sx={{ fontSize: 10, display: "flex", fontWeight: "bold", color: "#1c63eb" }}>SORT BY</FormLabel>
                  <Stack direction="row" spacing={1}>
                    <FormControl variant="filled" sx={{ mt: 0, minWidth: 120, fontWeight: "bold", backgroundColor: "#5e5e6b", borderRadius: 1, height: 30 }} className={classes.menu}>
                      <StyledSelect
                        label="Title"
                        sx={{ "& .MuiSvgIcon-root": { color: "white" } }}
                        value={sortBy}
                        onChange={handleSortBy}
                        MenuProps={{
                          classes: {
                            paper: classes.paper
                          }
                        }}
                        IconComponent={ExpandMoreIcon}
                      >
                        <MenuItem value={1}>Hot</MenuItem>
                        <MenuItem value={2}>APR</MenuItem>
                        <MenuItem value={3}>Earned</MenuItem>
                        <MenuItem value={4}>Liquidity</MenuItem>
                        <MenuItem value={5}>Latest</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Stack>
                </div>
              </Stack>
            </Item>
          </Grid>
          <Grid item={true} xs={12} sm={6} md={3} sx={{ mt: 2 }} className="home__mainC">
            <Item
              elevation={1}
              style={{ backgroundColor: "transparent", boxShadow: "0px 0px 0px 0px", padding: "0px 16px", minWidth: "180px" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <div className="flex flex-col">
                  <FormLabel component="legend" sx={{ fontSize: 10, display: "flex", fontWeight: "bold", color: "#1c63eb" }}>SEARCH</FormLabel>
                  <Stack direction="row" spacing={1}>
                    <FormControl sx={{ width: '140px', backgroundColor: "#5e5e6b", height: 30, borderRadius: 1 }} >
                      <StyledInput placeholder="Search Farms" value={query} onChange={handleQuery} onKeyUp={handleQuery} />
                    </FormControl>
                  </Stack>
                </div>
              </Stack>
            </Item>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{ width: "100%", mt: 2, mb: 2, backgroundColor: "#12122c", borderRadius: "10px" }}
        >
          <Farms pools={pools} filteredData={filteredData} handlePoolData={handlePoolData}  />
        </Grid>
      </Grid>
    </div>
  );
}
