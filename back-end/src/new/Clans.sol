//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title Clans
 * @notice Membership and leadership for clans. A clan is a named group of
 *         players who cannot make war on each other; the map shows them to one
 *         another as friendly rather than as targets.
 *
 * @dev Two design points worth knowing before changing anything here.
 *
 *      **Storage is namespaced (ERC-7201).** Town is a UUPS proxy with no
 *      storage gaps, and its layout runs Barracks' variables, then Town's. A
 *      base contract with ordinary state variables would slot in between the
 *      two and shift every Town variable after it, corrupting live state on
 *      upgrade. Everything here lives at one hashed slot instead, so Clans adds
 *      nothing to the sequential layout and can be inherited safely.
 *
 *      **Membership is keyed by address, not by land.** A player holding five
 *      lands is one member, and all five read as allied.
 *
 *      What it costs to found a clan is a question about land, gold and
 *      townhalls, none of which this contract can see, so Town keeps that: it
 *      charges the founder and then calls `_createClan`. What Clans needs from
 *      Town is who owns a land (`_clanLandOwner`) and whether an address holds
 *      any land at all (`_clanHasLand`).
 *
 *      **Only landholders can be members.** A clan exists to make lands allies,
 *      so an address with no land brings nothing to one and cannot be attacked
 *      by one either — it would sit on the roster taking up one of the twenty
 *      seats and showing nowhere on the map. The check sits in `_addMember`, the
 *      one choke point every way in passes through.
 */
