pragma solidity 0.8.19;

contract RealEstateCollection {
    
    uint256 public constant MIN_TOKEN_PRICE = 1 gwei;

    uint256 public count;

    struct TokenData {
        uint256 tokenId;
        uint256 price;
        address owner;
        string uri;
        bool forSale;
    }

    mapping (uint256 => uint256) private _tokenPrice;
    mapping (uint256 => bool) private _nftsAvailableForSale;
    mapping (address => uint256) private _balanceOf;
    mapping (uint256 => address) private _ownerOf;
    mapping (uint256 => string) private _tokenURI;
    

    error NotEnoughFundsSend();
    error CidNotValid();
    error MaxTokensBrought();
    error TokenPriceTooLow();
    error OwnerNotValid();

    constructor() {}

    function _setTokenURI(string memory cid) internal pure returns (string memory) {
        bytes memory bytesStr1 = bytes("https://ipfs.filebase.io/ipfs/");
        bytes memory bytesStr2 = bytes(cid);
        bytes memory result = new bytes(bytesStr1.length + bytesStr2.length);

        for (uint i = 0; i < bytesStr1.length; i++) {
            result[i] = bytesStr1[i];
        }

        for (uint j = 0; j < bytesStr2.length; j++) {
            result[bytesStr1.length + j] = bytesStr2[j];
        }

        return string(result);
    }

    function mint(string memory cid, uint256 price) payable external {
        if(price < MIN_TOKEN_PRICE) revert TokenPriceTooLow();
        if(bytes(cid).length < 20) revert CidNotValid();
        if(msg.value < 0.01 ether) revert NotEnoughFundsSend();

        uint256 tokenId = count++;

        _tokenPrice[tokenId] = price;
        _ownerOf[tokenId] = msg.sender;
        _tokenURI[tokenId] = _setTokenURI(cid);
        _nftsAvailableForSale[tokenId] = true;
    }

    function withdrawNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = false;
        
    }

    function relistNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = true;
        
    }

    function changeTokenPrice(uint256 tokenId, uint256 price) public{
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _tokenPrice[tokenId] = price;
    }

    function buyNFT(uint256 tokenId) public payable {
        if (msg.value < _tokenPrice[tokenId]) revert NotEnoughFundsSend();
         
        _nftsAvailableForSale[tokenId] = false;
        payable(_ownerOf[tokenId]).transfer(_tokenPrice[tokenId]);
        _ownerOf[tokenId] = msg.sender;
    }
    
    function getAllTokensData() external view returns (TokenData[] memory){
        TokenData[] memory tokenData = new TokenData[](count);
        
        for (uint256 i; i < count; ++i){

            address owner = _ownerOf[i];
            string memory uri = _tokenURI[i];
            uint256 price = _tokenPrice[i];

            tokenData[i] = TokenData({
                tokenId: i, 
                price: price,    
                owner: owner, 
                uri: uri,
                forSale: _nftsAvailableForSale[i]
            });
        }

        return tokenData;
    }

    function getTokenData(uint256 tokenId) external view returns (TokenData memory){
        address owner = _ownerOf[tokenId];
        string memory uri = _tokenURI[tokenId];
        uint256 price = _tokenPrice[tokenId];
        bool forSale = _nftsAvailableForSale[tokenId];

        return TokenData({ tokenId: tokenId, price: price, owner: owner, uri: uri, forSale: forSale });
    }

    function transferEther(address recipient, uint amount) external payable {
        payable(recipient).transfer(amount);
    }
}