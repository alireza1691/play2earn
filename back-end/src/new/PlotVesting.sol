// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PlotVesting
 * @notice Holds the team's PLOT and releases it linearly after a cliff.
 *
 * PLOT mints its whole supply once and has no mint function, so the team's
 * share is not "emitted" — it exists on day one and simply must not be
 * spendable on day one. That is all this contract does.
 *
 * Deliberately minimal:
 *
 *   - **One beneficiary, one schedule.** Two schedules means a second
 *     deployment, which costs a few cents and removes a whole class of
 *     indexing bugs.
 *   - **No owner, and no revocation.** A revocable schedule is not really a
 *     schedule, and an owner key that can claw back 15% of supply is a key
 *     worth stealing. Once this is funded, nobody can redirect it.
 *   - **Not upgradeable.** The point of the contract is that its terms cannot
 *     change; a proxy in front of it would defeat that entirely, which is why
 *     this is the one contract in `src/new` deployed directly.
 *
 * Funded by transferring PLOT in after deployment. The schedule is computed
 * against everything the contract has *ever* held — `released + balance` — so a
 * top-up is vested on the original timeline rather than restarting it.
 */
contract PlotVesting {
    using SafeERC20 for IERC20;

    error NothingToRelease();
    error ZeroAddress();
    error ZeroDuration();

    event Released(uint256 amount);

    IERC20 public immutable token;
    address public immutable beneficiary;

    /// Unix seconds. Nothing releases before `start + cliff`.
    uint64 public immutable start;
    uint64 public immutable cliff;
    uint64 public immutable duration;

    uint256 public released;

    constructor(
        address token_,
        address beneficiary_,
        uint64 start_,
        uint64 cliffSeconds,
        uint64 durationSeconds
    ) {
        if (token_ == address(0) || beneficiary_ == address(0)) {
            revert ZeroAddress();
        }
        // A zero duration would make the schedule a cliff with everything
        // behind it, which is not what anyone means by vesting.
        if (durationSeconds == 0) revert ZeroDuration();

        token = IERC20(token_);
        beneficiary = beneficiary_;
        start = start_;
        cliff = start_ + cliffSeconds;
        duration = durationSeconds;
    }

    /// @notice Everything this contract has ever been given.
    /// @dev Balance plus what has already left, so a later top-up joins the
    ///      existing schedule instead of starting its own.
    function total() public view returns (uint256) {
        return token.balanceOf(address(this)) + released;
    }

    /// @notice How much has accrued by `timestamp`, released or not.
    function vestedAt(uint64 timestamp) public view returns (uint256) {
        if (timestamp < cliff) return 0;
        if (timestamp >= start + duration) return total();
        // Linear from `start`, not from `cliff`: the cliff withholds the first
        // year's worth rather than deleting it, so it lands in one piece the
        // moment the cliff passes. That is the usual meaning and the one the
        // team will have assumed.
        return (total() * (timestamp - start)) / duration;
    }

    /// @notice What `release()` would send right now.
    function releasable() public view returns (uint256) {
        uint256 vested = vestedAt(uint64(block.timestamp));
        // Cannot underflow in practice, but `total()` moves with the balance,
        // so a direct transfer *out* of this contract by some other means would
        // make it. Clamping is cheaper than trusting that never happens.
        return vested > released ? vested - released : 0;
    }

    /**
     * @notice Send everything accrued to the beneficiary.
     * @dev Permissionless on purpose — it can only ever pay the beneficiary, so
     *      letting anyone trigger it means the team is never locked out by a
     *      lost key on the calling side.
     */
    function release() external {
        uint256 amount = releasable();
        if (amount == 0) revert NothingToRelease();

        released += amount;
        emit Released(amount);
        token.safeTransfer(beneficiary, amount);
    }
}
