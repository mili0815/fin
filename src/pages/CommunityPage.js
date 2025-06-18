import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { css } from "styled-components";
import TabBar from "../component/TabBar";
import userImage from "../img/user.png";
import api from "../api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

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
  overflow-y: auto;
  padding: 24px 20px 80px;
`;

const HeaderCard = styled.div`
  background: #f8f9fb;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const HeaderTextarea = styled.textarea`
  width: 100%;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 10px;
  font-size: 14px;
  resize: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  ${(p) =>
    p.$primary &&
    css`
      background-color: #4f88ff;
      color: #fff;
      border: none;
    `}
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const FilterTag = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  ${(p) =>
    p.active &&
    css`
      background-color: #4f88ff;
      color: #fff;
      border-color: #4f88ff;
    `}
`;

const PostCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const PostUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
`;

const PostContent = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 12px;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
`;

const CommentInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 12px;
`;

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("최신순");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef();

  const handleLike = async (postId) => {
    try {
      await api.post(`/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1 } : p
        )
      );
    } catch (err) {
      console.error("좋아요 오류:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("정말 이 글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("삭제에 실패했습니다.");
    }
  };
  const fetchPosts = useCallback(async () => {
    const res = await api.get("/");
    let data = res.data;
    if (filter === "인기순") {
      data = [...data].sort((a, b) => b.likes - a.likes);
    }
    const withComments = await Promise.all(
      data.map(async (p) => {
        const cr = await api.get(`/${p.id}/comments`);
        return { ...p, comments: cr.data };
      })
    );
    setPosts(withComments);
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onWrite = async () => {
    if (!text.trim()) return;
    const form = new FormData();
    form.append("content", text);
    if (image) form.append("image", image);
    try {
      await api.post("/", form);
      setText("");
      setImage(null);
      fetchPosts();
    } catch (err) {
      console.error("게시글 작성 오류:", err.response?.data || err);
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else {
        alert("게시글 작성 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Container>
      <Content>
        <HeaderCard>
          <HeaderTextarea
            placeholder="오늘 날씨와 옷차림을 공유해 보세요!"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={(e) => setImage(e.target.files[0])}
          />
          {image && <PostImage src={URL.createObjectURL(image)} alt="" />}
          <ButtonGroup>
            <Button onClick={() => fileRef.current.click()}>사진 첨부</Button>
            <Button $primary onClick={onWrite}>
              작성 완료
            </Button>
          </ButtonGroup>
        </HeaderCard>

        <FilterBar>
          {["최신순", "인기순"].map((tag) => (
            <FilterTag
              key={tag}
              $active={filter === tag}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </FilterTag>
          ))}
        </FilterBar>

        {posts.map((p) => (
          <PostCard key={p.id}>
            <PostUser>
              <img src={userImage} alt="" width="24" height="24" />
              <strong>{p.authorNickname || "익명"}</strong>&nbsp;{" "}
              <span style={{ fontSize: 12, color: "#888" }}>
                {dayjs(p.time).fromNow()}
              </span>
            </PostUser>
            <PostContent>{p.content}</PostContent>
            {p.image && <PostImage src={`/uploads/${p.image}`} alt="" />}
            <ButtonGroup>
              <Button onClick={() => handleLike(p.id)}>♡ {p.likes}</Button>
              <Button onClick={() => handleDelete(p.id)}>삭제</Button>
            </ButtonGroup>
            {p.comments.map((c) => (
              <div
                key={c.id}
                style={{ fontSize: 12, margin: "8px 0 0 12px", color: "#555" }}
              >
                <b>{c.authorNickname || "익명"}:</b> {c.content} {""}
                <span style={{ marginLeft: 8, color: "#999" }}>
                  <span>{dayjs(c.time).fromNow()}</span>{" "}
                </span>
              </div>
            ))}
            <CommentInput
              placeholder="댓글 입력 후 Enter"
              onKeyDown={async (e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  try {
                    await api.post(`/${p.id}/comments`, {
                      content: e.target.value,
                    });
                    e.target.value = "";
                    fetchPosts();
                  } catch (err) {
                    console.error("댓글 작성 오류:", err.response?.data || err);
                    if (err.response?.status === 401) {
                      alert("로그인이 필요합니다.");
                    } else {
                      alert("댓글 작성 중 오류가 발생했습니다.");
                    }
                  }
                }
              }}
            />
          </PostCard>
        ))}
      </Content>
      <TabBar />
    </Container>
  );
}
