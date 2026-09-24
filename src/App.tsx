import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Days from './pages/Days'
import Finance from './pages/Finance'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ProgressPage from './pages/Progress'
import Review from './pages/Review'
import QuestDetail from './pages/QuestDetail'
import Quests from './pages/Quests'
import SkillDetail from './pages/SkillDetail'
import Skills from './pages/Skills'
import Victory from './pages/Victory'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/quests/:goalId" element={<QuestDetail />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/:pathId" element={<SkillDetail />} />
        <Route path="/days" element={<Days />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/victory" element={<Victory />} />
      </Route>
    </Routes>
  )
}
