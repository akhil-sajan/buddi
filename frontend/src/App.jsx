import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VoiceTherapy from "./VoiceTherapy";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import MainPage from "./pages/mainPage";
import Header from "./common/Header";

export default function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/voice" element={<VoiceTherapy conversationId={1} />} />
        </Routes>
      </Router>

      {/* <VoiceTherapy /> */}
    </div>
  );
}
