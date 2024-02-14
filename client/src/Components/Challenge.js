import React, { useState } from "react";
import PairChallenge from "./PairChallenge";
import SoloChallenge from "./SoloChallenge";
import styled from "styled-components";

const ChallengeButton = styled.button`
  width: 10rem;
  height: 10rem;
  border-radius: 10px;
  font-size: 2rem;
  margin: auto 2rem;

  &:hover {
    cursor: pointer;
  }
`;

const ChallengeButtonContainer = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
`;

export default function Challenge() {
  const [challengeType, setChallengeType] = useState();

  const clickHandler = (e) => {
    setChallengeType(e.target.textContent);
  };

  return (
    <>
      {!challengeType && (
        <ChallengeButtonContainer>
          <ChallengeButton onClick={clickHandler}>Solo</ChallengeButton>
          <ChallengeButton onClick={clickHandler}>Pair</ChallengeButton>
        </ChallengeButtonContainer>
      )}
      {challengeType == "Solo" && <SoloChallenge />}
      {challengeType == "Pair" && <PairChallenge />}
    </>
  );
}
