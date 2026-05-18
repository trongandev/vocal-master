import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Community from './pages/Community';
import SongDetail from './pages/SongDetail';
import Leaderboard from './pages/Leaderboard';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardUpload from './pages/dashboard/DashboardUpload';
import DashboardSongEdit from './pages/dashboard/DashboardSongEdit';
import DashboardCommunity from './pages/dashboard/DashboardCommunity';
import DashboardHistory from './pages/dashboard/DashboardHistory';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardTechniques from './pages/dashboard/DashboardTechniques';
import DashboardTechniqueDetail from './pages/dashboard/DashboardTechniqueDetail';
import DashboardTheory from './pages/dashboard/DashboardTheory';
import DashboardTheoryDetail from './pages/dashboard/DashboardTheoryDetail';

import DashboardRoadmap from './pages/dashboard/DashboardRoadmap';
import DashboardRoadmapDetail from './pages/dashboard/DashboardRoadmapDetail';
import DashboardPronunciation from './pages/dashboard/DashboardPronunciation';
import DashboardAIEvaluate from './pages/dashboard/DashboardAIEvaluate';

// Fullscreen Pages
import PlayScreen from './pages/play/PlayScreen';
import ResultsScreen from './pages/results/ResultsScreen';
import ProfileScreen from './pages/profile/ProfileScreen';

import { AuthProvider } from './contexts/AuthContext';

import VocalRangeTest from './pages/VocalRangeTest';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Phase 1: Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="community" element={<Community />} />
          <Route path="song/:id" element={<SongDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
        
        {/* Fullscreen Pages (Public) */}
        <Route path="/vocal-range" element={<VocalRangeTest />} />

        {/* Phase 2: Authenticated Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="upload" element={<DashboardUpload />} />
          <Route path="song/:id/edit" element={<DashboardSongEdit />} />
          <Route path="community" element={<DashboardCommunity />} />
          <Route path="roadmap" element={<DashboardRoadmap />} />
          <Route path="roadmap/:weekId" element={<DashboardRoadmapDetail />} />
          <Route path="pronunciation" element={<DashboardPronunciation />} />
          <Route path="ai-evaluate" element={<DashboardAIEvaluate />} />
          <Route path="history" element={<DashboardHistory />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="theory" element={<DashboardTheory />} />
          <Route path="theory/:theoryId" element={<DashboardTheoryDetail />} />
          <Route path="techniques" element={<DashboardTechniques />} />
          <Route path="techniques/:techniqueId" element={<DashboardTechniqueDetail />} />
        </Route>

        {/* Fullscreen Authenticated Routes */}
        <Route path="/play/:id" element={<PlayScreen />} />
        <Route path="/results/:sessionId" element={<ResultsScreen />} />
        <Route path="/profile/:userId" element={<ProfileScreen />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}

