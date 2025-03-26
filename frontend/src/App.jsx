// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Community from './pages/community/community';
import Counsel from './pages/counsel/Counsel';
import VoiceChannel from './pages/voicechannel/VoiceChannel';
import Signup from './pages/signup/Signup';
import Mypage from './pages/mypage/MyPage';
import VoiceChannelRoom from './pages/voicechannel/VoiceChannelRoom';
import VoiceChannelVideo from './pages/voicechannel/VoiceChannelVideo';
import CounselChannelRoom from './pages/counselchannel/CounselChannelRoom';
import CounselChannelVideo from './pages/counselchannel/CounselChannelVideo';
import VoiceChange from './pages/VoiceChange';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/community/*" element={<Community />} />
            <Route path="/counsel-channel" element={<Counsel />} />
            <Route path="/voice-channel" element={<VoiceChannel />} />
            <Route path="/voice-channel-room" element={<VoiceChannelRoom />} />
            <Route
              path="/voice-channel-video"
              element={<VoiceChannelVideo />}
            />
            <Route
              path="/counsel-channel-room"
              element={<CounselChannelRoom />}
            />
            <Route
              path="/counsel-channel-video"
              element={<CounselChannelVideo />}
            />
            <Route path="/voice-change" element={<VoiceChange />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
export default App;
