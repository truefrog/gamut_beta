import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    
    root: {
        display: "flex",
        flexDirection: "column",
    },
    content: {
        minHeight: "calc(100% - 176px)",
        overflow: "hidden",
    },
    mobileContent: {
        "& > div": {
            padding: "3px 1px",
        },
    },
    spinRoot: {
        position: "fixed",
        zIndex: 2000,
        top: 88,
        left: 0,
        bottom: 0,
        right: 0,
        // background: theme.custom.spinner,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        "& img": {
            height: 168,
            marginBottom: -32,
        },
        "& .progress": {
            width: "20px",
            marginTop: "4px",
            backgroundColor: "rgba(0,0,0,.2)",
            borderRadius: 8,
            "& > div": {
                background: "#fff",
            },
        },
    },
    hide: {
        display: "none",
    },
    coinList: {
        maxWidth: "480px !important",
        "& .action": {
            "& h2": {
                padding: "1.5px 2px",
                paddingBottom: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
        },
        "& .title": {
            fontSize: 24,
            textAlign: "center",
            fontWeight: "bold",
        },
        "& .coin-list": {
            maxHeight: 600,
            overflow: "auto",
            padding: "0px",
            "& .item": {
                padding: "1px 5px",
                "& .rank": {
                    minWidth: 40,
                    fontWeight: 600,
                    fontSize: 18,
                },
                "& .symbol": {
                    "& img": {
                        width: 36,
                        height: 36,
                    },
                },
                "& .name": {
                    "& > span": {
                        fontWeight: 600,
                        fontSize: 18,
                    },
                    "& > p": {
                        fontSize: 16,
                        "& > span": {
                            margin: "0px 1.5px",
                            fontSize: 16,
                        },
                        "& .bad": {
                            color: "red",
                        },
                        "& .good": {
                            color: "green",
                        },
                    },
                    padding: "0px 2px",
                },
            },
        },
        "& .progress": {
            height: 6,
        },
        "& .hide": {
            visibility: "hidden",
            transition: 0.25,
        },
    },
    connectWalletButton: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "2px 2px",
        paddingTop: 0,
        "& > button": {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1px",
            marginBottom: "2px",
            "& span": {
                margin: 0,
            },
            "& img": {
                width: "24px",
                height: "24px",
            },
        },
        // borderRadius: theme.shape.borderRadius,
        "& .buttonGroup": {
            marginTop: "16px",
            padding: "8px",
        },
        "& .MuiInputBase-formControl": {
            "& input": {
                padding: "8px",
            },
            "&:before": {
                display: "none",
            },
            "&:after": {
                display: "none",
            },
        },
        "& p": {
            fontSize: 13,
            fontWeight: "bold",
        },
        "& > span": {
            fontSize: 16,
            marginBottom: "16px",
        },
    },
    deactivateButton: {
        display: "flex",
        alignItems: "center",
        padding: "0px 32px",
        marginTop: "16px",
        marginBottom: "64px",
        "& button": {
            width: "100%",
            height: "40px",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            // boxShadow: theme.shadows[0],
            "&:hover": {
                // boxShadow: theme.shadows[1],
            },
        },
    },
    connectWallet: {
        maxWidth: "420px !important",
        minWidth: "360px !important",
        padding: "24px 24px",
        backgroundColor: "white!important",
        color:"#4b6998!important",
        width: "inherit",
        border: "1px solid gray",

        "& .action": {
            padding: "16px",
            paddingLeft: "24px",
            "& h2": {
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
            "& button": {
                marginTop: 6,
                marginBottom: 6,
                padding: "0px",
            },
        },
        "& .title": {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
            marginLeft: 0,
            margin: "auto",
        },
        "& .subtitle": {
            fontWeight: 600,
            textAlign: "center",
            "& b": {
                padding: "0px 16px",
            },
        },
        "& .wallet-list": {
            padding: "32px 0px",
            "& .item": {
                padding: "8px 32px",
                borderRadius: 16,
                border: "none",
                "& .symbol": {
                    "& img": {
                        width: 42,
                        height: 42,
                    },
                },
                "& .name": {
                    "& > span": {
                        fontWeight: 600,
                    },
                    "& > p": {
                        fontWeight: 600,
                    },
                    padding: "0px 16px",
                },
            },
        },
    },
    darkConnectWallet: {
        maxWidth: "420px !important",
        minWidth: "360px !important",
        padding: "24px 24px",
        backgroundColor: "#07071c!important",
        color: "white!important",
        width: "inherit",
        border: "1px solid gray",
        borderRadius:"8px!important",

        "& .action": {
            padding: "16px 16px",
            paddingLeft: "24px",
            "& h2": {
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
            "& button": {
                marginTop: 6,
                marginBottom: 6,
                padding: "0px",
            },
        },
        "& .title": {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
            marginLeft: 0,
            margin: "auto",
        },
        "& .subtitle": {
            fontWeight: 600,
            textAlign: "center",
            "& b": {
                padding: "0px 16px",
            },
        },
        "& .wallet-list": {
            padding: "0px",
            "& .item": {
                padding: "8px 32px",
                borderRadius: 16,
                border: "none",
                "& .symbol": {
                    "& img": {
                        width: 42,
                        height: 42,
                    },
                },
                "& .name": {
                    "& > span": {
                        fontWeight: 600,
                    },
                    "& > p": {
                        fontWeight: 600,
                    },
                    padding: "0px 16px",
                },
            },
        },
    }
}));
export default useStyles;
