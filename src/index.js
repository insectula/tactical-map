import React from 'react';
import ReactDOM from 'react-dom/client';
import io from "socket.io-client";
import { Provider } from "@syncstate/react";
import { createDocStore } from "@syncstate/core";
import * as remote from "@syncstate/remote-client";
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
