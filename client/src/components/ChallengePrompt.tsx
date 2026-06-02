import React, { useState, useEffect } from "react";
import "./ChallengePrompt.css";

interface ChallengePromptProps {
  onChallenge: () => void;
  isCurrentAsker: boolean;
}

export default function ChallengePrompt({ onChallenge, isCurrentAsker }: ChallengePromptProps) {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="challenge-prompt">
      <div className="challenge-content">
        {isCurrentAsker ? (
          <>
            <h3>⏳ Waiting for Challenge</h3>
            <p>Other players can challenge your claim!</p>
          </>
        ) : (
          <>
            <h3>❓ Challenge This Claim?</h3>
            <p>Do you think the asker is bluffing?</p>
            <button className="btn btn-warning btn-large" onClick={onChallenge}>
              Challenge! 🎯
            </button>
          </>
        )}
        <div className="time-indicator">
          <div className="time-bar" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
          <p>{timeLeft}s</p>
        </div>
      </div>
    </div>
  );
}
