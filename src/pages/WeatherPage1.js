import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TabBar from "../component/TabBar";
import axios from "axios";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  font-family: "Pretendard", sans-serif;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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
  justify-content: center;
  margin-bottom: 10px;
`;

const TempInfo = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
  text-align: center;
  strong {
    font-size: 20px;
    display: block;
    margin-bottom: 4px;
  }
  div {
    font-size: 14px;
  }
`;

const Comment = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #555;
`;

const Card = styled.div`
  background: #f9f9f9;
  padding: 15px;
  margin-top: 20px;
  border-radius: 12px;
`;

const SubTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DayBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ForecastBox = styled.div`
  min-width: 70px;
  text-align: center;
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
  const sn =
    Math.log(Math.cos(slat1) / Math.cos(slat2)) /
    Math.log(
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
        Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    );
  const sf =
    (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1)) /
    sn;
  const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);
  const ra =
    (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);
  let theta = (lon * DEGRAD - olon) * sn;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  return {
    x: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    y: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
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
  const baseDate = new Date(now);
  if (selected === "2300" && now.getHours() < 2)
    baseDate.setDate(baseDate.getDate() - 1);
  return {
    base_date: baseDate.toISOString().slice(0, 10).replace(/-/g, ""),
    base_time: selected,
  };
}

