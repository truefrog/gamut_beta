import Web3 from "web3";
import { AccordionDetails, AccordionSummary, Accordion, Box, CircularProgress } from '@mui/material'
import React, { useState, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function History(props) {
  let web3 = new Web3();
  const grayColor = "#6d6d7d";
  const darkFontColorSec = "#13a8ff";
  const [count, setCount] = useState(0);
  const [displayData, setDisplayData] = useState(props.data.data.slice(0, 5));

  const numFormat = (val) => {
    if (Number(val) > 1)
      return Number(val).toFixed(2) * 1;
    else if (Number(val) > 0.001)
      return Number(val).toFixed(4) * 1;
    else if (Number(val) > 0.00001)
      return Number(val).toFixed(6) * 1;
    else
      return Number(val).toFixed(8) * 1;
  }

  const viewBlockUrl = (hash) => {
    window.open(`https://explorer.kava.io/tx/${hash}`);
  };

  const handleChange = (e) => {
    const c_page = Number(e.target.innerText);
    setDisplayData(props.data.data.slice((c_page-1)*5, (c_page-1)*5+5))
  }

  useEffect(() => {
    let cnt = props.data.length / 5;
    cnt = Number(cnt.toFixed(0));
    setCount(cnt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cnt = props.data.data.length / 5;
    cnt = Number(cnt.toFixed(0));
    setCount(cnt);
    setDisplayData(props.data.data.slice(0, 5));
  }, [props.data]);

  return (
    <>
      {props.data.isLoad &&
        <>
          {displayData.map((item) => {
            return (<Accordion
                      key={item.hash}
                      sx={{ minHeight: "20px" }}
                      style={{ backgroundColor: "#12122c", color: "white", boxShadow: "0px 0px 0px 0px" }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                        style={{ marginTop: "0px" }}
                        sx={{ m: 0, pb: 0, pr: 0, mt: 0, mb: 0, pt: 0, pl: 0 }}
                      >
                        <div style={{ width: "100%" }}>
                          <div style={{ float: "left" }}>
                            {item.action_type === 0 &&
                              <span style={{ textAlign: "start", color: "white" }}>
                                Swap {item.token1_symbol} | {item.token2_symbol}
                              </span>
                            }
                            {item.action_type === 1 &&
                              <span style={{ textAlign: "start", color: "white" }}>
                                Add {item.token1_symbol} | {item.token2_symbol}
                              </span>
                            }
                            {item.action_type === 2 &&
                              <span style={{ textAlign: "start", color: "white" }}>
                                Remove {item.token1_symbol} | {item.token2_symbol}
                              </span>
                            }
                          </div>
                          <div style={{ float: "right", display: "inline" }}>
                            <span
                              style={{
                                textAlign: "right",
                                color: "white",
                                float: "right"
                              }}
                            >
                              {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(item.timeStamp * 1000)}
                            </span>
                          </div>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, pl: 0 }}>
                        <div>
                          <span style={{ textAlign: "start", color: grayColor, fontSize: "12px" }}>
                            From:
                          </span>

                          <div style={{ float: "right", display: "inline" }}>
                            <span style={{ textAlign: "right", color: grayColor, fontSize: "12px" }}>
                              {item.amount1?item.amount1:"..."} {item.token1_symbol}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span style={{ textAlign: "start", color: grayColor, fontSize: "12px" }}>
                            To:
                          </span>
                          <div style={{ float: "right", display: "inline" }}>
                            <span style={{ textAlign: "right", color: grayColor, fontSize: "12px" }}>
                              { item.amount2?item.amount2:"..."} {item.token2_symbol }
                            </span>
                          </div>
                        </div>

                        <div>
                          <span style={{ textAlign: "start", color: grayColor, fontSize: "12px" }}>
                            Transaction:
                          </span>

                          <div style={{ float: "right", display: "inline", cursor: "pointer" }}>
                            <span style={{ textAlign: "right", color: darkFontColorSec, fontSize: "12px" }} onClick={() => viewBlockUrl(item.hash)}>
                              {`${item.hash.substring(0, 12)} ... ${item.blockHash.substring(item.hash.length - 6)}`}
                            </span>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>);
            })}
          <div style={{display:"flex", justifyContent:"end", paddingTop:"10px"}}>
            <Pagination count={count} sx={{ button: { color: '#ffffff' } }} color="primary" shape="rounded" onChange={handleChange} />
          </div>
        </>
      }
      {!props.data.isLoad &&
        <Box sx={{ width:"100%", mt:"1rem" }}>
          <div style={{ minHeight: "170px", textAlign: "center" }}>
            <CircularProgress style={{ marginTop: "65px" }} />
          </div>
        </Box>
      }
    </>
  )
}

export default History
