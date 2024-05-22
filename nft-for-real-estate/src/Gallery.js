import { Badge, Box, Button, Flex, Heading, HStack, Image, Text, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, useDisclosure, VStack, Card, Stack, CardBody, CardFooter, Input } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { formatEther, NamedFragment } from "ethers";

const Gallery = ({ list: unfilteredList, refreshGallery, view, handleBuyNft }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ selectedNFT, setSelectedNFT ] = useState(null);
    const [list, setList] = useState([]);
    const [formData, setFormData] = useState({
      tokenId: "0",
      price: "1",
    });
    const hiddenInputRefTokenId = useRef("");
    const hiddenInputRefPrice = useRef("");

    const handleSubmit = (event) => {
      const tokenId = hiddenInputRefTokenId.current.value;
      const price = hiddenInputRefPrice.current.value;

      setFormData({...formData, tokenId : tokenId});
      setFormData({...formData, price: price});

      event.preventDefault();
      handleBuyNft(tokenId, price);
    };

    // const isFirstRender = useRef(true);

    // useEffect(() => {
    //     if (isFirstRender.current) {
    //     isFirstRender.current = false;
    //     return;
    //     }
    //     setList(unfilteredList);

    // }, [unfilteredList]);

    useEffect(() => {
        if (view === "All NFTs") {
            setList(unfilteredList);
          } else if (view === "My NFTs") {
            setList(
              unfilteredList.filter(
                (nft) =>
                  nft[2].toLowerCase() ===
                  window.ethereum.selectedAddress.toLowerCase()
              )
            );
          } else if (view === "Offered NFTs") {
            setList(unfilteredList);
          } else if (view === "My Offers") 
            setList(unfilteredList);
    }, [unfilteredList, view]);

    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            {selectedNFT && (
              <>
                <ModalHeader>
                  <HStack spacing={3}>
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
                  {/* <Image src={selectedNFT.image} alt={selectedNFT.image} /> */}
                  {/* <Box mt={1}>Price: {formatEther(selectedNFT[1])} ETH</Box>
                  <Box mt={1}>Owner: {selectedNFT[2]}</Box> */}
                  {/* Carousel here  */}
                  {/* <Box>Description: {selectedNFT.description}</Box>
                  <Box title="Click on the link">
                    Location:{' '}
                    <Link
                      onClick={() =>
                        window.open(selectedNFT.location, '_blank')
                      }
                    >
                      {selectedNFT.location}
                    </Link>
                  </Box> */}

                  <Image
                    objectFit="cover"
                    maxW="600px"
                    src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
                    alt="Caffe Latte"
                  />
                  <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow="hidden"
                    variant="outline"
                  >
                    {/* <Image
                      objectFit="cover"
                      maxW="600px"
                      src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
                      alt="Caffe Latte"
                    /> */}

                    <Stack>
                      <CardBody>
                        <Heading size="md">The perfect latte</Heading>

                        {/* <Text py="2">
                          Caffè latte is a coffee beverage of Italian origin
                          made with espresso and steamed milk.
                        </Text> */}

                        <Box mt={1}>
                          Price: {formatEther(selectedNFT[1])} ETH
                        </Box>
                        <Box mt={1}>Owner: {selectedNFT[2]}</Box>
                        {/* Carousel here  */}
                        <Box>Description: {selectedNFT.description}</Box>
                        <Box title="Click on the link">
                          Location:{' '}
                          <Link
                            onClick={() =>
                              window.open(selectedNFT.location, '_blank')
                            }
                          >
                            {selectedNFT.location}
                          </Link>
                        </Box>
                        <Box py="2">
                          Property area is: {selectedNFT.propertyArea} m^2
                        </Box>
                        <Box py="2">
                          This property has {selectedNFT.numberOfRooms} rooms.
                        </Box>
                      </CardBody>

                      <CardFooter>
                        <Button variant="solid" colorScheme="blue">
                          Buy Latte
                        </Button>
                      </CardFooter>
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
            <Heading as="h1" size="xl" mr={1}>
              Gallery
            </Heading>
            <Spacer />
            <Button onClick={refreshGallery}>Refresh</Button>
          </Flex>
          <SimpleGrid columns={3} spacing={10} mt={7} ml={5}>
            {list.map(nft => (
              <Box key={nft[0].toString()}>
                <Box
                  maxW="sm"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Image src={nft.image} alt={nft.image} />
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
                    <Box>{formatEther(nft[1])} ETH</Box>
                    <HStack>
                      <Button
                        colorScheme="gray"
                        mt={1}
                        size="sm"
                        onClick={() => {
                          setSelectedNFT(nft);
                          onOpen();
                        }}
                      >
                        See details
                      </Button>
                      {
                        nft[2].toLowerCase() !==
                          window.ethereum.selectedAddress.toLowerCase() && (
                          <form onSubmit={handleSubmit}>
                            <Input
                              type="hidden"
                              ref={hiddenInputRefTokenId} 
                              value={nft[0].toString()} 
                            />
                            <Input 
                              type="hidden" 
                              ref={hiddenInputRefPrice}
                              value={formatEther(nft[1])} 
                            />
                            <Button
                              mt={1}
                              size="sm"
                              type="submit"
                              colorScheme="red"
                            >
                              Buy
                            </Button>
                          </form>
                        )
                        // &&
                        // <Button mt={1} size="sm" colorScheme="red">
                        //     Make an offer
                        // </Button>
                      }
                      {nft[2].toLowerCase() ===
                        window.ethereum.selectedAddress.toLowerCase() && (
                        <Button mt={1} size="sm" colorScheme="green">
                          Withdraw NFT from the market
                        </Button>
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