import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MuiSnackbarProvider from "./providers/snackbar";
import NotificationProvider from "./providers/notification";
import Web3Provider from "./providers/web3";
import { Provider as ReduxProvider } from "react-redux";
import configureStore from "./redux/store";

const root = ReactDOM.createRoot(document.getElementById('root'));

const store = configureStore();

root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <MuiSnackbarProvider>
        <NotificationProvider>
          <Web3Provider>
            <App />
          </Web3Provider>
        </NotificationProvider>
      </MuiSnackbarProvider>
    </ReduxProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
