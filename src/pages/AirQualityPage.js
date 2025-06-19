import React, { useEffect, useState } from "react";
import TabBar from "../component/TabBar";
import styled from "styled-components";
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 20px;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: ${({ $grade }) => {
    if ($grade === "좋음") return "#4FC3F7";
    if ($grade === "보통") return "#81C784";
    if ($grade === "나쁨") return "#FFB74D";
    if ($grade === "매우나쁨") return "#E57373";
    return "#EEEEEE";
  }};
  border-radius: 20px;
  padding: 32px 24px;
  margin-bottom: 30px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
`;
const PollutantList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const PollutantCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PollutantName = styled.div`
  font-size: 15px;
  color: #555;
  margin-bottom: 8px;
`;

const PollutantValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #4a90e2;
`;

const TipCard = styled.div`
  height: 160px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
`;

const AirQualityPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const convertGrade = (gradeNum) => {
    switch (parseInt(gradeNum, 10)) {
      case 1:
        return "좋음";
      case 2:
        return "보통";
      case 3:
        return "나쁨";
      case 4:
        return "매우나쁨";
      default:
        return "정보없음";
    }
  };

  const airQualityTips = {
    1: "🍃 오늘은 공기가 매우 좋습니다! 야외활동 적극 추천합니다.",
    2: "🌿 공기질이 비교적 양호합니다. 산책하기 좋은 날이에요.",
    3: "😷 공기가 다소 나쁩니다. 외출시 마스크를 착용하세요.",
    4: "🚫 매우 나쁨! 가급적 외출을 피하시고 실내에 머무르세요.",
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      try {
        const rev = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const region =
          rev.data.address.state ||
          rev.data.address.city ||
          rev.data.address.county;

        let sidoName = "서울";
        if (region.includes("경기")) sidoName = "경기";
        else if (region.includes("인천")) sidoName = "인천";
        else if (region.includes("부산")) sidoName = "부산";
        else if (region.includes("대구")) sidoName = "대구";
        else if (region.includes("광주")) sidoName = "광주";
        else if (region.includes("울산")) sidoName = "울산";
        else if (region.includes("대전")) sidoName = "대전";

        const airRes = await axios.get(
          "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty",
          {
            params: {
              serviceKey:
                "gDM13p7FzT2biQLGvaoOXor+ZZhJiN9eTALQmtCGGwDOXCKz4psaDN62nYIBLxSCsqyfoyvBuQGQeVZe2TGCzw==",
              sidoName,
              returnType: "json",
              numOfRows: 1,
              pageNo: 1,
              ver: "1.3",
            },
          }
        );
        const resp = airRes.data;
        const rawItems = resp.response?.body?.items;
        let itemsArray = [];
        if (Array.isArray(rawItems)) {
          itemsArray = rawItems;
        } else if (Array.isArray(rawItems?.item)) {
          itemsArray = rawItems.item;
        }

        if (itemsArray.length === 0) {
          console.warn("대기질 데이터가 없습니다.", resp);
          setData(null);
        } else {
          setData(itemsArray[0]);
        }
      } catch (err) {
        console.error("대기질 데이터 호출 오류", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);
  const isValidGrade =
    data?.khaiGrade && data.khaiGrade !== "_" && data.khaiGrade !== "통신장애";

  const gradeText = isValidGrade ? convertGrade(data.khaiGrade) : "정보없음";
  const tipText = isValidGrade
    ? airQualityTips[parseInt(data.khaiGrade, 10)]
    : "현재 공기질 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.";
  return (
    <Container>
      <Content>
        <Title>🌫️ 실시간 대기질</Title>

        <SummaryCard $grade={gradeText}>
          {loading
            ? "데이터 불러오는 중..."
            : `오늘 공기질은 '${gradeText}' 입니다.`}
        </SummaryCard>

        <PollutantList>
          <PollutantCard>
            <PollutantName>미세먼지 (PM10)</PollutantName>
            <PollutantValue>{data?.pm10Value ?? "--"} ㎍/㎥</PollutantValue>
          </PollutantCard>

          <PollutantCard>
            <PollutantName>초미세먼지 (PM2.5)</PollutantName>
            <PollutantValue>{data?.pm25Value ?? "--"} ㎍/㎥</PollutantValue>
          </PollutantCard>

          <PollutantCard>
            <PollutantName>오존 (O₃)</PollutantName>
            <PollutantValue>{data?.o3Value ?? "--"} ppm</PollutantValue>
          </PollutantCard>

          <PollutantCard>
            <PollutantName>이산화질소 (NO₂)</PollutantName>
            <PollutantValue>{data?.no2Value ?? "--"} ppm</PollutantValue>
          </PollutantCard>
        </PollutantList>
        <TipCard>{loading ? "추천 가이드 로딩중..." : tipText}</TipCard>
      </Content>

      <TabBar />
    </Container>
  );
};

export default AirQualityPage;
