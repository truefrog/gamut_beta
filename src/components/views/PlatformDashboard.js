import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useWeb3React } from "@web3-react/core";
import { utils } from "ethers";
import { styled } from "@mui/material/styles";
import { Grid, Paper, CircularProgress } from "@mui/material";
import { createChart } from "lightweight-charts";
import DashboardCmp from "./DashboardCmp";
import { poolList, contractAddresses } from "../../config/constants";
import { getAllPools } from "../../config/web3";
import "./Navigation.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "theme.palette.text.secondary",
}));

export default function PDashboard() {
  const { account, connector } = useWeb3React();
  const selected_chain = useSelector((state) => state.selectedChain);
  const [TVLGraph, setTVLGraph] = useState({});
  const [finding, setFinding] = useState(true);
  const [noChartData, setNoChartData] = useState(false);
  const [pools, setPools] = useState({ isLoad: false, data: [] });
  const [poolsData, setPoolsData] = useState(poolList[selected_chain]);
  const chartRef = useRef();

  // https://defillama.com/docs/api
  const fetchTVLData = () => {
    axios
      .get("https://api.llama.fi/protocol/gamut-exchange", {
        headers: { accept: "*/*" },
      })
      .then((responce) => {
        setTVLGraph(responce?.data);
      });
  };

  const handlePoolData = async () => {
    const provider = await connector.getProvider();
    getAllPools(
      provider,
      account,
      contractAddresses[selected_chain]["hedgeFactory"],
      poolList
    ).then((responce) => {
      setPools({
        isLoad: true,
        data: responce.sort(function (a, b) {
          return b.totalSupply - a.totalSupply;
        }),
      });
    });
  };

  useEffect(() => {
    fetchTVLData();
    if (account === undefined) return;
    setTimeout(function () {
      handlePoolData();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // useEffect(() => {
  //   fetchTVLData();
  // }, []);

  // Chart ---------------------------------------------------------------->
  var chart;
  var areaSeries = null;

  const formattedPricesData = useMemo(() => {
    if (TVLGraph && TVLGraph?.tvl) {
      var result = [];
      if (TVLGraph?.tvl?.length >= 1) {
        TVLGraph?.tvl.map((item) => {
          result.push({
            time: parseInt(item.date, 10),
            value: item?.totalLiquidityUSD,
          });
          return null;
        });
      }
      return result;
    } else {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TVLGraph]);

  function syncToInterval() {
    if (areaSeries) {
      chart.removeSeries(areaSeries);
      areaSeries = null;
    }
    areaSeries = chart.addAreaSeries({
      topColor: "#0580f482",
      bottomColor: "#0580f42e",
      lineColor: "#0580f4",
      lineWidth: 2,
    });
    areaSeries.applyOptions({
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });
    areaSeries.setData(formattedPricesData);
  }

  const loadChart = () => {
    // console.log("Loading Chart...", formattedPricesData);
    if (chartRef.current.children[0]) {
      chartRef.current.removeChild(chartRef.current.children[0]);
    }
    chart = createChart(chartRef.current, {
      height: 350,
      layout: {
        backgroundColor: "#12122c",
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: "rgba(42, 46, 57, 0.5)",
        },
      },
      priceFormat: {
        type: "price",
        precision: 5,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
    });
    syncToInterval();
    setFinding(false);
  };

  useEffect(() => {
    if (formattedPricesData && formattedPricesData.length) {
      loadChart();
      setNoChartData(false);
    } else setNoChartData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedPricesData]);

  // console.log("Formated Data:", formattedPricesData);
  // Chart ----------------------------------------------------------------<
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
          sx={{ mt: 2 }}
          className="home__mainC"
        >
          <Item
            style={{ backgroundColor: "#07071C", borderRadius: "10px" }}
            className="home__main"
          >
            <Item
              sx={{ pl: 3, pr: 3, mb: 1 }}
              style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
                className="text-white"
              >
                <h1 className="text-2xl mt-2">
                  <span className="font-semibold">TVL: $</span>
                  {Number(TVLGraph?.currentChainTvls?.Kava).toFixed(3)}
                </h1>
              </div>
            </Item>
            <Item
              sx={{ pb: 2, mt: 2 }}
              style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
              className="home__main rounded-t-sm"
            >
              {/* <h1 className="text-2xl mt-2 text-left">
                <span className="font-semibold">Pools</span>
              </h1> */}
              {/* {pools.isLoad && (
                <div>
                  Fully Loaded Pa G!
                  {pools.data.map((pool, poolIndex) => {
                    console.log("Poolwa", pool);
                    return pool?.tokens.map((poolData, tokenIndex) => (
                      <div>
                        <h1>
                          Pool# {poolIndex} Token #{tokenIndex}
                        </h1>
                      </div>
                    ));
                    // pool?.balances.map((poolData, balanceIndex) => (
                    //   <div>
                    //     Pool# {poolIndex} Token #{balanceIndex}
                    //   </div>
                    // ));
                  })}
                </div>
              )} */}
              {/* Show pool token with balance */}
              {/* {pools.isLoad && (
                <div>
                  {pools.data.map((pool, poolIndex) => {
                    return (
                      <div >
                        <h3 className="text-left text-xl font-medium">
                          Pool #{poolIndex}
                        </h3>
                        {pool.map((poolData, tokenIndex) => (
                          <div className="flex">
                            <h1 className="mr-4">
                              Token:{poolData[0].slice(0, 6)}{" "}
                            </h1>
                            <h1>Balance: {poolData[1]}</h1>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )} */}

              {/* Table Starts */}
              <div className="block w-full overflow-x-auto">
                <table className="items-center w-full border-collapse text-gray-200">
                  <thead className="thead-light">
                    <tr>
                      <th className="px-6 bg-gray-500 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        #
                      </th>
                      <th className="px-6 bg-gray-500 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Pools
                      </th>
                      <th className="px-6 bg-gray-500 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Total Volume
                      </th>
                      <th className="px-6 bg-gray-500 text-blueGray-700 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left min-w-140-px"></th>
                    </tr>
                  </thead>
                  {pools.isLoad && (
                    <tbody>
                      {pools?.data?.map((pool, poolIndex) => {
                        return (
                          <tr key={poolIndex + "list"}>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
                              {poolIndex + 1}
                            </td>
                            <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                              <div className="relative flex items-center">
                                <img
                                  src={
                                    poolsData.filter(
                                      (data) => data?.address.toLowerCase() === pool.address.toLowerCase()
                                    )[0].logoURLs[0]
                                  }
                                  alt=""
                                  className="h-5 w-5"
                                />
                                <img
                                  className="z-10 relative right-2 h-5 w-5"
                                  src={
                                    poolsData.filter(
                                      (data) => data?.address.toLowerCase() === pool?.address.toLowerCase()
                                    )[0]?.logoURLs[1]
                                  }
                                  alt=""
                                />
                                <p>
                                  {
                                    poolsData.filter(
                                      (data) => data?.address.toLowerCase() === pool?.address.toLowerCase()
                                    )[0]?.symbols[0]
                                  }
                                  /{" "}
                                  {
                                    poolsData.filter(
                                      (data) => data?.address.toLowerCase() === pool?.address.toLowerCase()
                                    )[0]?.symbols[1]
                                  }
                                </p>
                              </div>
                            </th>
                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
                              <h3 className="text-left font-medium">
                                {/* {utils.formatEther(pool?.totalSupply)} */}$
                                {pool?.totalSupply?.toString()}
                              </h3>
                            </td>
                            {/* <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center">
                              <span className="mr-2">60%</span>
                              <div classNam?e="relative w-full">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                                  <div className="w-1/2 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
                                </div>
                              </div>
                            </div>
                          </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
            </Item>
          </Item>
          {/* Pools Data */}
        </Grid>
        {/* Column 2 */}
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{ mt: 2 }}
          className="chart__main"
        >
          <Item
            sx={{ pt: 3, pl: 3, pr: 3, pb: 2, mb: 2 }}
            style={{ backgroundColor: "#12122c", borderRadius: "10px" }}
            className="chart "
          >
            {finding && (
              <div style={{ minHeight: "374px", textAlign: "center" }}>
                <CircularProgress style={{ marginTop: "155px" }} />
              </div>
            )}

            {noChartData && (
              <div style={{ minHeight: "374px", textAlign: "center" }}>
                <p
                  style={{
                    color: "white",
                    fontSize: "18px",
                    paddingTop: 160,
                  }}
                >
                  No chart data available
                </p>
              </div>
            )}
            <div
              style={{
                display: noChartData ? "none" : "block",
              }}
            >
              <h4 className="text-left text-lg font-semibold text-white">
                <span className="bg-blue-800 px-4 py-1 my-auto rounded-md">
                  USD
                </span>
              </h4>
              <div ref={chartRef} className="w-full" />
            </div>
            {/* <div ref={switchRef} /> */}
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}
