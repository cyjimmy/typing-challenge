import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: 0 auto;
  overflow-x: hidden;

  & textarea {
    margin-bottom: 1rem;
    height: 15vh;
    padding: 1rem;
  }
`;

const EssayContainer = styled.div`
  background-color: white;
  height: 30vh;
  overflow: scroll;
  width: 90%;
  margin: 2rem auto;
  overflow-x: hidden;
  text-align: left;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StartButton = styled.button`
  width: 7rem;
  margin: 0 auto;

  &:hover {
    cursor: pointer;
  }
`;

const CountDown = styled.div`
  background-color: white;
  padding: 1rem;
  font-size: 1.5rem;
  border-radius: 10px;
  border: 3px solid black;
  width: 3rem;
  margin: 0 auto;
  margin-top: 1rem;
  pointer-events: none;
`;

const Result = styled.div`
  font-size: 1.5rem;
  color: white;
  border: 3px solid white;
  width: fit-content;
  margin: 1rem auto;
  padding: 1rem;
  border-radius: 10px;
`;

const essay = `This is a typing test.`;

export default function SoloChallenge() {
  const challengeTime = 5;

  const [startTime, setStartTime] = useState(challengeTime);
  const [timerActivate, setTimerActivate] = useState(false);
  const [userInputDisable, setUserInputDisable] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [accuracy, setAccuracy] = useState();
  const [WPM, setWPM] = useState();
  const [wordTyped, setWordTyped] = useState();
  const [correctWord, setCorrectWord] = useState();
  const userInput = useRef();
  const countDownTimer = useRef();

  useEffect(() => {
    if (!timerActivate || startTime == 0) return;

    const interval = setInterval(() => {
      setStartTime((prevState) => (prevState -= 1));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime, timerActivate]);

  useEffect(() => {
    if (startTime != 0) return;
    setUserInputDisable(true);
    setStartTime(challengeTime);
    setTimerActivate(false);
    setShowResult(true);
    getResult();
  }, [startTime]);

  const startTimer = () => {
    setTimerActivate(true);
    setShowResult(false);
    setUserInputDisable(false);
    userInput.current.value = "";
  };

  const getResult = () => {
    let correctCount = 0;
    let essayWordList = essay.split(" ");
    let userInputList = userInput.current.value?.split(" ");
    for (let i = 0; i < userInputList.length; i++) {
      if (userInputList[i] == essayWordList[i]) {
        correctCount += 1;
      }
    }
    setAccuracy((correctCount / essayWordList.length) * 100);
    setWPM(correctCount * (60 / challengeTime));
    setWordTyped(userInput.current.value ? userInputList.length : 0);
    setCorrectWord(correctCount);
  };

  return (
    <Content>
      <StartButton onClick={startTimer}>Start Challenge</StartButton>
      <CountDown ref={countDownTimer}>{`${startTime} s`}</CountDown>
      <EssayContainer>{essay}</EssayContainer>
      <InputContainer>
        <textarea
          placeholder="Start typing here"
          ref={userInput}
          disabled={userInputDisable}
        ></textarea>
      </InputContainer>
      {showResult && (
        <>
          <Result
            style={
              accuracy >= 60
                ? { backgroundColor: "darkgreen" }
                : { backgroundColor: "crimson" }
            }
          >{`Typed: ${wordTyped} Correct: ${correctWord}  Accuracy: ${accuracy}% WPM: ${WPM}`}</Result>
        </>
      )}
    </Content>
  );
}
