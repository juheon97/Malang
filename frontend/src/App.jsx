import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomeMain from './components/home/HomeMain';
import Login from './components/login/Login'; // Login 컴포넌트 import 경로 수정
import CommunityList from './components/community/CommunityList';
import CommunityWrite from './components/community/CommunityWrite';
import CommunityDetail from './components/community/CommunityDetail';
import Counsel from './pages/counsel/Counsel';
import VoiceChannel from './pages/voicechannel/VoiceChannel';
import Signup from './components/signup/Signup';
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
            <Route path="/" element={<HomeMain />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/community" element={<CommunityList />} />
            <Route path="/community/write" element={<CommunityWrite />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
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
