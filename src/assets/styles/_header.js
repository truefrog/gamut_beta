import { makeStyles } from "@mui/styles";
const useStyles = makeStyles((theme) => ({
    appbar: {
        height: "88px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // background: `${theme.custom.appbar} !important`,
    },
    toolbar: {
        width: "100%",
        padding: "0px 48px",
        minHeight: 74,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        "& .hacken": {
            padding: "24px 40px",
            "& button": {
                color: "rgb(44 226 179)"
            },
            "& img": {
                margin: "0px 8px",
                marginBottom: 0.75,
                height: "13px"
            },
            "& p": {
                fontWeight: "bold",
                color: "#eee"
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
        }
    },
    logo: {
        height: 72,
    },
    hide: {
        display: "none !important",
    },
    tabs: {
        minHeight: "0px !important",
        "& button": {
            height: "40px",
            minHeight: 0,
            minWidth: "unset",
            textTransform: "none",
            fontWeight: 700,
            margin: "0px 8px",
            padding: "0px 16px",
            letterSpacing: "2px",
        },
        "& .Mui-selected": {
            color: "#fff",
        },
        "& .MuiTabs-indicator": {
            background: "#e55370",
            height: "100%",
            zIndex: -1,
            borderRadius: "16px",
            "&:hover": {
                backgroundColor: "#da012c",
            },
        },
    },
    actionGroup: {
        display: "flex",
        alignItems: "center",

        "& button": {
            boxShadow: "0px 0px 0px",
            borderRadius: "0px 0px 0px",
        }
    },
    actionGroupState: {
        display: "flex",
        alignItems: "center",
    },
    actionGroupSymbol: {
        "& img": {
            height: 32,
            borderRadius: 50,
            padding: "4px",
            border: "1px solid #2072d6",
        },
    },
    actionGroupPrice: {
        color: "#fff",
        fontWeight: "bold !important",
        textShadow: "0 0 12px #fff",
        minWidth: 80,
    },
    connectWallet: {
        display: "flex",
        background: "#e55370",
        alignItems: "center",
        borderRadius: 18,
        marginLeft: "8px",
        "& p": {
            fontSize: 13,
            fontWeight: "bold",
        },
        "& button": {
            boxShadow: "0 0 25px 2px rgb(0 0 0 / 15%)",
            textTransform: "none"
        },
    },
    darkModeButton: {
        padding: "8px !important",
        marginLeft: `16px!important`,
    },
    drawerButton: {
        padding: "8px !important",
        marginLeft: `16px!important`,
    },
    drawer: {
        "& .connectButton": {
            width: "100%",
            height: "48px",
            margin: "16px 0px",
            background: "linear-gradient(90deg, #e55370, #435ee8)",
        },
        "& ul": {
            paddingTop: "24px",
            "& > a": {
                color: "unset",
                "& > div": {
                    padding: "8px 32px",
                }
            },
            "& > div": {
                padding: "8px 32px",
            },
        },
        "& .MuiListItemIcon-root": {
            minWidth: "unset",
        },
    },

    menuWrapper: {
        backgroundColor:"white!important",
        color: "#4b6998!important"
    },

    darkMenuWrapper: {
        backgroundColor:"black!important",
        color: "white!important"
    }
}));
export default useStyles;
