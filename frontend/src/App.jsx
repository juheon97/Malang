// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Community from './pages/Community';
import CommunityWrite from './components/community/CommunityWrite';
import CommunityDetail from './components/community/CommunityDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          {/* 다른 라우트들 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
