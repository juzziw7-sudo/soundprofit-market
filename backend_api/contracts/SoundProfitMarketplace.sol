// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SoundProfitMarketplace
 * @dev Decentralized Music Marketplace Contract
 * Automatically splits payments: 98% to Artist, 2% to Platform.
 */
contract SoundProfitMarketplace {
    address payable public owner;
    uint256 public constant PLATFORM_FEE_PERCENT = 2;

    event LicenseSold(
        address indexed buyer,
        uint256 indexed songId,
        address indexed artist,
        uint256 price,
        uint256 timestamp
    );

    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    constructor() {
        // Hardcoded admin wallet as requested
        owner = payable(0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402);
    }

    /**
     * @notice Buy a license for a specific song
     * @param songId The unique ID of the song (from database)
     * @param artist The wallet address of the artist
     */
    function buyLicense(uint256 songId, address payable artist) external payable {
        require(msg.value > 0, "Price must be greater than 0");
        require(artist != address(0), "Invalid artist address");

        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 artistShare = msg.value - platformFee;

        // Transfer shares
        (bool successArtist, ) = artist.call{value: artistShare}("");
        require(successArtist, "Transfer to artist failed");

        (bool successOwner, ) = owner.call{value: platformFee}("");
        require(successOwner, "Transfer to platform failed");

        emit LicenseSold(msg.sender, songId, artist, msg.value, block.timestamp);
    }

    /**
     * @notice Update the platform owner address
     * @param newOwner The new address to receive platform fees
     */
    function setOwner(address payable newOwner) external {
        require(msg.sender == owner, "Only owner can change owner");
        require(newOwner != address(0), "Invalid address");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Fallback to receive ETH (donations/mistakes)
     */
    receive() external payable {}
}
