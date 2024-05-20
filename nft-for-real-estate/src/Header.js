import { Button, HStack, Select, Spacer, VStack, Text, useDisclosure, Flex } from "@chakra-ui/react";
import { ethers } from "ethers";
import CreateModal from "./CreateModal";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

const Header = ({ user, isConnecting, isMinting, viewOptions, handleViewOptionsSelect, handleConnect, handleCreateNFT }) => {
    
    const { 
        isOpen: isCreateOpen, 
        onOpen: onCreateOpen, 
        onClose: onCloseCreate 
    } = useDisclosure();
    const formatBalance = ethers.formatEther(user.balance).substring(0, 6);
    const address = user.signer?.address;
    const formatAddress = address && address.substring(0, 8) + 
                            '...' + 
                            address.substring(address.length-6, address.length);

    const isDisabled = user.balance;

    const handleCreate = () => {
        onCreateOpen();
    };

    return (
        <Flex
            w={"100%"}
            paddingX={10} 
            position={"fixed"} 
            backgroundColor={"gray.600"} 
            zIndex={100} 
            alignItems={"center"}
        >
            <HStack spacing={6}>
                <Button 
                    size={{base: "md", md: "lg", lg: "lg"}} 
                    onClick={handleCreate}
                    isDisabled={isMinting}
                    isLoading={isMinting}
                    loadingText={"Minting..."}
                >
                    Create NFT
                </Button>
                <Select onChange={handleViewOptionsSelect}>
                    {viewOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
            </HStack>
            <Spacer />
                <VStack>
                    {user.signer && (<Text>{formatAddress}</Text>)}
                    {user.signer && (<Text>{formatBalance}</Text>)}
                </VStack>
                <ColorModeSwitcher></ColorModeSwitcher>
                <Button isDisabled={isDisabled} onClick={handleConnect} isLoading={isConnecting}>
                    {isDisabled ? "Connected" : "Connect"}
                </Button>
                <CreateModal 
                    isOpen={isCreateOpen} 
                    onClose={onCloseCreate} 
                    onCreate={handleCreateNFT}
                ></CreateModal>
        </Flex>
    );
};

export default Header;