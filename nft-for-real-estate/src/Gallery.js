import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Text, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, useDisclosure, VStack, Card, Stack, CardBody, CardFooter, Input, effect, FormLabel } from "@chakra-ui/react";
import { EditIcon, ExternalLinkIcon, PlusSquareIcon, SmallAddIcon, InfoIcon } from '@chakra-ui/icons'
import { useEffect, useState, useRef } from "react";
import { formatEther, parseEther } from "ethers";
import Carousel from "./Carousel";

const Gallery = ({
  list: unfilteredList,
  refreshGallery,
  view,
  handleBuyNft,
  purchase,
  withdrawNFT,
  withdraw,
  relistNft,
  changePrice,
  addOffer,
  listAllTokenOffers,
  acceptOffer,
  removeOffer,
  removeAllOffers,
  listNotifications,
}) => {
  const { isOpen: moreDetailsIsOpen, onOpen: moreDetailsOnOpen, onClose: moreDetailsClose } = useDisclosure();
  const { isOpen: offerIsOpen, onOpen: offerOnOpen, onClose: offerOnClose } = useDisclosure();

  const [selectedNFT, setSelectedNFT] = useState(null);
  const [list, setList] = useState([]);
  const [offerList, setOfferList] = useState([]);
  const hiddenInputRefTokenId = useRef('');
  const [updatePrice, setUpdatePrice] = useState(0);
  const [offer, setOffer] = useState("");
  const [noOffersMessage, setNoOffersMessage] = useState(false);

  const handleSubmit = (e, tokenId, nftPrice) => {
    e.preventDefault();
    handleBuyNft(tokenId, nftPrice);
  };

  const handleWithdraw = (e, nftValue) => {
    e.preventDefault();
    withdrawNFT(nftValue);
  };

  const handleRelist = (e, nftValue) => {
    e.preventDefault();
    relistNft(nftValue);
  };

  const handleChangePrice = event => {
    const tokenId = hiddenInputRefTokenId.current.value;
    const price = updatePrice;

    event.preventDefault();
    changePrice(tokenId, price);
  };

  const handleAddOffer = (e, tokenId) => {
    e.preventDefault();
    offerOnClose();
    addOffer(tokenId, offer);
  }

  const handleNFTSelection = (nft) => {
    setOfferList([]);
    setSelectedNFT(nft);
    moreDetailsOnOpen();
  };

  const handleAcceptOffer = (e, tokenId, address) => {
    e.preventDefault();
    acceptOffer(tokenId, address);
    moreDetailsClose();
  }

  const handleRejectOffer = (e, tokenId, address) => {
    e.preventDefault();
    removeOffer(tokenId, address);
    moreDetailsClose();
  }

  const handleRejectAllOffers = (e, tokenId) => {
    e.preventDefault();
    removeAllOffers(tokenId);
    moreDetailsClose();
  }

  const closeMoreDetails = (e) => {
    setNoOffersMessage(false);
    moreDetailsClose();
  }

  const loadOffers = (e, nft) => {
    listAllTokenOffers(nft[0].toString()).then(_list => {
      setOfferList(_list);

      if (_list.length == 0){
        setNoOffersMessage(true);
      } else {
        setNoOffersMessage(false);
      }
    });
  }

  useEffect(() => {
    if (view === 'All Properties') {
      setList(unfilteredList);
    } else if (view === 'My Properties') {
      setList(
        unfilteredList.filter(
          nft =>
            nft[2].toLowerCase() ===
            window.ethereum.selectedAddress.toLowerCase()
        )
      );
    } else {
      setList(unfilteredList);
    }
  }, [unfilteredList, view]);


  return (
    <>
      {/* Offer modal */}
      <Modal isOpen={offerIsOpen} onClose={offerOnClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          {selectedNFT && (
            <>
              <ModalHeader>Make your offer!</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <form
                  onSubmit={e => handleAddOffer(e, selectedNFT[0].toString())}
                >
                  <FormLabel>NFT ID</FormLabel>
                  <Input readOnly={true} placeholder={selectedNFT[0]} />

                  <FormLabel title="If your offer is rejected or if you already posted an offer you will get your ETH back!">
                    Enter you offer <InfoIcon />
                  </FormLabel>
                  <Input
                    readOnly={false}
                    step="any"
                    type="number"
                    min="0.01"
                    max="10000"
                    placeholder={formatEther(selectedNFT[1])}
                    onChange={e => {
                      try {
                        let inputValue = e.target.value;
                        inputValue = inputValue.replace(/[eE]/g, '');
                        inputValue = inputValue.replace('-', '');
                        e.target.value = inputValue;

                        const price = parseEther(e.target.value)
                          .toString()
                          .replace('n', '');
                        setOffer(price);
                      } catch (e) {
                        console.log('');
                      }
                    }}
                  />

                  <Button mt={3} colorScheme="blue" type="submit">
                    Submit my offer
                  </Button>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button onClick={offerOnClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* More details modal */}
      <Modal isOpen={moreDetailsIsOpen} onClose={closeMoreDetails} size="full">
        <ModalOverlay />
        <ModalContent>
          {selectedNFT && (
            <>
              <ModalHeader>
                <HStack ml="40%" spacing={3}>
                  <Badge borderRadius="full" px="2">
                    #{selectedNFT[0].toString()}
                  </Badge>
                  <Box
                    mt="2"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    noOfLines={1}
                  >
                    NFT name: {selectedNFT.typeOfProperty}
                  </Box>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Center marginTop="15%" marginRight="58%">
                  <Carousel>
                    {selectedNFT.files.map((imageSrc, index) => (
                      <Box width="550px" height="450px" key={index}>
                        <Image
                          key={index}
                          objectFit="cover"
                          width="550px"
                          height="450px"
                          src={'https://ipfs.filebase.io/ipfs/' + imageSrc}
                          alt="Property image"
                        />
                      </Box>
                    ))}
                  </Carousel>
                </Center>
                <Card
                  mt={60}
                  direction={{ base: 'column', sm: 'row' }}
                  overflow="hidden"
                  variant="outline"
                >
                  <Stack>
                    <CardBody>
                      {offerList.length == 0 ? (
                        <Box>
                          <Heading size="md">
                            Information about property
                          </Heading>
                          <Box mt={3}>
                            <Text size="md">Price:</Text>{' '}
                            {formatEther(selectedNFT[1])} ETH
                            <form onSubmit={handleChangePrice}>
                              <Input
                                type="hidden"
                                ref={hiddenInputRefTokenId}
                                value={selectedNFT[0].toString()}
                              />
                              {selectedNFT[2].toLowerCase() ===
                                window.ethereum.selectedAddress.toLowerCase() && (
                                <Box>
                                  <Input
                                    step="any"
                                    type="number"
                                    min="0.01"
                                    max="100000"
                                    title="If you type e, E or - it will reset the value"
                                    placeholder="0.1 ETH"
                                    onChange={e => {
                                      try {
                                        let inputValue = e.target.value;
                                        inputValue = inputValue.replace(
                                          /[eE]/g,
                                          ''
                                        );
                                        inputValue = inputValue.replace(
                                          '-',
                                          ''
                                        );
                                        e.target.value = inputValue;

                                        const price = parseEther(e.target.value)
                                          .toString()
                                          .replace('n', '');

                                        setUpdatePrice(price);
                                      } catch (e) {
                                        console.log('');
                                      }
                                    }}
                                  />
                                  <Button
                                    type="submit"
                                    mt={1}
                                    // ml="20%"
                                    size="sm"
                                    colorScheme="green"
                                  >
                                    <EditIcon mr={1} /> Update price
                                  </Button>
                                </Box>
                              )}
                            </form>
                          </Box>
                          <Box mt={3}>
                            <Text size="md">Owner:</Text> {selectedNFT[2]}
                          </Box>
                          <Box mt={3}>
                            <Text size="md">Description:</Text>{' '}
                            {selectedNFT.description}
                          </Box>
                          <Box mt={3} title="Click on the link">
                            <Text size="md">Location: </Text>
                            <Link
                              isExternal
                              onClick={() =>
                                window.open(selectedNFT.location, '_blank')
                              }
                            >
                              {selectedNFT.location}{' '}
                              <ExternalLinkIcon mx="2px" />
                            </Link>
                          </Box>
                          <Box mt={3} py="2">
                            <Text size="md">Property area is:</Text>{' '}
                            {selectedNFT.propertyArea} m^2
                          </Box>
                          <Box mt={3} py="2">
                            <Text size="md">This property has: </Text>{' '}
                            {selectedNFT.numberOfRooms} rooms.
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <form onSubmit={e =>
                                handleRejectAllOffers(e, selectedNFT[0])
                              }>
                            <Button
                              mb={3}
                              colorScheme="red"
                              type="submit"
                            >
                              Reject all offers
                            </Button>
                          </form>
                          <Stack>
                            {offerList.map((offer, index) => (
                              <Box key={index}>
                                {offer[2] && (
                                  <HStack p={3} border="1px solid white">
                                    <Box>
                                      <Box>Offerer's address : {offer[0]}</Box>
                                      <Box>
                                        Offer :{' '}
                                        {formatEther(offer[1]).toString()}
                                      </Box>
                                    </Box>
                                    <form
                                      onSubmit={e =>
                                        handleAcceptOffer(
                                          e,
                                          selectedNFT[0],
                                          offer[0].toString()
                                        )
                                      }
                                    >
                                      <Button
                                        type="submit"
                                        ml={2}
                                        colorScheme="green"
                                      >
                                        Accept offer
                                      </Button>
                                    </form>
                                    <form
                                      onSubmit={e =>
                                        handleRejectOffer(
                                          e,
                                          selectedNFT[0],
                                          offer[0].toString()
                                        )
                                      }
                                    >
                                      <Button
                                        type="submit"
                                        ml={4}
                                        colorScheme="red"
                                      >
                                        Reject offer
                                      </Button>
                                    </form>
                                  </HStack>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {noOffersMessage && (
                        <Box>You have no offers for now.</Box>
                      )}

                      {selectedNFT[2].toLowerCase() ===
                        window.ethereum.selectedAddress.toLowerCase() && (
                        <Button
                          onClick={e => loadOffers(e, selectedNFT)}
                          mt={2}
                          variant="solid"
                          colorScheme="blue"
                        >
                          See all offers for this property
                        </Button>
                      )}
                    </CardBody>
                  </Stack>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={closeMoreDetails}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div
        style={{
          paddingTop: '100px',
        }}
      >
        <Flex pr="5">
          <Heading as="h1" size="xl" ml={6}>
            Marketplace
          </Heading>
          <Spacer />
          <HStack>
            <Button colorScheme="green" onClick={listNotifications}>Load notifications</Button>
            <Button onClick={refreshGallery}>Refresh</Button>
          </HStack>
        </Flex>
        <SimpleGrid columns={3} spacing={10} mt={7} ml={5}>
          {list.map(nft => (
            <Box key={nft[0].toString()}>
              <Box
                maxW="lg"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Box p="6">
                  <HStack spacing={3}>
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      #{nft[0].toString()}
                    </Badge>
                    <Box
                      mt="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      noOfLines={1}
                    >
                      {nft.typeOfProperty}
                    </Box>
                  </HStack>
                  <Box>Price: {formatEther(nft[1])} ETH</Box>
                  <Center>
                    <img
                      style={{
                        height: '300px',
                        width: '300px',
                        marginTop: '2%',
                      }}
                      src={'https://ipfs.filebase.io/ipfs/' + nft.files[0]}
                    />
                  </Center>
                  <HStack mt={1}>
                    <Button
                      colorScheme="gray"
                      mt={1}
                      size="sm"
                      onClick={() => handleNFTSelection(nft)}
                    >
                      See more details
                    </Button>
                    {nft[2].toLowerCase() !==
                      window.ethereum.selectedAddress.toLowerCase() &&
                      nft[4] === true && (
                        <HStack>
                          <form
                            onSubmit={e =>
                              handleSubmit(
                                e,
                                nft[0].toString(),
                                formatEther(nft[1])
                              )
                            }
                          >
                            <Button
                              isLoading={purchase}
                              mt={1}
                              ml={20}
                              size="sm"
                              type="submit"
                              colorScheme="red"
                            >
                              Buy
                            </Button>
                          </form>
                          <Button
                            mt={1}
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                              setSelectedNFT(nft);
                              offerOnOpen();
                            }}
                          >
                            <PlusSquareIcon mr={1} /> Make an offer
                          </Button>
                        </HStack>
                      )}
                    {nft[2].toLowerCase() ===
                      window.ethereum.selectedAddress.toLowerCase() &&
                      nft[4] === true && (
                        <form
                          onSubmit={e => handleWithdraw(e, nft[0].toString())}
                        >
                          <Button
                            isLoading={withdraw}
                            type="submit"
                            mt={1}
                            ml="20%"
                            size="sm"
                            colorScheme="green"
                          >
                            Withdraw property from the market
                          </Button>
                        </form>
                      )}
                    {nft[2].toLowerCase() ===
                      window.ethereum.selectedAddress.toLowerCase() &&
                      nft[4] === false && (
                        <form
                          onSubmit={e => handleRelist(e, nft[0].toString())}
                        >
                          <Button
                            isLoading={withdraw}
                            type="submit"
                            mt={1}
                            ml="35%"
                            size="sm"
                            colorScheme="green"
                          >
                            <SmallAddIcon /> Relist property to the market
                          </Button>
                        </form>
                      )}
                  </HStack>
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </div>
    </>
  );
};

export default Gallery;