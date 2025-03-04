import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import Test from "@/Test.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/*<Test/>*/}
  </StrictMode>
);
