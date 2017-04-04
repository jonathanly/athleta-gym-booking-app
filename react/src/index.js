import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

// Axios baseURL config
import axios from 'axios';
axios.defaults.baseURL = `${process.env.REACT_APP_API_URL}`;

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
),
  document.getElementById('root')
);
