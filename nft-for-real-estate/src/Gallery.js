import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Text, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, useDisclosure, VStack, Card, Stack, CardBody, CardFooter, Input, effect } from "@chakra-ui/react";
import { AddIcon, EditIcon, ExternalLinkIcon, PlusSquareIcon, SmallAddIcon } from '@chakra-ui/icons'
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
  changePrice
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [list, setList] = useState([]);
  const hiddenInputRefTokenId = useRef('');
  const [updatePrice, setUpdatePrice] = useState(0);

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
    }
  }, [unfilteredList, view]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          {selectedNFT && (
            <>
              {console.log(selectedNFT)}
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
                <Center marginTop="15%" marginRight="45%">
                  <Carousel>
                    {selectedNFT.files.map(imageSrc => (
                      <Box width="450px" height="350px">
                        <Image
                          objectFit="cover"
                          width="450px"
                          height="350px"
                          src={'https://ipfs.filebase.io/ipfs/' + imageSrc}
                          alt="Caffe Latte"
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
                      <Heading size="md">Information about property</Heading>
                      <Box mt={3}>
                        <Text size="md">Price:</Text>{' '}
                        {formatEther(selectedNFT[1])} ETH
                        <form onSubmit={handleChangePrice}>
                          <Input
                            type="hidden"
                            ref={hiddenInputRefTokenId}
                            value={selectedNFT[0].toString()}
                          />
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
                                inputValue = inputValue.replace(/[eE]/g, '');
                                inputValue = inputValue.replace('-', '');
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
                        <Link isExternal
                          onClick={() =>
                            window.open(selectedNFT.location, '_blank')
                          }
                        >
                          {selectedNFT.location} <ExternalLinkIcon mx='2px' />
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
                    </CardBody>

                    {/* <CardFooter>
                      <Button variant="solid" colorScheme="blue">
                        Buy Latte
                      </Button>
                    </CardFooter> */}
                  </Stack>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button variant="ghost">Secondary Action</Button>
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
          <Button onClick={refreshGallery}>Refresh</Button>
        </Flex>
        <SimpleGrid columns={3} spacing={10} mt={7} ml={5}>
          {unfilteredList.map(nft => (
            <Box key={nft[0].toString()}>
              <Box
                maxW="lg"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
              >
                {/* <Image src={nft.image} alt={nft.image} /> */}
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
                      onClick={() => {
                        setSelectedNFT(nft);
                        onOpen();
                      }}
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
                              size="sm"
                              type="submit"
                              colorScheme="red"
                            >
                              Buy
                            </Button>
                          </form>
                          <Button mt={1} size="sm" colorScheme="red">
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