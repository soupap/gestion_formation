import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

// Get the root element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);