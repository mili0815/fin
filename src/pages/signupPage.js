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

const SignUpBox = styled.div`
  width: 360px;
  background-color: #ffffff;
  padding: 30px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
`;
const Title = styled.h1`
  text-align: left;
  font-size: 24px;
  margin-bottom: 40px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  color: #333;

  &:placeholder {
    color: #999;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
  font-size: 14px;
  color: #333;

  input {
    margin-right: 8px;
  }

  svg {
    margin-right: 6px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #7d90ff;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: #5f70e0;
  }
`;

export default function SignUpPage() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (userId.trim() === "") {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (password.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (location === "") {
      alert("위치를 입력해주세요.");
      return;
    }
    if (!agree) {
      alert("개인정보 동의가 필요합니다.");
      return;
    }

    try {
      await apiAuth.post("/users/signup", {
        id: userId,
        password,
        location,
        email,
        nickname,
      });
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(
        "회원가입에 실패했습니다.: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <Wrapper>
      <Container>
        <SignUpBox>
          <Title>Weather Fit</Title>
          <form onSubmit={handleSignUp}>
            <Input
              placeholder="아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              placeholder="내 위치 (예: 오산시)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              placeholder="이메일 주소(선택)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="닉네임(선택)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <CheckboxRow>
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
              />
              <label>개인정보 수집에 동의합니다.</label>
            </CheckboxRow>
            <Button onClick={handleSignUp}>가입 완료</Button>
          </form>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            이미 계정이 있으신가요?{" "}
            <Link to="/login" style={{ color: "#7d90ff" }}>
              로그인
            </Link>
          </p>
        </SignUpBox>
      </Container>
    </Wrapper>
  );
}
