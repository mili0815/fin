import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TabBar from "../component/TabBar";
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

const Title = styled.h2`
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  justify-content: center;
`;

const TempInfo = styled.div`
  margin-bottom: 10px;
  line-height: 1.6;
  text-align: center;
  strong {
    font-size: 18px;
    display: block;
    margin-bottom: 4px;
  }

  div {
    font-size: 10px;
  }
`;
const WeatherSummary = styled.div`
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
  text-align: center;

  strong {
    color: #222;
  }
`;

const Card = styled.div`
  background: #f9f9f9;
  padding: 15px;
  margin-top: 20px;
  border-radius: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const SubTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 10px;
`;

const ForecastBox = styled.div`
  min-width: 70px;
  text-align: center;
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;
const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const BaseActivityCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  font-size: 12px;
  gap: 4px;
  min-width: 30px;
  min-height: 70px;
  max-height: 90px;
  overflow: hidden;
  &:hover {
    transform: translateY(-4px);
  }
`;

const IndoorCard = styled(BaseActivityCard)`
  background: #eaf4ff;
`;

const OutdoorCard = styled(BaseActivityCard)`
  background: #e8f9ec;
`;

const FilterTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
`;
const FilterButton = styled.button`
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  ${({ $active }) =>
    $active
      ? `background: #007aff; color: #fff;`
      : `background: #eee; color: #333;`}
`;

const Row = styled.div`
  display: flex;
  overflow-x: auto;
  font-size: 10px;
  gap: 6px;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

function dfs_xy_conv(lat, lon) {
  const RE = 6371.00877,
    GRID = 5.0,
    SLAT1 = 30.0,
    SLAT2 = 60.0,
    OLON = 126.0,
    OLAT = 38.0,
    XO = 43,
    YO = 136;
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;
  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return { x, y };
}

function getBaseTimeAndDate(now = new Date()) {
  const baseTimes = [
    "0200",
    "0500",
    "0800",
    "1100",
    "1400",
    "1700",
    "2000",
    "2300",
  ];
  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];
  let selected = "0200";
  for (let i = baseHours.length - 1; i >= 0; i--) {
    if (
      now.getHours() > baseHours[i] ||
      (now.getHours() === baseHours[i] && now.getMinutes() >= 10)
    ) {
      selected = baseTimes[i];
      break;
    }
  }
  let baseDate = new Date(now);
  if (selected === "2300" && now.getHours() < 2) {
    baseDate.setDate(baseDate.getDate() - 1);
  }
  return {
    base_date: baseDate.toISOString().slice(0, 10).replace(/-/g, ""),
    base_time: selected,
  };
}

const cityToRegId = {
  서울특별시: "11B10101",
  수원시: "11B20601",
  오산시: "11B20604",
  군포시: "11B20606",
  화성시: "11B20610",
};

function getStandardCityName(address) {
  if (cityToRegId[address.city]) return address.city;
  if (cityToRegId[address.town]) return address.town;
  if (cityToRegId[address.village]) return address.village;
  if (cityToRegId[address.county]) return address.county;
  return "서울특별시";
}

