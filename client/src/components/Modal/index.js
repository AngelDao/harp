import React, { useState, useContext } from "react";
import CredentialsContext from "../../context/credentialsContext";
import ActionsModal from "./ActionModal";
import ClaimModal from "./ClaimModal";

const Modal = ({
  open,
  close,
  type,
  balance,
  allowance,
  pair,
  contract,
  gSTRINGAllowance,
}) => {
  if (type === "Deposit" || type === "Withdraw") {
    return (
      <ActionsModal
        open={open}
        close={close}
        type={type}
        balance={balance}
        allowance={allowance}
        gSTRINGAllowance={gSTRINGAllowance}
        pair={pair}
        contract={contract}
      />
    );
  } else if (type === "Claim") {
    return (
      <ClaimModal
        open={open}
        close={close}
        balance={balance}
        pair={pair}
        contract={contract}
      />
    );
  } else if (type === "DepositStringStaking") {
  }
  return null;
};

export default Modal;
