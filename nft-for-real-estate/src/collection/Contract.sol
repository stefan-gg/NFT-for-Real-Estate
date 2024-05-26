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

    // struct OfferData {
    //     uint256 offeredPrice;
    //     address offerrer;
    // }

    struct Offer {
        address buyerAddress;
        uint256 amount;
        bool isOfferStillValid;
    }

    // struct OfferDict {
    //     mapping(address => mapping(uint256 => uint256)) offerDict;
    //     uint256 counter;
    // }

    mapping (uint256 => uint256) private _tokenPrice;
    mapping (uint256 => bool) private _nftsAvailableForSale;
    mapping (address => uint256) private _balanceOf;
    mapping (uint256 => address) private _ownerOf;
    mapping (uint256 => string) private _tokenURI;

    mapping(uint256 => Offer[]) private _offers;
    
    mapping (address => mapping(uint256 => uint256)) private _lockedFunds;
    
    error NotEnoughFundsSend();
    error CidNotValid();
    error MaxTokensBrought();
    error TokenPriceTooLow();
    error OwnerNotValid();
    error SenderNotValid();

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

    function addOffer(uint256 tokenId) external payable {
        if (_ownerOf[tokenId] == msg.sender) revert SenderNotValid();

        Offer memory offer;
        offer.amount = msg.value;
        offer.buyerAddress = msg.sender;
        offer.isOfferStillValid = true;

        _offers[tokenId].push(offer);
        
        _lockedFunds[msg.sender][tokenId] = msg.value;
    }

    function acceptOffer(uint256 tokenId, address buyer) external {
        if (msg.sender != _ownerOf[tokenId]) revert SenderNotValid();

        Offer[] memory offers = _offers[tokenId];
        
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].buyerAddress == buyer) {
         
                payable(_ownerOf[tokenId]).transfer(offers[i].amount);
                _ownerOf[tokenId] = buyer;
                _nftsAvailableForSale[tokenId] = false;
         
            } else if (offers[i].isOfferStillValid == true) {
                payable(offers[i].buyerAddress).transfer(offers[i].amount);
            }
        }

        delete _offers[tokenId];
    }

    function removeOffer(uint tokenId) external {

        Offer[] memory offers = _offers[tokenId];
        
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].buyerAddress == msg.sender) {

                payable(offers[i].buyerAddress).transfer(offers[i].amount);
                _offers[tokenId][i].isOfferStillValid = false;

            }
        }
    }

    function removeOfferAsTokenOwner(uint tokenId, address buyer) external {
        if (msg.sender != _ownerOf[tokenId]) revert OwnerNotValid();

        Offer[] memory offers = _offers[tokenId];
        
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].buyerAddress == buyer) {

                payable(offers[i].buyerAddress).transfer(offers[i].amount);
                _offers[tokenId][i].isOfferStillValid = false;

            }
        }

        delete _offers[tokenId];
    }

    function removeAllOffers(uint tokenId) external {
        if (msg.sender != _ownerOf[tokenId]) revert OwnerNotValid();

        Offer[] memory offers = _offers[tokenId];
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isOfferStillValid == true) payable(offers[i].buyerAddress).transfer(offers[i].amount);
        }

        delete _offers[tokenId];
    }

    function listAllOffersForNFT(uint tokenId) external view returns (Offer[] memory) {
        Offer[] memory offers = _offers[tokenId];
        
        return offers;
    }

    function withdrawNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = false;

        Offer[] memory offers = _offers[tokenId];
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isOfferStillValid == true) payable(offers[i].buyerAddress).transfer(offers[i].amount);
        }

        delete _offers[tokenId];
        
    }

    function relistNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = true;
        
    }

    function changeTokenPrice(uint256 tokenId, uint256 price) public {
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

}