import { Badge, Box, Button, Flex, Heading, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, useDisclosure, VStack } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { formatEther } from "ethers";

const Gallery = ({ list: unfilteredList, refreshGallery, view }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ selectedNFT, setSelectedNFT ] = useState(null);
    const [list, setList] = useState([]);

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
            <Modal isOpen={isOpen} onClose={onClose}>
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
                            {selectedNFT.description}
                        </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Image src={selectedNFT.image} alt={selectedNFT.image} />
                        <Box mt={1}>
                        Price: {formatEther(selectedNFT[1])} ETH
                        </Box>
                        <Box mt={1}>
                        Owner:{" "}                    
                        {selectedNFT[2]}

                        </Box>
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
            <div style={{
                paddingTop: '100px',
            }}>
                <Flex pr="5">
                    <Heading as="h1" size="xl" mr={1} >
                        Gallery
                    </Heading>
                    <Spacer />
                    <Button onClick={refreshGallery}>Refresh</Button>
                </Flex>
            <SimpleGrid columns={3} spacing={10} mt={7} ml={5}>
                {
                    list.map((nft => (
                        <Box key={nft[0].toString()}>
                            <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
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
                                        {nft.description}
                                    </Box>
                                </HStack>
                                <Box>{formatEther(nft[1])} ETH</Box>
                                <HStack>
                                    <Button colorScheme="gray" mt={1} size="sm" onClick={ () => {
                                        setSelectedNFT(nft);
                                        onOpen();
                                    }}>
                                        See details
                                    </Button>
                                    {nft[2].toLowerCase() ===
                  window.ethereum.selectedAddress.toLowerCase() && <Button mt={1} size="sm" colorScheme="red">
                                        Buy/Make an offer
                                    </Button>}
                                </HStack>
                            </Box>
                            </Box>
                        </Box>
                )))}
            </SimpleGrid>
            </div>
        </>
    );
};

export default Gallery;