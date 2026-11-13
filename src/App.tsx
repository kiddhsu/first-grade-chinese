import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { RestPrompt } from './components/RestPrompt'
import { ScrollToTop } from './components/ScrollToTop'
import { AuthProfileProvider, useAuthProfile } from './context/AuthProfileContext'
import { MathGame } from './games/MathGame'
import { PunctGame } from './games/PunctGame'
import { RadicalGame } from './games/RadicalGame'
import { RecognizeGame } from './games/RecognizeGame'
import { SentenceGame } from './games/SentenceGame'
import { StrokeGame } from './games/StrokeGame'
import { TwGame } from './games/TwGame'
import { Home } from './pages/Home'
import { MathHub } from './pages/MathHub'
import { MathReview } from './pages/MathReview'
import { ModeHub } from './pages/ModeHub'
import { ProfileSelect } from './pages/ProfileSelect'
import { Review } from './pages/Review'
import { TwHub } from './pages/TwHub'
import { TwReview } from './pages/TwReview'

function AppRoutes() {
  const { ready, activeProfile } = useAuthProfile()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="panel empty">
        <p>載入中…</p>
      </div>
    )
  }

  if (!activeProfile && location.pathname !== '/profiles') {
    return <Navigate to="/profiles" replace />
  }

  return (
    <>
      {activeProfile ? <RestPrompt /> : null}
      <Routes>
        <Route path="/profiles" element={<ProfileSelect />} />
        <Route path="/" element={<Home />} />
        <Route path="/review" element={<Review />} />
        <Route path="/math-review" element={<MathReview />} />
        <Route path="/tw-review" element={<TwReview />} />
        <Route path="/lesson/:lessonId" element={<ModeHub />} />
        <Route path="/lesson/:lessonId/stroke" element={<StrokeGame />} />
        <Route path="/lesson/:lessonId/recognize" element={<RecognizeGame />} />
        <Route path="/lesson/:lessonId/radical" element={<RadicalGame />} />
        <Route path="/lesson/:lessonId/punct" element={<PunctGame />} />
        <Route path="/lesson/:lessonId/sentence" element={<SentenceGame />} />
        <Route path="/math/:unitId" element={<MathHub />} />
        <Route path="/math/:unitId/:modeId" element={<MathGame />} />
        <Route path="/tw/:lessonId" element={<TwHub />} />
        <Route path="/tw/:lessonId/:modeId" element={<TwGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProfileProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <ScrollToTop />
        <div className="app-shell">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProfileProvider>
  )
}
