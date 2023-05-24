import {
  Button,
  Grid,
  Stack,
  Paper,
  styled,
  Hidden,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

function DashboardCmp() {
  const darkFontColor = "#FFF";
  const [activeSwapColor, setActiveSwapColor] = useState(
    "linear-gradient(to right bottom, #13a8ff, #0074f0)"
  );

  const isMobile = useMediaQuery("(max-width:600px)");

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const location = useLocation();
  return (
    <>
      <Hidden smDown={true}>
        <Grid item xs={12} sm={12} md={9} lg={8}>
          <Item
            elevation={1}
            style={{ backgroundColor: "transparent", color: darkFontColor, boxShadow: "0px 0px 0px 0px" , padding:"0px 0px 8px 0px"  }}
          >
            <Stack direction="row" className="swap_bh">
              <Link to="/staking_pool" style={{ textDecoration: "none" }}>
                <Button
                  size="large"
                  variant="contained"
                  sx={{
                    width: 200,
                    padding: 2,
                    fontWeight: "bold",
                    background:
                      location.pathname === "/staking_pool"
                        ? activeSwapColor
                        : "#12122c",
                  }}
                  onClick={() => setActiveSwapColor("/staking_pool")}
                >
                  Staking
                </Button>
              </Link>
            </Stack>
          </Item>
        </Grid>
      </Hidden>

      <Hidden smUp={true}> 
        <Grid sx={{ overflowX: "scroll" }} item xs={12} sm={12} md={9} lg={8}>
          <Item
            elevation={1}
            style={{ backgroundColor: "transparent", color: darkFontColor }}
            className="swap_b"
          >
            <Stack
              // spacing={2}
              className="swap_b"
              style={{ flexDirection: isMobile ? "column" : "row" }}
            >
              <Link
                to="/staking_pool"
                style={{
                  textDecoration: "none",
                  marginLeft: isMobile ? "0px" : "auto",
                  marginBottom: isMobile ? "4px" : "0px",
                }}
              >
                <Button
                  size={isMobile ? "small" : "large"}
                  variant="contained"
                  sx={{
                    width: 200,
                    padding: 2,
                    fontWeight: "bold",
                    background:
                      location.pathname === "/staking_pool"
                        ? activeSwapColor
                        : "#12122c",
                  }}
                  onClick={() => setActiveSwapColor("/staking_pool")}
                >
                  Staking
                </Button>
              </Link>
            </Stack>
          </Item>
        </Grid>
      </Hidden>

      <Grid item xs={12} md={3} lg={4}>
        {/* <Item>xs=4</Item> */}
      </Grid>
    </>
  );
}

export default DashboardCmp;
