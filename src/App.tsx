import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RestPrompt } from './components/RestPrompt'
import { PunctGame } from './games/PunctGame'
import { RadicalGame } from './games/RadicalGame'
import { RecognizeGame } from './games/RecognizeGame'
import { SentenceGame } from './games/SentenceGame'
import { StrokeGame } from './games/StrokeGame'
import { Home } from './pages/Home'
import { ModeHub } from './pages/ModeHub'
import { Review } from './pages/Review'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="app-shell">
        <RestPrompt />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/lesson/:lessonId" element={<ModeHub />} />
          <Route path="/lesson/:lessonId/stroke" element={<StrokeGame />} />
          <Route path="/lesson/:lessonId/recognize" element={<RecognizeGame />} />
          <Route path="/lesson/:lessonId/radical" element={<RadicalGame />} />
          <Route path="/lesson/:lessonId/punct" element={<PunctGame />} />
          <Route path="/lesson/:lessonId/sentence" element={<SentenceGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
