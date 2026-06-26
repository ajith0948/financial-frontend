import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="375593776562-hsmd70bnq6ut5ofikab9mf6kk20r20gv.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);