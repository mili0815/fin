// src/pages/OutfitPage.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TabBar from "../component/TabBar";
import axios from "axios";

const Container = styled.div`
  width: 100vw;
  max-width: 600px;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: "Pretendard", sans-serif;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
`;

const TempInfo = styled.div`
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
  strong {
    display: block;
    font-size: 20px;
    margin-bottom: 4px;
  }
  div {
    font-size: 14px;
  }
`;

const Card = styled.div`
  background: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 12px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OutfitCard = styled.div`
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const OptionalCard = styled(OutfitCard)`
  background: #f0f4f8;
  font-weight: 500;
`;

const Tip = styled.div`
  background: linear-gradient(135deg, #4fc3f7, #0288d1);
  color: #fff;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
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
  const re = RE / GRID,
    slat1 = SLAT1 * DEGRAD,
    slat2 = SLAT2 * DEGRAD,
    olon = OLON * DEGRAD,
    olat = OLAT * DEGRAD;
  let sn =
    Math.log(Math.cos(slat1) / Math.cos(slat2)) /
    Math.log(
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
        Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    );
  let sf =
    (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1)) /
    sn;
  let ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);
  let ra =
    (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);
  let theta = (lon * DEGRAD - olon) * sn;
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
const getWeatherTip = (temp, condition) => {
  if (condition === "rain") return "🌧️ 비가 와요. 우산 꼭 챙기세요!";
  if (condition === "snow") return "❄️ 눈이 옵니다. 미끄럼 방지 신발 추천!";
  if (condition === "cloudy")
    return "⛅ 흐린 날씨예요. 가벼운 겉옷을 준비하세요.";
  if (condition === "clear") {
    if (temp >= 26) return "☀️ 매우 더워요! 시원하게 입으세요.";
    if (temp >= 15) return "🌤️ 선선한 맑은 날입니다.";
    if (temp >= 5) return "🍂 쌀쌀해요. 따뜻한 옷차림 필요!";
    return "🧊 매우 추워요! 방한용품 챙기세요.";
  }
  return "오늘의 옷차림을 확인해 보세요.";
};

const outfits = [
  {
    min: 27,
    max: 50,
    base: ["민소매", "반팔 티셔츠", "얇은 반바지", "얇은 원피스"],
    option: ["선크림", "선글라스", "얇은 모자", "쿨링 스프레이", "양산"],
  },
  {
    min: 23,
    max: 26,
    base: ["반팔 티셔츠", "린넨 셔츠 ", "얇은 긴바지", "반바지"],
    option: ["양산", "얇은 아우터 (아침저녁)", "선크림"],
  },
  {
    min: 20,
    max: 22,
    base: ["얇은 긴팔", "반팔 티셔츠", "청바지", "면바지"],
    option: ["가벼운 니트", "가벼운 재킷", "얇은 가디건"],
  },
  {
    min: 17,
    max: 19,
    base: ["얇은 니트 ", "얇은 점퍼", "긴바지"],
    option: ["모자", "가벼운 바람막이"],
  },
  {
    min: 12,
    max: 16,
    base: ["맨투맨", "후드티", "니트", "긴바지"],
    option: ["가벼운 목도리", "트렌치코트", "바람막이"],
  },
  {
    min: 6,
    max: 11,
    base: ["두꺼운 니트", "코트", "청바지", "기모바지"],
    option: ["목도리", "두꺼운 재킷", "얇은 패딩"],
  },
  {
    min: 1,
    max: 5,
    base: ["패딩", "두꺼운 코트", "니트", "히트택"],
    option: ["장갑", "목도리", "귀마개", "핫팩"],
  },
  {
    min: -10,
    max: 0,
    base: ["롱패딩", "두꺼운 니트", "히트택", "부츠"],
    option: ["귀마개", "핫팩", "눈길 방지 신발", "두꺼운 목도리", "장갑"],
  },
  {
    min: -50,
    max: -11,
    base: ["롱패딩", "기모 해트택", "눈길 부츠"],
    option: ["귀마개", "핫팩", "손난로", "스키장갑", "두꺼운 목도리"],
  },
];

export default function OutfitPage() {
  const [city, setCity] = useState("현재 위치");
  const [weather, setWeather] = useState({
    current: null,
    feelsLike: null,
    tmx: null,
    tmn: null,
    condition: "clear",
  });

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

      const resp = shortRes.data.response;
      if (resp.header.resultCode !== "00") {
        console.error("API 오류:", resp.header.resultMsg);
        return;
      }
      const items = resp.body.items.item || [];

      const currentTemp =
        items.find(
          (i) =>
            i.category === "TMP" &&
            i.fcstDate === base_date &&
            i.fcstTime === base_time
        )?.fcstValue ||
        items.find((i) => i.category === "TMP")?.fcstValue ||
        null;

      const currentHumid =
        items.find(
          (i) =>
            i.category === "REH" &&
            i.fcstDate === base_date &&
            i.fcstTime === base_time
        )?.fcstValue ||
        items.find((i) => i.category === "REH")?.fcstValue ||
        null;

      let wct =
        items.find(
          (i) =>
            i.category === "WCT" &&
            i.fcstDate === base_date &&
            i.fcstTime === base_time
        )?.fcstValue || null;
      if (wct == null && currentTemp != null && currentHumid != null) {
        const T = parseFloat(currentTemp),
          RH = parseFloat(currentHumid);
        wct = Math.round(T - (0.55 - 0.0055 * RH) * (T - 14.5));
      }

      const tmx = items.find((i) => i.category === "TMX")?.fcstValue || null;
      const tmn = items.find((i) => i.category === "TMN")?.fcstValue || null;

      let sky = null,
        pty = null;
      for (const it of items) {
        if (it.fcstDate === base_date) {
          if (it.category === "SKY" && sky == null) sky = it.fcstValue;
          if (it.category === "PTY" && pty == null) pty = it.fcstValue;
        }
      }
      let condition = "clear";
      if (pty !== "0") condition = "rain";
      else if (sky === "3" || sky === "4") condition = "cloudy";
      else if (sky === "1") condition = "clear";

      setWeather({ current: currentTemp, feelsLike: wct, tmx, tmn, condition });
    });
  }, []);

  const temp = weather.current != null ? parseFloat(weather.current) : null;
  const selected = outfits.find((o) => temp >= o.min && temp <= o.max) || {
    base: [],
    option: [],
  };
  let option = [...selected.option];
  if (weather.condition === "rain") option.push("우산", "장화");
  if (weather.condition === "snow")
    option.push("미끄럼 방지 신발", "장갑", "우산");
  if (
    weather.feelsLike != null &&
    temp != null &&
    temp <= 4 &&
    temp - weather.feelsLike >= 3
  )
    option.push("따뜻한 목도리", "장갑");

  const tipText = getWeatherTip(temp, weather.condition);

  return (
    <Container>
      <Content>
        <Title>📍{city}</Title>

        <TempInfo>
          <strong>
            현재 온도:
            {weather.current !== null ? parseInt(weather.current) : "--"}°C
          </strong>
          <div>
            체감 온도:{" "}
            {weather.feelsLike !== null ? parseInt(weather.feelsLike) : "--"}
            °C
          </div>
          <div>
            최고: {weather.tmx !== null ? parseInt(weather.tmx) : "--"}°C /
            최저: {weather.tmn !== null ? parseInt(weather.tmn) : "--"}°C
          </div>
        </TempInfo>

        <Card>
          <SubTitle>👕 추천 의상</SubTitle>
          <Column>
            {selected.base.map((it, i) => (
              <OutfitCard key={i}>{it}</OutfitCard>
            ))}
          </Column>
        </Card>

        <Card>
          <SubTitle>👜 선택사항</SubTitle>
          <Column>
            {option.map((it, i) => (
              <OptionalCard key={i}>{it}</OptionalCard>
            ))}
          </Column>
        </Card>

        <Tip>{tipText}</Tip>
      </Content>
      <TabBar />
    </Container>
  );
}
