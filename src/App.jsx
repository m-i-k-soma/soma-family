import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAppSettings } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import SettingPage from "./pages/SettingPage";
import MusicPage from "./pages/MusicPage";
import AlbumPage from "./pages/AlbumPage";
import SchedulePage from "./pages/SchedulePage";
import StreamLogPage from "./pages/StreamLogPage";
import BackButton from "./components/BackButton";

function App() {
  const { bgColor, bgImage, bgm } = useAppSettings();

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{
        backgroundColor: bgColor, // ← ここが主役
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {bgm && <audio src={bgm} autoPlay loop controls={false} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/album" element={<AlbumPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/stream" element={<StreamLogPage />} />
      </Routes>
      <BackButton />
    </div>
  );
}

export default App;


