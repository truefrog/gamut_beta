import { Grid, Paper, styled } from '@mui/material'
import React from 'react'
import logo from "../../images/logo.svg";


function Footer() {
  const backgroundColor = "#12122c";
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }} >
      <Grid container sx={{ maxWidth: "1205px", backgroundColor: backgroundColor, marginLeft:"-1px" }} spacing={2} id="footer">
        <Grid item xs={12} md={4}>
          <Item style={{ backgroundColor: "transparent", display:"flex", justifyContent:"center", boxShadow:"0px 0px 0px 0px" }}>
            <img
              src={logo}
              width="150px"
              alt="Logo"
              style={{ marginBottom: "1.1rem", marginTop: "-0.5rem" }}
            />
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item style={{ backgroundColor: "transparent", color: "white" }} elevation={0}>
            &copy; 2023 Gamut | All Rights Reserved
          </Item>
        </Grid>
        <Grid item xs={12}  md={4}>
          <Item style={{ backgroundColor: "transparent", color: "white", display: "flex", justifyContent: "center" }} elevation={0}>
            <a href="https://twitter.com/GamutExchange" target="_blank" rel="noreferrer"><svg viewBox="0 0 950.8571428571428 1024" className="footer-icon"><path d="M925.714 233.143c-25.143 36.571-56.571 69.143-92.571 95.429 0.571 8 0.571 16 0.571 24 0 244-185.714 525.143-525.143 525.143-104.571 0-201.714-30.286-283.429-82.857 14.857 1.714 29.143 2.286 44.571 2.286 86.286 0 165.714-29.143 229.143-78.857-81.143-1.714-149.143-54.857-172.571-128 11.429 1.714 22.857 2.857 34.857 2.857 16.571 0 33.143-2.286 48.571-6.286-84.571-17.143-148-91.429-148-181.143v-2.286c24.571 13.714 53.143 22.286 83.429 23.429-49.714-33.143-82.286-89.714-82.286-153.714 0-34.286 9.143-65.714 25.143-93.143 90.857 112 227.429 185.143 380.571 193.143-2.857-13.714-4.571-28-4.571-42.286 0-101.714 82.286-184.571 184.571-184.571 53.143 0 101.143 22.286 134.857 58.286 41.714-8 81.714-23.429 117.143-44.571-13.714 42.857-42.857 78.857-81.143 101.714 37.143-4 73.143-14.286 106.286-28.571z" className=""></path></svg></a>
            <a href="https://discord.gg/sBZAtdTPyJ" target="_blank" rel="noreferrer"><img src="/logos/discord.svg" alt="discord_logo" className="footer-icon3" /></a>
            <a href="https://t.me/GamutExchange" target="_blank" rel="noreferrer"><svg viewBox="0 0 1024 1024" className="footer-icon4"><path d="M679.429 746.857l84-396c7.429-34.857-12.571-48.571-35.429-40l-493.714 190.286c-33.714 13.143-33.143 32-5.714 40.571l126.286 39.429 293.143-184.571c13.714-9.143 26.286-4 16 5.143l-237.143 214.286-9.143 130.286c13.143 0 18.857-5.714 25.714-12.571l61.714-59.429 128 94.286c23.429 13.143 40 6.286 46.286-21.714zM1024 512c0 282.857-229.143 512-512 512s-512-229.143-512-512 229.143-512 512-512 512 229.143 512 512z" className=""></path></svg></a>
            <a href="https://medium.com/@gamut_exchange" target="_blank" rel="noreferrer"><img src="/logos/medium.svg" alt="medium-logo" className="footer-icon3" /></a>
          </Item>
        </Grid>

      </Grid>
    </div>
  )
}

export default Footer
