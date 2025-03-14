import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomeMain from "./components/home/HomeMain";
import Community from './pages/Community';
import CommunityWrite from './components/community/CommunityWrite';
import CommunityDetail from './components/community/CommunityDetail';
import Signup from './components/home/Signup';
import Counsel from './pages/Counsel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeMain />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/write" element={<CommunityWrite />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            <Route path="/counsel-channel" element={<Counsel />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
export default App;
