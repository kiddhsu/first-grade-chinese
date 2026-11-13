import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RestPrompt } from './components/RestPrompt'
import { ScrollToTop } from './components/ScrollToTop'
import { MathGame } from './games/MathGame'
import { PunctGame } from './games/PunctGame'
import { RadicalGame } from './games/RadicalGame'
import { RecognizeGame } from './games/RecognizeGame'
import { SentenceGame } from './games/SentenceGame'
import { StrokeGame } from './games/StrokeGame'
import { Home } from './pages/Home'
import { MathHub } from './pages/MathHub'
import { MathReview } from './pages/MathReview'
import { ModeHub } from './pages/ModeHub'
import { Review } from './pages/Review'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <div className="app-shell">
        <RestPrompt />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/math-review" element={<MathReview />} />
          <Route path="/lesson/:lessonId" element={<ModeHub />} />
          <Route path="/lesson/:lessonId/stroke" element={<StrokeGame />} />
          <Route path="/lesson/:lessonId/recognize" element={<RecognizeGame />} />
          <Route path="/lesson/:lessonId/radical" element={<RadicalGame />} />
          <Route path="/lesson/:lessonId/punct" element={<PunctGame />} />
          <Route path="/lesson/:lessonId/sentence" element={<SentenceGame />} />
          <Route path="/math/:unitId" element={<MathHub />} />
          <Route path="/math/:unitId/:modeId" element={<MathGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
