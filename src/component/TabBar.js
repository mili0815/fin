import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const TabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: "/weather", label: "날씨" },
    { path: "/air-quality", label: "대기질" },
    { path: "/activities", label: "추천활동" },
    { path: "/home", label: "홈" },
    { path: "/outfit", label: "옷차림 추천" },
    { path: "/community", label: "커뮤니티" },
    { path: "/setting", label: "설정" },
  ];
  return (
    <TabbBarWrapper>
      {tabs.map((tab) => (
        <TabButton
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={location.pathname === tab.path ? "active" : ""}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabbBarWrapper>
  );
};

export default TabBar;

const TabbBarWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #eee;
  background: #fafafa;
`;

const TabButton = styled.button`
  text-decoraion: none;
  background: none;
  border: none;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;

  &.active {
    color: #000;
  }
`;
