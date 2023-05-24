import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  TextField
} from "@mui/material";
import tw from "twin.macro";
import Web3 from "web3";
import { getERC20TokenData } from "../../config/web3";
import { customList, defaultProvider, userSettings } from "../../config/constants";
import { useDispatch } from "react-redux";
import { ADD_TOKEN, REMOVE_TOKEN } from "../../redux/constants";

const StyledModal = tw.div`
  flex
  flex-col
  relative
  m-auto
  top-1/4
  p-6
  min-h-min
  transform -translate-x-1/2 -translate-y-1/2
  sm:w-1/3 w-11/12
`;

export default function TokenList({mopen, handleClose, selectToken, uniList, selected_chain, selected}) {
    const dispatch = useDispatch();

    const [query, setQuery] = useState("");
    const [filterData, setFilterData] = useState(uniList[selected_chain]);
    const provider = defaultProvider[selected_chain];

    const filterToken = useCallback(async (query) => {
        if (Web3.utils.isAddress(query)) {
            const filterDT = await getERC20TokenData(query, provider, selected_chain, uniList[selected_chain]);
            setFilterData(filterDT);
        } else {
            if (query.length !== 0) {
            const filterDT = uniList[selected_chain].filter((item) => {
                return item["symbol"].toLowerCase().indexOf(query) !== -1 || item["name"].toLowerCase().indexOf(query) !== -1;
            });
            setFilterData(filterDT);
            } else {
            setFilterData(uniList[selected_chain]);
            }
        }
    }, [provider, selected_chain, uniList]);

    useEffect(() => {
        filterToken(query);
    }, [query, filterToken])

    const changeQuery = async (e) => {
        let search_qr = e.target.value.trim();
        setQuery(search_qr);
    }

    const addToken = (e, index) => {
        e.stopPropagation();
        filterData[index].added = true;
        addToCustomList(filterData[index]);
        setFilterData([...filterData]);
    }
    
    const deleteToken = (e, index) => {
        e.stopPropagation();
        filterData[index].added = false;
        removeFromCustomList(filterData[index]);
        setFilterData([...filterData]);
    }

    const addToCustomList = (data) => {
        let _userSetting = JSON.parse(localStorage.getItem(userSettings));
        if (!_userSetting) {
            _userSetting = {};
        }
        if (!_userSetting[customList]) {
            _userSetting[customList] = {};
            _userSetting[customList][selected_chain] = [];
        }
        const index = _userSetting[customList][selected_chain].findIndex(each => each.address === data.address);
        if (index !== -1) return;
        _userSetting[customList][selected_chain].push(data);
        localStorage.setItem(userSettings, JSON.stringify(_userSetting));
        dispatch({
          type: ADD_TOKEN,
          payload: data,
          chain: selected_chain
        });
    }

    const removeFromCustomList = (data) => {
        let _userSetting = JSON.parse(localStorage.getItem(userSettings));
        if (!_userSetting) {
            _userSetting = {};
        }
        if (!_userSetting[customList]) {
            _userSetting[customList] = {};
            _userSetting[customList][selected_chain] = [];
        }
        const index = _userSetting[customList][selected_chain].findIndex(each => each.address === data.address);
        if (index !== -1) {
            _userSetting[customList][selected_chain].splice(index, 1);
            localStorage.setItem(userSettings, JSON.stringify(_userSetting));
        }
        dispatch({
          type: REMOVE_TOKEN,
          payload: data,
          chain: selected_chain
        });
    }

    const clickToken = (item, selected) => {
        setQuery("");
        selectToken(item, selected);
    }

    return (
        <Modal
            open={mopen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <StyledModal className="bg-modal">
            <h3 className="model-title mb-6 text-wight" style={{ color: "#fff" }}>Select Token</h3>
            <TextField
                autoFocus={true}
                value={query}
                onChange={changeQuery}
                label="Search name or paste address"
                inputProps={{
                type: "search",
                style: { color: "#ddd" },
                }}
                InputLabelProps={{
                style: { color: "#ddd" },
                }}
            />
            <hr className="my-6" />
            <ul className="flex flex-col gap-y-2 max-h-[250px]" style={{ overflowY: "scroll" }}>
                {filterData.map((item, index) => {
                const { address, logoURL, symbol } = item;
                if (item.custom) {
                    return (
                        <li
                        key={address}
                        className="flex justify-between items-center gap-x-1 thelist"
                        style={{ cursor: "pointer", padding: "5px" }}
                        onClick={() => clickToken(item, selected)}
                        >
                            <div className="flex items-center">
                                <img src={logoURL} alt="" className="h-[32px] w-[32px]" />
                                <p className="text-light-primary text-lg ml-2">{symbol}</p>
                            </div>
                            {
                                item.added
                                ? <button className="text-light-primary text-md mr-2" onClick={(e) => deleteToken(e, index)}>delete</button>
                                : <button className="text-light-primary text-md mr-2" onClick={(e) => addToken(e, index)}>add</button>
                            }
                        </li>
                    );
                } else {
                    return (
                        <li
                        key={address}
                        className="flex items-center gap-x-1 thelist"
                        style={{ cursor: "pointer", padding: "5px" }}
                        onClick={() => clickToken(item, selected)}
                        >
                            <img src={logoURL} alt="" className="h-[32px] w-[32px]" />
                            <p className="text-light-primary text-lg ml-2">{symbol}</p>
                        </li>
                    );
                }
                })}
            </ul>
            </StyledModal>
        </Modal>
    )
}