export default function ActivitiesPage() {
  const [city, setCity] = useState("현재 위치");
  const [weather, setWeather] = useState({
    current: null,
    feelsLike: null,
    tmx: null,
    tmn: null,
    hourly: [],
  });
  const [filter, setFilter] = useState("all");
  const indoorActivities = [
    { icon: "📚", label: "독서" },
    { icon: "🎬", label: "영화 관람" },
    { icon: "💪", label: "헬스" },
    { icon: "🖼️", label: "전시회" },
    { icon: "🎲", label: "보드게임" },
    { icon: "👩‍🍳", label: "요리" },
    { icon: "🏊‍♀️", label: "실내 수영" },
    { icon: "☕", label: "카페 공부" },
    { icon: "🪴", label: "식물 가꾸기" },
    { icon: "🧘‍♂️", label: "스트레칭" },
  ];

  const outdoorActivities = [
    { icon: "🧍", label: "산책" },
    { icon: "🚴", label: "자전거" },
    { icon: "🧺", label: "피크닉" },
    { icon: "🏕️", label: "캠핑" },
    { icon: "☕", label: "야외 카페" },
    { icon: "📷", label: "사진 찍기" },
    { icon: "🥾", label: "등산" },
    { icon: "🏃‍♂️", label: "달리기" },
    { icon: "🐶", label: "반려견 산책" },
    { icon: "🛍️", label: "야시장" },
  ];
  const getWeatherMessage = (icon) => {
    switch (icon) {
      case "☀️":
        return {
          summary: "오늘은 활동하기 좋은 날씨예요!",
          suggestion: "실외활동 추천☀️",
        };
      case "⛅":
      case "☁️":
        return {
          summary: "흐린 날씨네요.",
          suggestion: "산책이나 실내활동 추천☁️",
        };
      case "🌧️":
        return {
          summary: "비가 오고 있어요.",
          suggestion: "실내활동 추천☔",
        };
      case "❄️":
        return {
          summary: "눈이 내려요!",
          suggestion: "조심히 외출하세요❄️",
        };
      default:
        return {
          summary: "현재 날씨 정보를 가져오는 중입니다.",
          suggestion: "잠시 후 다시 시도해주세요.",
        };
    }
  };

  useEffect(() => {
    async function fetchWeather() {
      const { coords } = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      const { latitude, longitude } = coords;
      const { x: nx, y: ny } = dfs_xy_conv(latitude, longitude);
      const { base_date, base_time } = getBaseTimeAndDate();

      try {
        const rev = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const address = rev.data.address;
        const stdCity = getStandardCityName(address);
        setCity(stdCity);

        const shortRes = await axios.get(
          "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst",
          {
            params: {
              serviceKey:
                "gDM13p7FzT2biQLGvaoOXor+ZZhJiN9eTALQmtCGGwDOXCKz4psaDN62nYIBLxSCsqyfoyvBuQGQeVZe2TGCzw==",
              pageNo: 1,
              numOfRows: 1000,
              dataType: "JSON",
              base_date,
              base_time,
              nx,
              ny,
            },
          }
        );
        const shortData = shortRes.data.response;
        if (shortData.header.resultCode !== "00")
          throw new Error(shortData.header.resultMsg);
        const items = shortData.body.items.item || [];

        const dateTimeMap = {};
        let currentTemp = null,
          currentHumid = null,
          tmx = null,
          tmn = null,
          wct = null;

        for (const it of items) {
          const key = it.fcstDate + it.fcstTime;
          if (!dateTimeMap[key]) dateTimeMap[key] = {};
          if (it.category === "TMP") {
            if (it.fcstDate === base_date && it.fcstTime === base_time) {
              currentTemp = it.fcstValue;
            }
            dateTimeMap[key].TMP = it.fcstValue;
          }
          if (it.category === "REH") {
            if (it.fcstDate === base_date && it.fcstTime === base_time) {
              currentHumid = it.fcstValue;
            }
            dateTimeMap[key].REH = it.fcstValue;
          }
          if (it.category === "WCT") {
            if (it.fcstDate === base_date && it.fcstTime === base_time) {
              wct = it.fcstValue;
            }
            dateTimeMap[key].WCT = it.fcstValue;
          }
          if (it.category === "TMX") {
            if (tmx == null) {
              tmx = it.fcstValue;
            }
            dateTimeMap[key].TMX = it.fcstValue;
          }
          if (it.category === "TMN") {
            if (tmn == null) {
              tmn = it.fcstValue;
            }
            dateTimeMap[key].TMN = it.fcstValue;
          }
          if (it.category === "SKY") dateTimeMap[key].SKY = it.fcstValue;
          if (it.category === "PTY") dateTimeMap[key].PTY = it.fcstValue;
        }

        const tmxItem = items.find((i) => i.category === "TMX");
        const tmnItem = items.find((i) => i.category === "TMN");

        tmx = tmxItem?.fcstValue ?? null;
        tmn = tmnItem?.fcstValue ?? null;

        if (currentTemp == null) {
          const tmpArr = items.filter((i) => i.category === "TMP");
          currentTemp = tmpArr[0]?.fcstValue ?? null;
        }
        if (currentHumid == null) {
          const rehArr = items.filter((i) => i.category === "REH");
          currentHumid = rehArr[0]?.fcstValue ?? null;
        }
        if (wct == null && currentTemp != null && currentHumid != null) {
          const T = parseFloat(currentTemp),
            RH = parseFloat(currentHumid);
          wct = Math.round(T - (0.55 - 0.0055 * RH) * (T - 14.5));
        }

        const todayDate = base_date;
        const keys = Object.keys(dateTimeMap).sort();

        const now = new Date();
        const nowHourStr = now.getHours().toString().padStart(2, "0") + "00";

        let start = keys.findIndex((k) => {
          return k.slice(8) >= nowHourStr;
        });

        if (start < 0) start = 0;

        const sliceKeys = keys.slice(start, start + 24);
        const hourlyArr = sliceKeys.map((k) => {
          const dt = dateTimeMap[k];
          const p = k.slice(8, 10);
          let icon = "☀️";
          if (dt.PTY !== "0") icon = "🌧️";
          else if (dt.SKY === "3") icon = "⛅";
          else if (dt.SKY === "4") icon = "☁️";
          return {
            time: p,
            temp: dt.TMP,
            icon,
            isNow: k === todayDate + base_time,
          };
        });

        setWeather({
          current: currentTemp,
          feelsLike: wct,
          tmx,
          tmn,
          hourly: hourlyArr,
        });
      } catch (err) {
        console.error("단기예보 오류:", err);
      }
    }

    fetchWeather();
  }, []);
  const currentForecast =
    weather.hourly.find((h) => h.isNow) || weather.hourly[0] || {};

  const { summary, suggestion } = getWeatherMessage(currentForecast.icon);
  return (
    <Container>
      <Content>
        <Title>📍{city}</Title>
        {weather.current !== null ? (
          <>
            <TempInfo>
              <strong>
                현재 온도:{" "}
                {weather.current !== null ? parseInt(weather.current) : "--"}°C
              </strong>
              <div>
                체감 온도:{" "}
                {weather.feelsLike !== null
                  ? parseInt(weather.feelsLike)
                  : "--"}
                °C
              </div>
              <div>
                최고: {weather.tmx !== null ? parseInt(weather.tmx) : "--"}°C /
                최저: {weather.tmn !== null ? parseInt(weather.tmn) : "--"}°C
              </div>
            </TempInfo>
            <WeatherSummary>
              <strong>{summary}</strong>
              <br />
              {suggestion}
            </WeatherSummary>

            <FilterTabs>
              {["all", "indoor", "outdoor"].map((key) => (
                <FilterButton
                  key={key}
                  $active={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {key === "all" ? "전체" : key === "indoor" ? "실내" : "실외"}
                </FilterButton>
              ))}
            </FilterTabs>

            {(filter === "all" || filter === "indoor") && (
              <Card>
                <SubTitle>실내 활동</SubTitle>
                <ActivityGrid>
                  {indoorActivities.map((a, i) => (
                    <IndoorCard key={i}>
                      <div style={{ fontSize: 24 }}>{a.icon}</div>
                      <div>{a.label}</div>
                    </IndoorCard>
                  ))}
                </ActivityGrid>
              </Card>
            )}

            {(filter === "all" || filter === "outdoor") && (
              <Card>
                <SubTitle>실외 활동</SubTitle>
                <ActivityGrid>
                  {outdoorActivities.map((a, i) => (
                    <OutdoorCard key={i}>
                      <div style={{ fontSize: 24 }}>{a.icon}</div>
                      <div>{a.label}</div>
                    </OutdoorCard>
                  ))}
                </ActivityGrid>
              </Card>
            )}
            <Card>
              <SubTitle>🕛시간별 예보</SubTitle>
              <Row>
                {weather.hourly.map((item, idx) => (
                  <ForecastBox key={idx}>
                    <div>{item.isNow ? "지금" : `${item.time}시`}</div>
                    <div style={{ fontSize: "20px" }}>{item.icon}</div>
                    <div style={{ fontSize: "14px" }}>{item.temp}°C</div>
                  </ForecastBox>
                ))}
              </Row>
            </Card>
          </>
        ) : (
          <p style={{ textAlign: "center" }}>날씨 정보를 불러오는 중...</p>
        )}
      </Content>

      <TabBar />
    </Container>
  );
}
