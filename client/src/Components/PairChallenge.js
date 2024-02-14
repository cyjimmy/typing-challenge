import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";

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
  height: fit-content;
  max-height: 15vh;
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
  padding-bottom: 2rem;
`;

const Button = styled.button`
  width: 7rem;
  margin: 1rem auto 0 auto;

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
  font-size: 1rem;
  color: white;
  border: 2px solid white;
  width: fit-content;
  margin: 1rem auto 0 auto;
  padding: 1rem;
  border-radius: 10px;
`;

const RoomInput = styled.div``;

const RoomInputField = styled.input`
  width: 7rem;
  text-align: center;
  margin: 0 auto;
`;

const RoomButton = styled.button`
  width: 3rem;

  &:hover {
    cursor: pointer;
  }
`;

const essay = `React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.`;

export default function SoloChallenge() {
  const challengeTime = 15;

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
  const roomInputField = useRef();
  const [socket, setSocket] = useState();
  const [hostInput, setHostInput] = useState();
  const [room, setRoom] = useState();
  const [challengerResult, setChallengerResult] = useState({});
  const [clientInput, setClientInput] = useState();

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
    setHostInput("");
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
    setAccuracy(
      (correctCount / (userInput.current.value ? userInputList.length : 0)) *
        100
    );
    setWPM(correctCount * (60 / challengeTime));
    setWordTyped(userInput.current.value ? userInputList.length : 0);
    setCorrectWord(correctCount);
    socket.emit("send-result", {
      typed: userInput.current.value ? userInputList.length : 0,
      wpm: correctCount * (60 / challengeTime),
      accuracy:
        (correctCount / (userInput.current.value ? userInputList.length : 0)) *
        100,
      correct: correctCount,
    });
  };

  useEffect(() => {
    const s = io();
    setSocket(s);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler1 = (changes) => {
      setClientInput(changes);
    };
    const handler2 = (changes) => {
      if (changes) {
        startTimer();
      }
    };
    const handler3 = (changes) => {
      setChallengerResult(changes);
    };
    socket.on("receive-changes", handler1);
    socket.on("receive-timer-change", handler2);
    socket.on("receive-result", handler3);
    return () => {
      socket.off("receive-changes", handler1);
      socket.off("receive-timer-change", handler2);
      socket.off("receive-result", handler3);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("send-changes", hostInput);
  }, [hostInput]);

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("get-room", room);
  }, [room]);

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("send-timer-change", timerActivate);
  }, [timerActivate]);

  const hostInputHandler = () => {
    setHostInput(userInput.current.value);
  };

  const enterRoomHandler = () => {
    setRoom(roomInputField.current.value);
  };

  return (
    <Content>
      <RoomInput>
        <RoomInputField
          ref={roomInputField}
          placeholder="Room number"
        ></RoomInputField>
        <RoomButton onClick={enterRoomHandler}>Enter</RoomButton>
      </RoomInput>
      <Button onClick={startTimer}>Start Challenge</Button>
      <CountDown ref={countDownTimer}>{`${startTime} s`}</CountDown>
      <EssayContainer>{essay}</EssayContainer>
      <InputContainer>
        <textarea
          placeholder="Start typing here"
          ref={userInput}
          disabled={userInputDisable}
          onChange={hostInputHandler}
          value={hostInput}
        ></textarea>
        <textarea
          placeholder="Challenger text field"
          disabled={true}
          value={clientInput}
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
          >{`Your result: Typed: ${wordTyped} Correct: ${correctWord}  Accuracy: ${accuracy}% WPM: ${WPM}`}</Result>
          <Result
            style={
              challengerResult.accuracy >= 60
                ? { backgroundColor: "darkgreen" }
                : { backgroundColor: "crimson" }
            }
          >{`Challenger result: Typed: ${challengerResult.typed} Correct: ${challengerResult.correct}  Accuracy: ${challengerResult.accuracy}% WPM: ${challengerResult.wpm}`}</Result>
        </>
      )}
    </Content>
  );
}
