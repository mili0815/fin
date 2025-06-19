import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { MapPin, Globe, Bell, LogOut } from "lucide-react";
import TabBar from "../component/TabBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 600px;
  max-height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  font-family: "Pretendard", sans-serif;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
  color: #555;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin-bottom: 30px;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  display: flex;
  align-itmes: center;
  gap: 10px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 12px;
  width: 100%;
  margin-top: 15px;
`;

const PrimaryButton = styled.button`
  padding: 12px 20px;
  width: 100%;
  background-color: #4a90e2;
  color: white;
  border:none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color: 0.3s;

  &:hover{
    background-color: #3b7dd8'
  }
`;

const DangerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 12px 24px;
  background-color: transparent;
  color: #e74c3c;
  border-radius: 14px;

  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  transtition: background-color 0.25 ease, color 0.25s ease,
    box-shadow 0.25s ease;
  &:hover {
    background-color: #e74c3c;
    color: #fff;
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-itmes: center;
  justify-content: space-between;
  margin-top: 20px;
`;

const FooterButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 40px;
  padding: 12px 20px;
  border: none;
  background-color: #4a90e2;
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ccc;
  width: 100%;
  margin-top: 15px;
  font-size: 16px;
  line-height: 1.2;
`;

const InfoText = styled.p`
  margin-top: 15px;
  color: #777;
  font-size: 14px;
`;

const PolicyLinks = styled.div`
  margin-top: 5px;
  display: flex;
  gap: 10px;
  font-size: 14px;
`;

const LinkStyled = styled.a`
  color: #4a90e2;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

async function reverseGeocode(lat, lon) {
  const res = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );
  const addr = res.data.address;
  return addr.city || addr.town || addr.state || "";
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [useCurrent, setUseCurrent] = useState(false);
  const [unit, setUnit] = useState("C"); // "C" or "F"
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    const savedLoc = localStorage.getItem("location") || "";
    const savedUseCurrent = localStorage.getItem("useCurrent") === "true";
    const savedUnit = localStorage.getItem("unit") || "C";
    const savedNotif = localStorage.getItem("notifications") === "true";

    setUseCurrent(savedUseCurrent);
    setUnit(savedUnit);
    setNotifications(savedNotif);

    if (savedUseCurrent) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const city = await reverseGeocode(coords.latitude, coords.longitude);
          setLocation(city);
        },
        () => setLocation(savedLoc || "")
      );
    } else {
      setLocation(savedLoc);
    }
  }, []);

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = await reverseGeocode(coords.latitude, coords.longitude);
        setLocation(city);
        setUseCurrent(true);
      },
      () => alert("현재 위치를 가져오는 데 실패했습니다.")
    );
  };

  const handleSave = () => {
    localStorage.setItem("location", location);
    localStorage.setItem("useCurrent", useCurrent);
    localStorage.setItem("unit", unit);
    localStorage.setItem("notifications", notifications);
    alert("설정이 저장되었습니다.");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Container>
      <Content>
        <Title>설정 및 내 위치</Title>
        <Description>Weather Fit을 더 편리하게 이용해보세요.</Description>

        <Card>
          <CardTitle>
            <MapPin size={20} /> 내 위치 설정
          </CardTitle>
          <Input
            placeholder="예: 오산시"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setUseCurrent(false);
            }}
            disabled={useCurrent}
          />
          <PrimaryButton onClick={handleCurrentLocation}>
            현재 위치 가져오기
          </PrimaryButton>
          <p style={{ marginTop: 10, color: "#4A90E2" }}>
            {useCurrent
              ? "✅ 위치 권한 허용됨"
              : "⚠️ 직접 입력 또는 ‘현재 위치 가져오기’ 버튼 사용"}
          </p>
        </Card>

        <Card>
          <CardTitle>
            <Globe size={20} /> 기본 설정
          </CardTitle>
          <ToggleRow>
            <span>온도 단위</span>
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="C">섭씨 (°C)</option>
              <option value="F">화씨 (°F)</option>
            </Select>
          </ToggleRow>
          <ToggleRow>
            <span>
              <Bell size={16} style={{ marginRight: 6 }} />
              날씨 알림
            </span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </ToggleRow>
          <FooterButton onClick={handleSave}>저장</FooterButton>
        </Card>

        <Card>
          <CardTitle>계정 및 앱 정보</CardTitle>
          <ToggleRow>
            <span>로그인 상태</span>
            <DangerButton onClick={handleLogout}>
              <LogOut size={16} style={{ position: "relative", top: 2 }} />
              로그아웃
            </DangerButton>
          </ToggleRow>
          <InfoText>서비스 정보 | v1.0</InfoText>
          <PolicyLinks>
            <LinkStyled href="/privacy-policy.html" target="_blank">
              개인정보 처리방침
            </LinkStyled>
          </PolicyLinks>
        </Card>
      </Content>
      <TabBar />
    </Container>
  );
}
