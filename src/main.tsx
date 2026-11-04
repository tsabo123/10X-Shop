import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, CartProvider, ThemeProvider } from './contexts';
import App from './ui/App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><ThemeProvider><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></ThemeProvider></BrowserRouter></React.StrictMode>);
