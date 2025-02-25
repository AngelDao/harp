// SPDX-License-Identifier: MIT

pragma solidity 0.6.11 ;

import "./ILiquityBase.sol";
import "./IStabilityPool.sol";
import "./ILUSDToken.sol";
import "./ILQTYToken.sol";
import "./ILQTYStaking.sol";

// Common interface for the Trove Manager.
abstract contract ITroveManager is ILiquityBase {
    enum Status {
        nonExistent,
        active,
        closedByOwner,
        closedByLiquidation,
        closedByRedemption
    }

    struct Trove {
        uint256 debt;
        uint256 coll;
        uint256 stake;
        Status status;
        uint128 arrayIndex;
    }

    mapping(address => Trove) public Troves;

    address[] public TroveOwners;
    // --- Events ---

    event BorrowerOperationsAddressChanged(
        address _newBorrowerOperationsAddress
    );
    event PriceFeedAddressChanged(address _newPriceFeedAddress);
    event LUSDTokenAddressChanged(address _newLUSDTokenAddress);
    event ActivePoolAddressChanged(address _activePoolAddress);
    event DefaultPoolAddressChanged(address _defaultPoolAddress);
    event StabilityPoolAddressChanged(address _stabilityPoolAddress);
    event GasPoolAddressChanged(address _gasPoolAddress);
    event CollSurplusPoolAddressChanged(address _collSurplusPoolAddress);
    event SortedTrovesAddressChanged(address _sortedTrovesAddress);
    event LQTYTokenAddressChanged(address _lqtyTokenAddress);
    event LQTYStakingAddressChanged(address _lqtyStakingAddress);

    event Liquidation(
        uint256 _liquidatedDebt,
        uint256 _liquidatedColl,
        uint256 _collGasCompensation,
        uint256 _LUSDGasCompensation
    );
    event Redemption(
        uint256 _attemptedLUSDAmount,
        uint256 _actualLUSDAmount,
        uint256 _ETHSent,
        uint256 _ETHFee
    );
    event TroveUpdated(
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        uint256 stake,
        uint8 operation
    );
    event TroveLiquidated(
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        uint8 operation
    );
    event BaseRateUpdated(uint256 _baseRate);
    event LastFeeOpTimeUpdated(uint256 _lastFeeOpTime);
    event TotalStakesUpdated(uint256 _newTotalStakes);
    event SystemSnapshotsUpdated(
        uint256 _totalStakesSnapshot,
        uint256 _totalCollateralSnapshot
    );
    event LTermsUpdated(uint256 _L_ETH, uint256 _L_LUSDDebt);
    event TroveSnapshotsUpdated(uint256 _L_ETH, uint256 _L_LUSDDebt);
    event TroveIndexUpdated(address _borrower, uint256 _newIndex);

    // --- Functions ---

    function setAddresses(
        address _borrowerOperationsAddress,
        address _activePoolAddress,
        address _defaultPoolAddress,
        address _stabilityPoolAddress,
        address _gasPoolAddress,
        address _collSurplusPoolAddress,
        address _priceFeedAddress,
        address _lusdTokenAddress,
        address _sortedTrovesAddress,
        address _lqtyTokenAddress,
        address _lqtyStakingAddress
    ) external virtual;

    function stabilityPool() external view virtual returns (IStabilityPool);

    function lusdToken() external view virtual returns (ILUSDToken);

    function lqtyToken() external view virtual returns (ILQTYToken);

    function lqtyStaking() external view virtual returns (ILQTYStaking);

    function getTroveOwnersCount() external view virtual returns (uint256);

    function getTroveFromTroveOwnersArray(uint256 _index)
        external
        view
        virtual
        returns (address);

    function getNominalICR(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function getCurrentICR(address _borrower, uint256 _price)
        external
        view
        virtual
        returns (uint256);

    function liquidate(address _borrower) external virtual;

    function liquidateTroves(uint256 _n) external virtual;

    function batchLiquidateTroves(address[] calldata _troveArray)
        external
        virtual;

    function redeemCollateral(
        uint256 _LUSDAmount,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint256 _partialRedemptionHintNICR,
        uint256 _maxIterations,
        uint256 _maxFee
    ) external virtual;

    function updateStakeAndTotalStakes(address _borrower)
        external
        virtual
        returns (uint256);

    function updateTroveRewardSnapshots(address _borrower) external virtual;

    function addTroveOwnerToArray(address _borrower)
        external
        virtual
        returns (uint256 index);

    function applyPendingRewards(address _borrower) external virtual;

    function getPendingETHReward(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function getPendingLUSDDebtReward(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function hasPendingRewards(address _borrower)
        external
        view
        virtual
        returns (bool);

    function getEntireDebtAndColl(address _borrower)
        external
        view
        virtual
        returns (
            uint256 debt,
            uint256 coll,
            uint256 pendingLUSDDebtReward,
            uint256 pendingETHReward
        );

    function closeTrove(address _borrower) external virtual;

    function removeStake(address _borrower) external virtual;

    function getRedemptionRate() external view virtual returns (uint256);

    function getRedemptionRateWithDecay()
        external
        view
        virtual
        returns (uint256);

    function getRedemptionFeeWithDecay(uint256 _ETHDrawn)
        external
        view
        virtual
        returns (uint256);

    function getBorrowingRate() external view virtual returns (uint256);

    function getBorrowingRateWithDecay()
        external
        view
        virtual
        returns (uint256);

    function getBorrowingFee(uint256 LUSDDebt)
        external
        view
        virtual
        returns (uint256);

    function getBorrowingFeeWithDecay(uint256 _LUSDDebt)
        external
        view
        virtual
        returns (uint256);

    function decayBaseRateFromBorrowing() external virtual;

    function getTroveStatus(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function getTroveStake(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function getTroveDebt(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function getTroveColl(address _borrower)
        external
        view
        virtual
        returns (uint256);

    function setTroveStatus(address _borrower, uint256 num) external virtual;

    function increaseTroveColl(address _borrower, uint256 _collIncrease)
        external
        virtual
        returns (uint256);

    function decreaseTroveColl(address _borrower, uint256 _collDecrease)
        external
        virtual
        returns (uint256);

    function increaseTroveDebt(address _borrower, uint256 _debtIncrease)
        external
        virtual
        returns (uint256);

    function decreaseTroveDebt(address _borrower, uint256 _collDecrease)
        external
        virtual
        returns (uint256);

    function getTCR(uint256 _price) external view virtual returns (uint256);

    function checkRecoveryMode(uint256 _price)
        external
        view
        virtual
        returns (bool);
}
