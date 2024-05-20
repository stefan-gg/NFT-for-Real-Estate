pragma solidity 0.8.19;

import { ERC721URIStorage } from "@openzeppelin/contracts@4.7.0/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721 } from "@openzeppelin/contracts@4.7.0/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts@4.7.0/access/Ownable.sol";


contract Demo721Collection is ERC721URIStorage, Ownable {

    uint256 public constant MAX_TOKENS = 5;
    uint256 public constant MIN_TOKEN_PRICE = 1 gwei;

    uint256 public count;

    struct TokenData {
        uint256 tokenId;
        uint256 price;
        address owner;
        string uri;
    }

    /// @dev Token ID to price in Ethers
    mapping (uint256 => uint256) private _tokenPrice;

    error TokenPriceToLow();
    error NotEnoughFundsSend();
    error CidNotValid();
    error MaxTokensBrought();

    constructor() ERC721("Demo721", "DEMO") {}

    function mint(string memory cid, uint256 price) payable external {
        if (price < MIN_TOKEN_PRICE) revert TokenPriceToLow();
        if (bytes(cid).length < 20) revert CidNotValid();
        if (msg.value < 0.01 ether) revert NotEnoughFundsSend();
        if (balanceOf(msg.sender) >= MAX_TOKENS) revert MaxTokensBrought();

        uint256 tokenId = count++;

        _tokenPrice[tokenId] = price;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, cid);
    }

    // FIXME Add paging
    // isto moze da se napravi petlja na front 
    // i da ona poziva ovo i da se counter povecava samo
    function getAllTokensData() external view returns (TokenData[] memory) {
        TokenData[] memory tokenData = new TokenData[](count);

        for (uint256 i; i < count; ++i) {

            address owner = ownerOf(i);
            string memory uri = tokenURI(i);
            uint256 price = _tokenPrice[i];

            tokenData[i] = TokenData({
                tokenId: i,
                owner: owner,
                uri: uri,
                price: price
            });
        }

        return tokenData;
    }

    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        _requireMinted(tokenId);

        return TokenData({
                tokenId: tokenId,
                owner: ownerOf(tokenId),
                uri: tokenURI(tokenId),
                price: _tokenPrice[tokenId]
        });
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://web25dapp.myfilebase.com/ipfs/";
    }

    function transferEther(address recipient, uint256 amount) external onlyOwner {
        payable(recipient).transfer(amount);
    }
}