abstract contract Clans {
    /// @notice Clans are capped so one clan cannot swallow the map.
    uint256 public constant MaxClanMembers = 20;

    uint256 private constant MaxClanNameLength = 24;

    /// @notice Applications a clan will hold at once. Bounded so that listing
    ///         them stays cheap and nobody can bury a leader in requests.
    uint256 public constant MaxClanRequests = 50;

    struct Clan {
        string name;
        address leader;
        address[] members;
    }

    /// @custom:storage-location erc7201:blockdom.storage.Clans
    struct ClansStorage {
        /// @dev Clan ids start at 1; 0 means "no clan" throughout.
        uint256 clanCount;
        mapping(uint256 => Clan) clanById;
        mapping(address => uint256) clanOf;
        /// @dev Position within `clanById[id].members`, offset by one so that 0
        ///      reads as "not a member" and removal stays O(1).
        mapping(uint256 => mapping(address => uint256)) memberSlot;
        mapping(uint256 => mapping(address => bool)) clanInvite;
        /// @dev Clan an address has applied to, 0 when it has no application
        ///      outstanding. One at a time, so an accepted applicant never
        ///      leaves stale entries behind in other clans' queues.
        mapping(address => uint256) requestedClan;
        /// @dev Pending applicants per clan, so a leader can list them.
        mapping(uint256 => address[]) requests;
        /// @dev Position within `requests[id]`, offset by one.
        mapping(uint256 => mapping(address => uint256)) requestSlot;
    }

    // keccak256(abi.encode(uint256(keccak256("blockdom.storage.Clans")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ClansStorageLocation =
        0xac3d6737f01acc0c44537257fab08ef4bd8e2da06e4b4936e1fbc4a4d403d900;

    function _clans() private pure returns (ClansStorage storage $) {
        assembly {
            $.slot := ClansStorageLocation
        }
    }

    event ClanCreated(uint256 indexed clanId, address indexed leader, string name);
    event ClanInvited(uint256 indexed clanId, address indexed account);
    event ClanJoined(uint256 indexed clanId, address indexed member);
    event ClanLeft(uint256 indexed clanId, address indexed member);
    event ClanRequested(uint256 indexed clanId, address indexed account);
    event ClanRequestWithdrawn(uint256 indexed clanId, address indexed account);
    event ClanRequestRejected(uint256 indexed clanId, address indexed account);
    event ClanLeadershipTransferred(
        uint256 indexed clanId,
        address indexed previousLeader,
        address indexed newLeader
    );

    error AlreadyInClan();
    error NotInClan();
    error NotClanLeader();
    error NotInvited();
    error ClanIsFull();
    error InvalidClanName();
    error InvalidClan();
    error LeaderCannotLeave();
    error CannotAttackAlly();
    error AlreadyRequested();
    error NoSuchRequest();
    error TooManyRequests();
    /// @notice Thrown when an address that holds no land tries to join a clan.
    error LandRequired();

    /// @dev Owner of a land, or the zero address when the land is not minted.
    ///      Implemented by Town, which holds the Lands instance.
    function _clanLandOwner(uint256 landId) internal view virtual returns (address);

    /// @dev True when `account` holds at least one land. Implemented by Town.
    function _clanHasLand(address account) internal view virtual returns (bool);

    /*  ****************************************************************
                                  Membership
        ****************************************************************  */

    /**
     * @dev Founds a clan with `leader` as its first member. The caller is
     *      responsible for charging whatever the game asks to get here.
     */
    function _createClan(string calldata name, address leader) internal returns (uint256 clanId) {
        ClansStorage storage $ = _clans();
        if ($.clanOf[leader] != 0) revert AlreadyInClan();

        bytes memory raw = bytes(name);
        if (raw.length == 0 || raw.length > MaxClanNameLength) revert InvalidClanName();

        clanId = ++$.clanCount;
        Clan storage clan = $.clanById[clanId];
        clan.name = name;
        clan.leader = leader;

        _addMember(clanId, leader);
        emit ClanCreated(clanId, leader, name);
    }

    /// @notice Invite an account to the caller's clan. Leader only.
    function inviteToClan(address account) external {
        ClansStorage storage $ = _clans();
        uint256 clanId = _leaderClan(msg.sender);
        if ($.clanOf[account] != 0) revert AlreadyInClan();
        if ($.clanById[clanId].members.length >= MaxClanMembers) revert ClanIsFull();
        // No land check here, though `joinClan` will refuse a landless invitee:
        // Town has ~0.3KB of headroom left and a dead invitation costs the clan
        // nothing, so the third copy of the check is not worth the bytes. The
        // roster screen warns the leader instead.

        $.clanInvite[clanId][account] = true;
        emit ClanInvited(clanId, account);
    }

    /// @notice Withdraw an invitation that has not been taken up. Leader only.
    function revokeClanInvite(address account) external {
        uint256 clanId = _leaderClan(msg.sender);
        _clans().clanInvite[clanId][account] = false;
    }

    /// @notice Accept an invitation.
    function joinClan(uint256 clanId) external {
        ClansStorage storage $ = _clans();
        if (clanId == 0 || clanId > $.clanCount) revert InvalidClan();
        if ($.clanOf[msg.sender] != 0) revert AlreadyInClan();
        if (!$.clanInvite[clanId][msg.sender]) revert NotInvited();
        if ($.clanById[clanId].members.length >= MaxClanMembers) revert ClanIsFull();

        $.clanInvite[clanId][msg.sender] = false;
        _addMember(clanId, msg.sender);
        emit ClanJoined(clanId, msg.sender);
    }

    /*  ****************************************************************
                              Joining by request
        ****************************************************************  */

    /**
     * @notice Ask to join a clan, for the leader to approve or reject.
     * @dev The other way in is an invitation from the leader; this is the same
     *      door opened from the other side. An address may have one application
     *      outstanding at a time, which is what keeps `requests` tidy: an
     *      accepted applicant cannot still be queued somewhere else.
     */
    function requestToJoinClan(uint256 clanId) external {
        ClansStorage storage $ = _clans();
        if (clanId == 0 || clanId > $.clanCount) revert InvalidClan();
        if ($.clanOf[msg.sender] != 0) revert AlreadyInClan();
        if ($.requestedClan[msg.sender] != 0) revert AlreadyRequested();
        // _addMember would refuse this applicant on approval anyway; refusing it
        // here keeps a queue that a leader cannot work through from forming.
        if (!_clanHasLand(msg.sender)) revert LandRequired();
        if ($.clanById[clanId].members.length >= MaxClanMembers) revert ClanIsFull();
        if ($.requests[clanId].length >= MaxClanRequests) revert TooManyRequests();

        $.requestedClan[msg.sender] = clanId;
        $.requests[clanId].push(msg.sender);
        $.requestSlot[clanId][msg.sender] = $.requests[clanId].length;
        emit ClanRequested(clanId, msg.sender);
    }

    /// @notice Withdraw your own application.
    function cancelClanRequest() external {
        uint256 clanId = _clans().requestedClan[msg.sender];
        if (clanId == 0) revert NoSuchRequest();

        _removeRequest(clanId, msg.sender);
        emit ClanRequestWithdrawn(clanId, msg.sender);
    }

    /// @notice Accept an application. Leader only.
    function approveClanRequest(address account) external {
        ClansStorage storage $ = _clans();
        uint256 clanId = _leaderClan(msg.sender);
        if ($.requestedClan[account] != clanId) revert NoSuchRequest();
        // They may have joined elsewhere while the application sat here.
        if ($.clanOf[account] != 0) revert AlreadyInClan();
        if ($.clanById[clanId].members.length >= MaxClanMembers) revert ClanIsFull();

        _removeRequest(clanId, account);
        _addMember(clanId, account);
        emit ClanJoined(clanId, account);
    }

    /// @notice Turn an application down. Leader only.
    function rejectClanRequest(address account) external {
        ClansStorage storage $ = _clans();
        uint256 clanId = _leaderClan(msg.sender);
        if ($.requestedClan[account] != clanId) revert NoSuchRequest();

        _removeRequest(clanId, account);
        emit ClanRequestRejected(clanId, account);
    }

    /**
     * @notice Leave the clan you belong to.
     * @dev The leader cannot walk out and leave the clan headless — they hand
     *      leadership over first. A one-member clan is the exception: there is
     *      nobody to hand over to, so the leader leaving disbands it.
     */
    function leaveClan() external {
        ClansStorage storage $ = _clans();
        uint256 clanId = $.clanOf[msg.sender];
        if (clanId == 0) revert NotInClan();

        Clan storage clan = $.clanById[clanId];
        if (clan.leader == msg.sender && clan.members.length > 1) {
            revert LeaderCannotLeave();
        }

        _removeMember(clanId, msg.sender);
        if (clan.members.length == 0) clan.leader = address(0);
        emit ClanLeft(clanId, msg.sender);
    }

    /// @notice Remove a member. Leader only, and not themselves.
    function kickFromClan(address account) external {
        ClansStorage storage $ = _clans();
        uint256 clanId = _leaderClan(msg.sender);
        if (account == msg.sender) revert LeaderCannotLeave();
        if ($.clanOf[account] != clanId) revert NotInClan();

        _removeMember(clanId, account);
        emit ClanLeft(clanId, account);
    }

    /// @notice Hand the clan to another of its members.
    function transferClanLeadership(address account) external {
        ClansStorage storage $ = _clans();
        uint256 clanId = _leaderClan(msg.sender);
        if ($.clanOf[account] != clanId) revert NotInClan();

        $.clanById[clanId].leader = account;
        emit ClanLeadershipTransferred(clanId, msg.sender, account);
    }

    /*  ****************************************************************
                                    Views
        ****************************************************************  */

    function clanCount() external view returns (uint256) {
        return _clans().clanCount;
    }

    /// @notice Clan an account belongs to, or 0.
    function clanOf(address account) public view returns (uint256) {
        return _clans().clanOf[account];
    }

    function isClanInvited(uint256 clanId, address account) external view returns (bool) {
        return _clans().clanInvite[clanId][account];
    }

    function getClan(uint256 clanId)
        external
        view
        returns (string memory name, address leader, address[] memory members)
    {
        Clan storage clan = _clans().clanById[clanId];
        return (clan.name, clan.leader, clan.members);
    }

    /// @notice Addresses waiting on a decision from this clan's leader.
    function getClanRequests(uint256 clanId) external view returns (address[] memory) {
        return _clans().requests[clanId];
    }

    /// @notice The clan an address has applied to, or 0.
    function requestedClanOf(address account) external view returns (uint256) {
        return _clans().requestedClan[account];
    }

    /// @notice Clan of whoever owns `landId`, or 0.
    function clanOfLand(uint256 landId) public view returns (uint256) {
        address owner = _clanLandOwner(landId);
        return owner == address(0) ? 0 : _clans().clanOf[owner];
    }

    /// @notice True when both lands belong to members of the same clan.
    function areAllies(uint256 landA, uint256 landB) public view returns (bool) {
        uint256 clanId = clanOfLand(landA);
        return clanId != 0 && clanId == clanOfLand(landB);
    }

    /**
     * @notice Clan ids for many accounts at once.
     * @dev The map needs a clan for every land owner on screen. Owners repeat
     *      across lands, so the client resolves the distinct addresses in one
     *      call rather than one call per land.
     */
    function clansOf(address[] calldata accounts) external view returns (uint256[] memory ids) {
        ClansStorage storage $ = _clans();
        ids = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            ids[i] = $.clanOf[accounts[i]];
        }
    }

    /*  ****************************************************************
                                   Internals
        ****************************************************************  */

    function _leaderClan(address account) private view returns (uint256 clanId) {
        ClansStorage storage $ = _clans();
        clanId = $.clanOf[account];
        if (clanId == 0) revert NotInClan();
        if ($.clanById[clanId].leader != account) revert NotClanLeader();
    }

    function _addMember(uint256 clanId, address account) private {
        ClansStorage storage $ = _clans();
        // However they got in — invite, application, or founding — any
        // application they had outstanding is now moot. Dropping it here keeps
        // every queue free of entries that could never be approved.
        // The one place every way in meets: founding, an accepted invitation and
        // an approved application all land here.
        if (!_clanHasLand(account)) revert LandRequired();

        uint256 pending = $.requestedClan[account];
        if (pending != 0) _removeRequest(pending, account);

        Clan storage clan = $.clanById[clanId];
        clan.members.push(account);
        $.memberSlot[clanId][account] = clan.members.length; // 1-based
        $.clanOf[account] = clanId;
    }

    /// @dev Swap-and-pop, matching _removeMember.
    function _removeRequest(uint256 clanId, address account) private {
        ClansStorage storage $ = _clans();
        address[] storage queue = $.requests[clanId];
        uint256 slot = $.requestSlot[clanId][account];
        if (slot == 0) revert NoSuchRequest();

        uint256 index = slot - 1;
        uint256 last = queue.length - 1;
        if (index != last) {
            address moved = queue[last];
            queue[index] = moved;
            $.requestSlot[clanId][moved] = index + 1;
        }
        queue.pop();

        delete $.requestSlot[clanId][account];
        delete $.requestedClan[account];
    }

    /// @dev Swap-and-pop, so removal does not walk the member list.
    function _removeMember(uint256 clanId, address account) private {
        ClansStorage storage $ = _clans();
        Clan storage clan = $.clanById[clanId];
        uint256 slot = $.memberSlot[clanId][account];
        if (slot == 0) revert NotInClan();

        uint256 index = slot - 1;
        uint256 last = clan.members.length - 1;
        if (index != last) {
            address moved = clan.members[last];
            clan.members[index] = moved;
            $.memberSlot[clanId][moved] = index + 1;
        }
        clan.members.pop();

        delete $.memberSlot[clanId][account];
        delete $.clanOf[account];
    }
}
