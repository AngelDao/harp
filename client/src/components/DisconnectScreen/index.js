import React, { useState, useEffect, useContext } from "react";
import { ComponentContainer, StyledButton } from "./styles";
import CredentialsContext from "../../context/credentialsContext";

const DisconnectScreen = () => {
  const { handleManualConnect } = useContext(CredentialsContext);

  const handleClick = async () => {
    console.log("log");
    try {
      await handleManualConnect();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <ComponentContainer>
        <StyledButton onClick={handleClick}>
          <i>Connect Wallet</i>
        </StyledButton>
      </ComponentContainer>
    </>
  );
};

export default DisconnectScreen;
