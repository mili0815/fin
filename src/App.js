import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import WeatherPage1 from "./pages/WeatherPage1";
import ActivitiesPage from "./pages/ActivitiesPage";
import OutfitPage from "./pages/OutfitPage";
import AirQualityPage from "./pages/AirQualityPage";
import CommunityPage from "./pages/CommunityPage";
import SettingPage from "./pages/SettingPage";
import SignUpPage from "./pages/signupPage";
import TestWeather from "./pages/TestWeather";
function App() {
  return (
    <div className="App">
      <Routes>
        {/*기본 경로 로그인 페이지 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/*로그인 후 이동 페이지*/}
        <Route path="/test" element={<TestWeather />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/weather" element={<WeatherPage1 />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/outfit" element={<OutfitPage />} />
        <Route path="/air-quality" element={<AirQualityPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/setting" element={<SettingPage />} />
      </Routes>
    </div>
  );
}

export default App;
