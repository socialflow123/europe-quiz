import { useState, useEffect, useRef } from "react";
import questions from "./data/questions.json";

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef(null);

  const current = shuffledQuestions[currentIndex] ?? null;

  const startGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 20);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setShowFeedback(null);
    setEndTime(null);
    setStartTime(Date.now());
    setIsStarted(true);
    setIsLocked(false);
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (
      isStarted &&
      endTime === null &&
      currentIndex === shuffledQuestions.length &&
      shuffledQuestions.length > 0
    ) {
      setEndTime(Date.now());
    }
  }, [isStarted, currentIndex, shuffledQuestions.length, endTime]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleAnswer = (selected) => {
    if (!current || isLocked) return;
    setIsLocked(true);

    const isCorrect = current.type === "choice"
      ? selected === current.answer
      : selected === current.answer;

    setShowFeedback(isCorrect ? "정답입니다!" : "틀렸습니다. 처음부터 다시 시작합니다!");

    const delay = isCorrect ? 800 : 1200;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isCorrect) {
        setShowFeedback(null);
        setCurrentIndex((prev) => prev + 1);
        setIsLocked(false);
      } else {
        const reshuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 20);
        setShuffledQuestions(reshuffled);
        setCurrentIndex(0);
        setShowFeedback(null);
        setStartTime(Date.now());
        setEndTime(null);
        setIsLocked(false);
      }
    }, delay);
  };

  const getElapsedTime = () => {
    if (!startTime || !endTime) return null;
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
  };

  if (!isStarted) {
    return (
      <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#e8f4fc", padding: "40px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "60px", width: "100%", maxWidth: "600px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center", fontSize: "clamp(16px, 4vw, 20px)", lineHeight: "1.8" }}>
          <h1 style={{ fontSize: "clamp(24px, 6vw, 36px)", marginBottom: "20px", wordBreak: "keep-all" }}>🌍 퀴즈 보드게임</h1>
          <p style={{ marginBottom: "32px" }}>
            문제는 총 <strong>20문제</strong>이며, 모두 <strong>랜덤</strong>으로 출제됩니다.<br />
            문제는 객관식 또는 OX 형식입니다.<br />
            <strong>틀리면 처음부터 다시 시작!</strong><br />
            걸린 시간도 측정됩니다 ⏱
          </p>
          <button onClick={startGame} style={{ padding: "16px 40px", fontSize: "clamp(18px, 4vw, 24px)", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", boxShadow: "2px 2px 8px rgba(0,0,0,0.2)" }}>
            🎮 퀴즈 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= shuffledQuestions.length && shuffledQuestions.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "clamp(20px, 4vw, 28px)", textAlign: "center", padding: "40px" }}>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: "bold" }}>🎉 완료했습니다!</h1>
        {getElapsedTime() && (
          <p style={{ marginTop: "24px" }}>⏱ 문제 푸는 데 걸린 시간: <strong>{getElapsedTime()}</strong></p>
        )}
      </div>
    );
  }

  if (!current) {
    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px" }}>
        문제를 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#fdfdfd", position: "relative" }}>
      {showFeedback?.includes("틀렸습니다") && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "120px", color: "red", fontWeight: "bold", pointerEvents: "none", zIndex: 999 }}>
          ❌
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "600px", padding: "32px 20px", fontSize: "clamp(16px, 4vw, 22px)", lineHeight: "1.6" }}>
        <h1 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", wordBreak: "keep-all" }}>
          🌍 퀴즈 보드게임
        </h1>

        <p style={{ fontWeight: "600", marginBottom: "12px" }}>
          {currentIndex + 1} / {shuffledQuestions.length}번 문제
        </p>
        <p style={{ marginBottom: "20px", wordBreak: "keep-all" }}>{current.question}</p>

        {current.image && (
          <img src={current.image} alt="문제 이미지" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", marginBottom: "24px", borderRadius: "12px", border: "1px solid #ccc" }} />
        )}

        {current.type === "choice" ? (
          current.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isLocked}
              style={{
                display: "block",
                width: "100%",
                margin: "12px 0",
                padding: "clamp(14px, 4vw, 20px)",
                fontSize: "clamp(16px, 4vw, 22px)",
                border: "2px solid #999",
                borderRadius: "12px",
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.6 : 1,
                background: "#f4f4f4",
                textAlign: "left"
              }}
            >
              {idx + 1}. {choice}
            </button>
          ))
        ) : (
          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => handleAnswer(true)}
              disabled={isLocked}
              style={{ fontSize: "clamp(24px, 6vw, 36px)", marginRight: "20px", padding: "14px 32px", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.6 : 1 }}
            >
              O
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isLocked}
              style={{ fontSize: "clamp(24px, 6vw, 36px)", padding: "14px 32px", cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.6 : 1 }}
            >
              X
            </button>
          </div>
        )}

        {showFeedback && (
          <p style={{ marginTop: "32px", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: "bold", color: "#222", textAlign: "center" }}>
            {showFeedback}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;