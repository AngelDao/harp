/* eslint-disable jest/valid-describe */
/* eslint-disable no-undef */
const { assert, expect } = require("chai");
const deploymentHelperLiquity = require("../utils/deploymentHelperLiquity");
const deploymentHelperHarp = require("../utils/deploymentHelperHarp");
const { ethers } = require("hardhat");
require("chai").use(require("chai-as-promised")).should();
const StabilityPool = artifacts.require("./StabilityPool.sol");

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("STRING Token Tests", () => {
  let contracts, accounts, harpContracts, stringToken, tokenVesting;

  const HarpDAO = "0xdF7054884fCb9A8681490A1D977fbD295C02cCFF";

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    contracts = await deploymentHelperLiquity.deployLiquityCore();
    const LQTYContracts = await deploymentHelperLiquity.deployLQTYTesterContractsHardhat(
      accounts[1].address,
      accounts[2].address,
      accounts[3].address
    );
    contracts.stabilityPool = await StabilityPool.new();
    contracts = await deploymentHelperLiquity.deployLUSDToken(contracts);

    stabilityPool = contracts.stabilityPool;
    borrowerOperations = contracts.borrowerOperations;

    lqtyToken = LQTYContracts.lqtyToken;
    communityIssuanceTester = LQTYContracts.communityIssuance;

    contracts = { ...contracts, lqtyToken };

    await deploymentHelperLiquity.connectLQTYContracts(LQTYContracts);
    await deploymentHelperLiquity.connectCoreContracts(
      contracts,
      LQTYContracts
    );
    await deploymentHelperLiquity.connectLQTYContractsToCore(
      LQTYContracts,
      contracts
    );
    harpContracts = await deploymentHelperHarp(accounts, contracts);
    stringToken = harpContracts.stringToken;
    tokenVesting = harpContracts.tokenVesting;
    await stringToken.addMinter(accounts[0].address);
    await stringToken.addMinter(tokenVesting.address);
    await stringToken.mintTo(accounts[0].address, tokens("2000000"));
    await stringToken.revokeOwnership();
  });

  describe("Token Attributes Check On Deployment", async () => {
    it("Sets correct Token Supply upon deployment", async () => {
      let totalSupply = (await stringToken.totalSupply()).toString();
      assert.equal(totalSupply, tokens("4000000"));
    });
    it("Sets correct Name upon deployment", async () => {
      let name = await stringToken.name();
      assert.equal(name, "STRING Token");
    });
    it("Sets correct Symbol upon deployment", async () => {
      let symbol = await stringToken.symbol();
      assert.equal(symbol, "STRING");
    });
    it("Sets correct Decimal upon deployment", async () => {
      let decimals = await stringToken.decimals();
      assert.equal(decimals, 18);
    });
    it("Sets correct Balance for harpDAO upon deployment", async () => {
      const balance = (await stringToken.balanceOf(HarpDAO)).toString();
      assert.equal(balance, tokens("2000000"), "HarpDAOBalance");
    });
    it("sets vesting contract to mint", async () => {
      const canMint = await stringToken.isAllowedMinter(tokenVesting.address);
      assert.equal(canMint, true);
    });
    it("Owner does not exists", async () => {
      let owner = await stringToken.owner();
      console.log(owner);
      console.log(owner);
      console.log(owner);
      console.log(owner);
      console.log(owner);
      assert.equal(owner, "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Token Contract actions", async () => {
    it("not allows non vesting contract to mint tokens", async () => {
      try {
        await stringToken.connect(accounts[1]).mintTo(accounts[1].address, 10);
      } catch (err) {
        assert(
          err.message.indexOf("revert") >= 0,
          "Sender not a verified Minter"
        );
      }
    });
    it("transfer tokens success", async () => {
      await stringToken.transfer(accounts[1].address, tokens("10"));

      const recieverBalance = (
        await stringToken.balanceOf(accounts[1].address)
      ).toString();
      const senderBalance = (
        await stringToken.balanceOf(accounts[0].address)
      ).toString();

      assert.equal(recieverBalance, tokens("10"));
      assert.equal(senderBalance, tokens("1999990"));
    });

    it("transfer tokens fail send more than have", async () => {
      try {
        await stringToken.transfer(accounts[1].address, tokens("20000000000"));
      } catch (err) {
        assert(
          err.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
      }
    });
    it("Transfer Event triggerd", async () => {
      const tx = await stringToken.transfer(accounts[1].address, tokens("10"));

      const receipt = await tx.wait();

      assert.equal(receipt.events.length, 1, "test that one event emitted");
      assert.equal(
        receipt.events[0].event,
        "Transfer",
        "test that Transfer event was specifically emitted"
      );
      assert.equal(
        receipt.events[0].args.from,
        accounts[0].address,
        "test that the correct from was used"
      );
      assert.equal(
        receipt.events[0].args.to,
        accounts[1].address,
        "test that the correct to address was used"
      );
      assert.equal(
        receipt.events[0].args.value,
        tokens("10"),
        "test value of tx"
      );
    });

    it("approves tokens for delegated token transfer", async () => {
      await stringToken
        .connect(accounts[1])
        .approve(accounts[0].address, tokens("1000"));
      const allowance = (
        await stringToken.allowance(accounts[1].address, accounts[0].address)
      ).toString();
      assert.equal(allowance, tokens("1000"));
    });

    it("Approval event triggered", async () => {
      const tx = await stringToken.approve(accounts[1].address, tokens("1000"));

      const receipt = await tx.wait();

      assert.equal(receipt.events.length, 1, "test that one event emitted");
      assert.equal(
        receipt.events[0].event,
        "Approval",
        "test that Approval event was specifically emitted"
      );
      assert.equal(
        receipt.events[0].args.owner,
        accounts[0].address,
        "test that the correct owner address was used"
      );
      assert.equal(
        receipt.events[0].args.spender,
        accounts[1].address,
        "test that the correct spender address was used"
      );
      assert.equal(
        receipt.events[0].args.value,
        tokens("1000"),
        "test the value of value allowed"
      );
    });

    it("handle transfer from ", async () => {
      const spender = accounts[1].address;
      const from = accounts[0].address;
      const to = accounts[2].address;

      await stringToken.approve(spender, tokens("100"));
      const tx = await stringToken
        .connect(accounts[1])
        .transferFrom(from, to, tokens("10"));

      const receipt = await tx.wait();

      const fromBalance = (await stringToken.balanceOf(from)).toString();
      const toBalance = (await stringToken.balanceOf(to)).toString();

      const newAllowance = (
        await stringToken.allowance(from, spender)
      ).toString();

      assert.equal(newAllowance, tokens("90"));
      assert.equal(fromBalance, tokens("1999990"));
      assert.equal(toBalance, tokens("10"));
      assert.equal(receipt.events.length, 2, "test that one event emitted");
      assert.equal(
        receipt.events[0].event,
        "Transfer",
        "test that Transfer event was specifically emitted"
      );
      assert.equal(
        receipt.events[0].args.from,
        from,
        "test that the correct from was used"
      );
      assert.equal(
        receipt.events[0].args.to,
        to,
        "test that the correct to address was used"
      );
      assert.equal(
        receipt.events[0].args.value,
        tokens("10"),
        "test value of tx"
      );
    });
  });
});