function mapSummaryToIcon(s) {
  if (s.includes("맑음")) return "☀️";
  if (s.includes("구름많음")) return "⛅";
  if (s.includes("흐림") || s.includes("대체로 흐림")) return "☁️";
  if (s.includes("비") || s.includes("소나기")) return "🌧️";
  if (s.includes("눈")) return "❄️";
  if (s.includes("번개")) return "⛈️";
  return "⛅";
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

export default function WeatherPage() {
  const [city, setCity] = useState("현재 위치");
  const [weather, setWeather] = useState({
    current: null,
    feelsLike: null,
    tmx: null,
    tmn: null,
    hourly: [],
  });
  const [weeklyForecast, setWeeklyForecast] = useState([]);

  const getComment = (icon) => {
    switch (icon) {
      case "☀️":
        return "맑은 날이에요! 자외선 주의하세요.";
      case "⛅":
        return "구름이 조금 있어요.";
      case "☁️":
        return "흐린 날씨예요. 우산은 필요 없겠네요.";
      case "🌧️":
        return "비가 와요. 우산을 꼭 챙기세요!";
      case "❄️":
        return "눈이 내려요. 길이 미끄러우니 조심하세요.";
      default:
        return "오늘 날씨를 확인해 보세요.";
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      const { x: nx, y: ny } = dfs_xy_conv(latitude, longitude);
      const { base_date, base_time } = getBaseTimeAndDate();

      const rev = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const address = rev.data.address;
      const stdCity = getStandardCityName(address);
      setCity(stdCity);

      const regId = cityToRegId[stdCity] || cityToRegId["서울특별시"];
      try {
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

        const midBaseDate = now.toISOString().slice(0, 10).replace(/-/g, "");

        const midFcHour =
          now.getHours() < 6 || now.getHours() >= 18 ? "1800" : "0600";
        const tmFc = midBaseDate + midFcHour;
        const midRes = await axios.get(
          "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa",
          {
            params: {
              serviceKey:
                "gDM13p7FzT2biQLGvaoOXor+ZZhJiN9eTALQmtCGGwDOXCKz4psaDN62nYIBLxSCsqyfoyvBuQGQeVZe2TGCzw==",
              pageNo: 1,
              numOfRows: 1,
              dataType: "JSON",
              regId,
              tmFc,
            },
          }
        );
        const midData = midRes.data.response;
        const midItem = Array.isArray(midData.body.items.item)
          ? midData.body.items.item[0]
          : midData.body.items.item;

        const landRes = await axios.get(
          "https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst",
          {
            params: {
              serviceKey:
                "gDM13p7FzT2biQLGvaoOXor+ZZhJiN9eTALQmtCGGwDOXCKz4psaDN62nYIBLxSCsqyfoyvBuQGQeVZe2TGCzw==",
              pageNo: 1,
              numOfRows: 1,
              dataType: "JSON",
              regId,
              tmFc,
            },
          }
        );
        const landItem = Array.isArray(landRes.data.response.body.items.item)
          ? landRes.data.response.body.items.item[0]
          : landRes.data.response.body.items.item;
        const summaryFields = ["wf4Pm", "wf5Pm", "wf6Pm", "wf7Pm"];
        const summaries = summaryFields.map((f) => landItem[f] || "");

        function buildWeeklyForecast(
          items,
          dateTimeMap,
          tmx,
          tmn,
          midItem,
          summaries
        ) {
          const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
          const today = new Date();
          const arr = [];
          for (let d = 0; d < 8; d++) {
            const dt = new Date(today);
            dt.setDate(today.getDate() + d);
            const dayName = weekNames[dt.getDay()];
            const dateKey = dt.toISOString().slice(0, 10).replace(/-/g, "");

            let high = null,
              low = null;

            let icon = "☀️";

            if (d === 0) {
              high = tmx != null ? `${tmx}°C` : "정보 없음";
              low = tmn != null ? `${tmn}°C` : "정보 없음";
              const noonKey = dateKey + "1200";
              const entry = dateTimeMap[noonKey] || {};
              if (entry.PTY != null) {
                if (entry.PTY !== "0") icon = "🌧️";
                else if (entry.SKY === "4") icon = "☁️";
                else if (entry.SKY === "3") icon = "⛅";
              }
            } else if (d <= 3) {
              const lo = items.find(
                (i) => i.category === "TMN" && i.fcstDate === dateKey
              );
              const hi = items.find(
                (i) => i.category === "TMX" && i.fcstDate === dateKey
              );
              if (!lo || !hi) {
                const tmpList = items.filter(
                  (i) => i.category === "TMP" && i.fcstDate === dateKey
                );
                const temps = tmpList.map((i) => parseInt(i.fcstValue));
                low =
                  temps.length > 0 ? `${Math.min(...temps)}°C` : "정보 없음";
                high =
                  temps.length > 0 ? `${Math.max(...temps)}°C` : "정보 없음";
              } else {
                low = `${lo.fcstValue}°C`;
                high = `${hi.fcstValue}°C`;
              }
              const noonKey = dateKey + "1200";
              const entry = dateTimeMap[noonKey] || {};
              if (entry.PTY != null) {
                if (entry.PTY !== "0") icon = "🌧️";
                else if (entry.SKY === "4") icon = "☁️";
                else if (entry.SKY === "3") icon = "⛅";
              }
            } else {
              const midIndex = d + 1;
              const rawLow = Number(midItem[`taMin${midIndex}`]);
              const rawHigh = Number(midItem[`taMax${midIndex}`]);

              low = rawLow && rawLow !== 0 ? `${rawLow}°C` : "정보 없음";
              high = rawHigh && rawHigh !== 0 ? `${rawHigh}°C` : "정보 없음";

              const summary = summaries[d - 4] || "";
              icon = mapSummaryToIcon(summary);
            }
            arr.push({ day: dayName, high, low, icon });
          }

          return arr;
        }

        const weekly = buildWeeklyForecast(
          items,
          dateTimeMap,
          tmx,
          tmn,
          midItem,
          summaries
        );
        setWeeklyForecast(weekly);
      } catch (err) {
        if (err.response) {
          console.error("서버 응답 바디:", err.response.data);
        } else {
          console.error("네트워크/코드 오류:", err);
        }
      }
    });
  }, []);

  const currentForecast =
    weather.hourly.find((h) => h.isNow) || weather.hourly[0] || {};

  return (
    <Container>
      <Content>
        <Title>📍{city}</Title>
        {weather.current != null ? (
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
              <Comment>{getComment(currentForecast.icon)}</Comment>
            </TempInfo>

            <Card>
              <SubTitle>🕛시간별 예보</SubTitle>
              <Row>
                {weather.hourly.map((h, i) => (
                  <ForecastBox key={i}>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      {h.isNow ? "지금" : `${h.time}시`}
                    </div>
                    <div style={{ fontSize: "20px" }}>{h.icon}</div>
                    <div style={{ fontSize: "14px" }}>
                      {" "}
                      {h.temp !== undefined && h.temp !== null
                        ? parseInt(h.temp)
                        : "--"}
                      °C
                    </div>
                  </ForecastBox>
                ))}
              </Row>
            </Card>

            <Card>
              <SubTitle>📅주간 예보</SubTitle>
              <Column>
                {weeklyForecast.map((d, i) => (
                  <DayBox key={i}>
                    <div>{d.day}</div>
                    <div>{d.icon}</div>
                    <div>
                      {d.high !== "정보 없음"
                        ? parseInt(d.high) + "°C"
                        : d.high}
                      {" / "}
                      {d.low !== "정보 없음" ? parseInt(d.low) + "°C" : d.low}
                    </div>
                  </DayBox>
                ))}
              </Column>
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
