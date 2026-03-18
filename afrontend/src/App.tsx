import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { NearbyHelp } from './pages/NearbyHelp';
import './styles/index.css';

const GOOGLE_CLIENT_ID = "60469326972-pmb62h5abiot715isor5iv79aep60la6.apps.googleusercontent.com";

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="nearby" element={<NearbyHelp />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
