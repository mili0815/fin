import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logo from "../img/logo.png";

const Wrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;
const Layout = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const LeftColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 65%;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
  }
`;

const IntroCard = styled.div`
  background-color: #d3eaff;
  border-radius: 20px;
  height: 20vh;

  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IntroText = styled.div`
  font-size: 20px;
  line-height: 1.6;
  max-width: 80%;
  margin-right: 20px;
  padding: 20px;
`;

const Logo = styled.img`
  height: 150px;
  width: 150px;
  margin-left: 20px;
  padding: 24px;
  border-radius: 50%;
`;

const Card = styled.div`
  aspect-ratio: 1 / 1;
  background: white;
  border-radius: 20px;
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 170px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5;);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 4px 18px;
  }
`;

const CardTitle = styled.h2`
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Button = styled(Link)`
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  padding: 6px 10px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background-color: #0056b3;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const Home = () => {
  return (
    <Wrapper>
      <Container>
        <Title>Weather Fit</Title>
        <Layout>
          <LeftColumn>
            <IntroCard>
              <IntroText>
                <p>
                  <strong>Weather Fit</strong>으로, <br />
                  날씨에 맞는 옷차림과 활동을추천받고, <br />
                  오늘의 날씨를 한눈에 확안하세요!
                </p>
              </IntroText>
              <Logo src={logo} alt="logo" />
            </IntroCard>

            <Grid>
              <Card>
                <CardTitle>오늘의 날씨</CardTitle>
                <p>실시간 날씨 보기</p>
                <Button to="/weather">↗️</Button>
              </Card>

              <Card>
                <CardTitle>추천 활동</CardTitle>
                <p>오늘의 활동 추천</p>
                <Button to="/activities">↗️</Button>
              </Card>

              <Card>
                <CardTitle>옷차림 추천</CardTitle>
                <p>입을 옷 추천</p>
                <Button to="/outfit">↗️</Button>
              </Card>

              <Card>
                <CardTitle>대기질</CardTitle>
                <p>대기질 바로보기</p>
                <Button to="/air-quality">↗️</Button>
              </Card>

              <Card>
                <CardTitle>커뮤니티</CardTitle>
                <p>커뮤니티 참여하기</p>
                <Button to="/community">↗️</Button>
              </Card>

              <Card>
                <CardTitle>설정 & 내 위치</CardTitle>
                <p>위치 설정하기</p>
                <Button to="/setting">↗️</Button>
              </Card>
            </Grid>
          </LeftColumn>
        </Layout>
      </Container>
    </Wrapper>
  );
};

export default Home;
