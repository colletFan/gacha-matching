import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import SlotPage from './pages/SlotPage';
import LadderPage from './pages/LadderPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/slot" element={<SlotPage />} />
          <Route path="/ladder" element={<LadderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
