import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import apiAuth from "../apiAuth";

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  overflow-y: hidden;
  max-width: 1200px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

const LoginBox = styled.div`
  width: 300px;
  background-color: #ffffff;
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const TopLogo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #4a4a4a;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fafafa;
  color: #454545;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #b0c4de;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #5c85d6;
  border: none;
  border-radius: 8px;
  color: black;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background-color: #454545;
  }
`;

const StyledLink = styled(Link)`
  display: block;
  margin-top: 15px;
  color: #5c85d6;
  font-size: 13px;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (id.trim() === "") {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (password.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await apiAuth.post("/users/login", {
        id,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "로그인 실패");
    }
  };

  return (
    <Wrapper>
      <Container>
        <LoginBox>
          <TopLogo>Weather Fit</TopLogo>
          <form onSubmit={handleLogin}>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="아이디"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <LoginButton type="submit">로그인</LoginButton>
          </form>
          <StyledLink to="/signup">회원가입</StyledLink>
        </LoginBox>
      </Container>
    </Wrapper>
  );
}
