import React, { StrictMode } from 'react';
import { createRoot as create_root } from 'react-dom/client';
import { Roulette } from './roulette/roulette.jsx';
import './styles.css';

create_root(document.getElementById('app')).render(
  <StrictMode>
    <Roulette />
  </StrictMode>,
);
