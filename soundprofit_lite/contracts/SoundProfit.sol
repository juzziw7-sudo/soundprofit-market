// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SoundProfitProtocol
 * @dev Handles atomic fee splitting for the SoundProfit Marketplace.
 * 2% Protocol Fee, 98% Artist Net.
 */
contract SoundProfitProtocol {
    address public owner;
    
    event LicenseSold(address indexed buyer, uint256 indexed songId, address indexed artist, uint256 price);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Buy a license. Money is split instantly.
     * @param songId The ID of the song in the database.
     * @param artist The wallet address of the artist.
     */
    function buyLicense(uint256 songId, address payable artist) external payable {
        require(msg.value > 0, "Price must be > 0");
        require(artist != address(0), "Invalid artist address");

        uint256 fee = (msg.value * 2) / 100; // 2% Protocol Fee
        uint256 artistShare = msg.value - fee; // 98% Artist Share

        // 1. Pay Artist Instantly
        (bool successArtist, ) = artist.call{value: artistShare}("");
        require(successArtist, "Transfer to artist failed");

        // 2. Keep Fee in Contract (Owner can withdraw) 
        // OR send to owner instantly? Let's keep in contract to save gas on simple transfers, 
        // but for "Lite" instant gratification, let's send to owner instantly if gas allows.
        // Actually, safer to keep in contract (Pull payment), but User wants "money to fall to me".
        // Let's send instantly to owner.
        (bool successOwner, ) = payable(owner).call{value: fee}("");
        require(successOwner, "Transfer to owner failed");

        emit LicenseSold(msg.sender, songId, artist, msg.value);
    }

    /**
     * @dev Just in case math rounding leaves dust or direct transfers.
     */
    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}
