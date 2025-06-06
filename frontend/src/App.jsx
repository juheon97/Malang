import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { CounselorProfileProvider } from './contexts/CounselorProfileContext';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import LoginCounsel from './pages/login/CounselLogin';
import Community from './pages/community/community';
import CommunityWrite from './components/community/CommunityWrite';
import Counsel from './pages/counsel/Counsel';
import VoiceChannel from './pages/voicechannel/VoiceChannel';
import Signup from './pages/signup/Signup';
import Mypage from './pages/mypage/MyPage';
import VoiceChannelRoom from './pages/voicechannel/VoiceChannelRoom';
import VoiceChannelVideo from './pages/voicechannel/VoiceChannelVideo';
import CounselChannelRoom from './pages/counselchannel/CounselChannelRoom';
import CounselChannelVideo from './pages/counselchannel/CounselChannelVideo';
import VoiceChange from './pages/VoiceChange';
import ProtectedRoute from './components/common/ProtectedRoute';
import { SignLanguageProvider } from './contexts/SignLanguageContext';
import SignLanguagePage from './pages/SignLanguagePage';
import SelfDiagnosis from './pages/SelfDiagnosis';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <CounselorProfileProvider>
            <SignLanguageProvider>
              <Layout>
                <Routes>
                  {/* 공개 라우트 - 인증 필요 없음 */}
                  <Route path="/login-counsel" element={<LoginCounsel />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/Signup" element={<Signup />} />
                  <Route path="/voice-change" element={<VoiceChange />} />
                  <Route path="/self-diagnosis" element={<SelfDiagnosis />} />
                  <Route path="/sign-language" element={<SignLanguagePage />} />
                  {/* 보호된 라우트 - 인증 필요 */}
                  <Route
                    path="/mypage"
                    element={
                      <ProtectedRoute>
                        <Mypage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/community/*"
                    element={
                      <ProtectedRoute>
                        <Community />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/community/write"
                    element={
                      <ProtectedRoute>
                        <CommunityWrite />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/counsel-channel"
                    element={
                      <ProtectedRoute>
                        <Counsel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/voice-channel"
                    element={
                      <ProtectedRoute>
                        <VoiceChannel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/voice-channel-room"
                    element={
                      <ProtectedRoute>
                        <VoiceChannelRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/voice-channel-video"
                    element={
                      <ProtectedRoute>
                        <VoiceChannelVideo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/voice-channel-video/:channelId"
                    element={
                      <ProtectedRoute>
                        <VoiceChannelVideo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/counsel-channel-room"
                    element={
                      <ProtectedRoute>
                        <CounselChannelRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/counsel-channel-video/:counselorCode"
                    element={
                      <ProtectedRoute>
                        <CounselChannelVideo />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </SignLanguageProvider>
          </CounselorProfileProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;