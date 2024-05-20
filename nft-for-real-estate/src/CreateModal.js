import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import { parseEther } from "ethers";

const CreateModal = ({ isOpen, onCreate, onClose }) => {
    const [image, setImage] = useState(null)
    
    const [formData, setFormData] = useState({
        description: "",
        imageUrl: "",
        price: 0,
        files: [],
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        onCreate(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create new Nft</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Desc</FormLabel>
                            <Input placeholder="Description" 
                                onChange={(e) => { 
                                    setFormData({...formData, description: e.target.value});
                                }}  />

                            <FormLabel>Desc</FormLabel>
                            <Input placeholder="url" 
                                onChange={(e) => { 
                                    setFormData({...formData, imageUrl: e.target.value}) 
                                }}  />
                            <FormLabel>Select pictures (1st selected will be set as your NFT picture)</FormLabel>
                            <Input type="file" accept="image/png, image/jpeg" multiple={true} 
                                onChange={(e) => { 
                                    let arr = [];
                                    
                                    for (let i = 0; i < e.target.files.length; i++){
                                        arr.push(e.target.files[i]);
                                    }

                                    setImage(URL.createObjectURL(e.target.files[0]));

                                    setFormData({...formData, files: arr});
                                }}
                            ></Input>
                            <Spacer />

                            {image && <FormLabel>NFT image preview</FormLabel> }
                            {image && <img alt="preview image" width="300px" height="200px" src={image}/>}

                            <FormLabel>Price</FormLabel>
                            <Input 
                                type="number"
                                min={"0.00000000000000001"} 
                                placeholder="0.1 ETH"
                                onChange={(e) => {
                                    try{
                                        const price = parseEther(e.target.value);

                                        setFormData({...formData, price});
                                    } 
                                    catch (e){
                                        console.log("");
                                    } 
                                }}  />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit">Create NFT</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default CreateModal;