pragma solidity 0.8.19;

contract RealEstateCollection {
    uint256 public constant MIN_TOKEN_PRICE = 1 gwei;

    uint256 public count;

    //struct for storing single token dana (on mint)
    struct TokenData {
        uint256 tokenId;
        uint256 price;
        address owner;
        string uri;
        bool forSale;
    }

    //struct for storing offer informations
    struct Offer {
        address buyerAddress;
        uint256 amount;
        bool isOfferStillValid;
    }

    //structure so user on front end can be informed about his offers
    struct OfferNotifications {
        uint256 tokenId;
        bool isOfferAccepted;
    }

    //price of every NFT
    mapping(uint256 => uint256) private _tokenPrice;
    //available NFTs for sale on the market
    mapping(uint256 => bool) private _nftsAvailableForSale;
    //token owner
    mapping(uint256 => address) private _ownerOf;
    //token uri
    mapping(uint256 => string) private _tokenURI;

    //list of offers
    mapping(uint256 => Offer[]) private _offers;
    //list of locked funds for each offer
    mapping(address => mapping(uint256 => uint256)) private _lockedFunds;
    //list of user notifications
    mapping(address => OfferNotifications[]) private _offerNotifications;

    //custom errors
    error NotEnoughFundsSend();
    error CidNotValid();
    error MaxTokensBrought();
    error TokenPriceTooLow();
    error OwnerNotValid();
    error SenderNotValid();
    error NFTIsNotForSale();
    error InvalidOffer();

    constructor() {}

    //setting tokenUri so we can read its information on the frontend
    function _setTokenURI(string memory cid)
        internal
        pure
        returns (string memory)
    {
        bytes memory bytesStr1 = bytes("https://ipfs.filebase.io/ipfs/");
        bytes memory bytesStr2 = bytes(cid);
        bytes memory result = new bytes(bytesStr1.length + bytesStr2.length);

        for (uint256 i = 0; i < bytesStr1.length; i++) {
            result[i] = bytesStr1[i];
        }

        for (uint256 j = 0; j < bytesStr2.length; j++) {
            result[bytesStr1.length + j] = bytesStr2[j];
        }

        return string(result);
    }

    //getting and deleting notifications related to the user offers
    function getNotificationsForUser()
        external
        view
        returns (OfferNotifications[] memory)
    {

        return _offerNotifications[msg.sender];
    }

    function deleteNotificationsForUser() external  {
        delete _offerNotifications[msg.sender];
    }
    
    //NFT minting 
    function mint(string memory cid, uint256 price) external payable {
        if (price < MIN_TOKEN_PRICE) revert TokenPriceTooLow();
        if (bytes(cid).length < 20) revert CidNotValid();
        if (msg.value < 0.01 ether) revert NotEnoughFundsSend();

        uint256 tokenId = count++;

        _tokenPrice[tokenId] = price;
        _ownerOf[tokenId] = msg.sender;
        _tokenURI[tokenId] = _setTokenURI(cid);
        _nftsAvailableForSale[tokenId] = true;
    }

    //add offer if user is not owner of the NFT, if NFT is for sale and if user has no offers
    function addOffer(uint256 tokenId) external payable {
        if (_ownerOf[tokenId] == msg.sender){
            payable(msg.sender).transfer(msg.value);
            revert SenderNotValid();
        } 

        if (_lockedFunds[msg.sender][tokenId] > 0){
            payable(msg.sender).transfer(msg.value);
            revert InvalidOffer();
        } 

        Offer memory offer;
        offer.amount = msg.value;
        offer.buyerAddress = msg.sender;
        offer.isOfferStillValid = true;

        _offers[tokenId].push(offer);
        
        _lockedFunds[msg.sender][tokenId] = msg.value;
    }

    //accept one offer, reject the rest
    function acceptOffer(uint256 tokenId, address buyer) external {
        if (msg.sender != _ownerOf[tokenId]) revert SenderNotValid();

        Offer[] memory offers = _offers[tokenId];

        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].buyerAddress == buyer) {
                payable(_ownerOf[tokenId]).transfer(offers[i].amount);

                _offerNotifications[buyer].push(
                    OfferNotifications({
                        tokenId: tokenId,
                        isOfferAccepted: true
                    })
                );

                _ownerOf[tokenId] = buyer;
                _nftsAvailableForSale[tokenId] = false;
                
                delete _lockedFunds[msg.sender][tokenId];

            } else if (offers[i].isOfferStillValid == true) {
                _offerNotifications[offers[i].buyerAddress].push(
                    OfferNotifications({
                        tokenId: tokenId,
                        isOfferAccepted: false
                    })
                );

                delete _lockedFunds[msg.sender][tokenId];

                payable(offers[i].buyerAddress).transfer(offers[i].amount);
            }
        }

        delete _offers[tokenId];
    }

    //remove specific offer if you are owner of the token
    function removeOfferAsTokenOwner(uint256 tokenId, address buyer) external {
        if (msg.sender != _ownerOf[tokenId]) revert OwnerNotValid();

        Offer[] memory offers = _offers[tokenId];

        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].buyerAddress == buyer) {
                payable(offers[i].buyerAddress).transfer(offers[i].amount);

                _offers[tokenId][i].isOfferStillValid = false;

                _offerNotifications[offers[i].buyerAddress].push(
                    OfferNotifications({
                        tokenId: tokenId,
                        isOfferAccepted: false
                    })
                );
            }
        }
    }

    //remove all offers related to the NFT
    function removeAllOffers(uint256 tokenId) external {
        if (msg.sender != _ownerOf[tokenId]) revert OwnerNotValid();

        Offer[] memory offers = _offers[tokenId];

        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isOfferStillValid == true) {
                payable(offers[i].buyerAddress).transfer(offers[i].amount);

                _offerNotifications[offers[i].buyerAddress].push(
                    OfferNotifications({
                        tokenId: tokenId,
                        isOfferAccepted: false
                    })
                );
            }
        }

        delete _offers[tokenId];
    }

    //getting all offers related to the NFT
    function listAllOffersForNFT(uint256 tokenId)
        external
        view
        returns (Offer[] memory)
    {
        Offer[] memory offers = _offers[tokenId];

        return offers;
    }

    //remove NFT from the market
    function withdrawNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = false;

        Offer[] memory offers = _offers[tokenId];
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isOfferStillValid == true)
                payable(offers[i].buyerAddress).transfer(offers[i].amount);
        }

        delete _offers[tokenId];
    }

    //move NFT back to the market
    function relistNFT(uint256 tokenId) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _nftsAvailableForSale[tokenId] = true;
    }

    //change tokenPrice if you are the owner
    function changeTokenPrice(uint256 tokenId, uint256 price) public {
        if (_ownerOf[tokenId] != msg.sender) revert OwnerNotValid();
        _tokenPrice[tokenId] = price;
    }

    //buy selected NFT
    function buyNFT(uint256 tokenId) public payable {
        if (msg.value < _tokenPrice[tokenId]) revert NotEnoughFundsSend();

        _nftsAvailableForSale[tokenId] = false;
        payable(_ownerOf[tokenId]).transfer(_tokenPrice[tokenId]);
        _ownerOf[tokenId] = msg.sender;
    }

    //get data for all tokens
    function getAllTokensData() external view returns (TokenData[] memory) {
        TokenData[] memory tokenData = new TokenData[](count);

        for (uint256 i; i < count; ++i) {
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

    //get data for single token
    function getTokenData(uint256 tokenId)
        external
        view
        returns (TokenData memory)
    {
        address owner = _ownerOf[tokenId];
        string memory uri = _tokenURI[tokenId];
        uint256 price = _tokenPrice[tokenId];
        bool forSale = _nftsAvailableForSale[tokenId];

        return
            TokenData({
                tokenId: tokenId,
                price: price,
                owner: owner,
                uri: uri,
                forSale: forSale
            });
    }
}