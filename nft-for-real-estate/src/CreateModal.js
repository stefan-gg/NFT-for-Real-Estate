import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Textarea, Toast } from "@chakra-ui/react";
import { useState } from "react";
import { parseEther } from "ethers";
import { AttachmentIcon, InfoIcon } from "@chakra-ui/icons";

const CreateModal = ({ isOpen, onCreate, onClose }) => {
    const [image, setImage] = useState(null)
    
    const [formData, setFormData] = useState({
        typeOfProperty: "",
        propertyArea: 0,
        description: "",
        numberOfRooms: 0,
        price: "",
        location: "",
        files: [],
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        onCreate(formData);
        setImage(null);
        onClose();
    };

    const onCustomClose = () => {
        onClose();
        setImage(null);
    }

    return (
        <Modal isOpen={isOpen} onClose={onCustomClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create new Nft</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormControl isRequired>

                            <FormLabel>Type of property</FormLabel>
                            <Input placeholder="Small beach house" 
                                onChange={(e) => { 
                                    setFormData({...formData, typeOfProperty: e.target.value});
                                }}  
                            />

                            <FormLabel title="If you type e, E or - it will reset the value">
                                Property area (in m^2)
                            </FormLabel>
                            <Input min="10" max="10000" placeholder="100" type="number"
                                onChange={(e) => { 
                                    let inputValue = e.target.value;
                                    inputValue = inputValue.replace(/[eE]/g, '');
                                    inputValue = inputValue.replace("-", '');
                                    e.target.value = inputValue;
                                    setFormData({...formData, propertyArea: inputValue}); 
                                }}
                            />

                            <FormLabel>Description</FormLabel>
                            <Textarea placeholder="Additional informations about the property" maxLength="500"
                                onChange={(e) => { 
                                    setFormData({...formData, description: e.target.value});
                                }}  
                            />
                            
                            <FormLabel title="If you type e, E or - it will reset the value">
                                Number of rooms
                            </FormLabel>
                            <Input 
                                type="number"
                                min="1"
                                max="100"
                                placeholder="2"
                                onChange={(e) => {
                                    let inputValue = e.target.value;
                                    inputValue = inputValue.replace(/[eE]/g, '');
                                    inputValue = inputValue.replace("-", '');
                                    e.target.value = inputValue;
                                    setFormData({...formData, numberOfRooms: e.target.value}) 
                                }}  />

                            <FormLabel title="Link you get when you choose 'Share' option in Google maps and copy the link ">
                                Location (link from google maps)
                            </FormLabel>
                            <Input type="text" placeholder="https://maps.app.goo.gl/..."
                                onChange={(e) => { 
                                    setFormData({...formData, location: e.target.value});
                                }}  
                            />

                            <FormLabel>Select picture for your property NFT <AttachmentIcon ml={1} /></FormLabel>
                            <Input type="file" accept="image/png, image/jpeg" multiple={false} 
                                onChange={(e) => { 
                                    let arrayWithFiles = [e.target.files[0]];

                                    if (e.target.files[0].size > 1024*1024) {
                                        alert("Maximum picture size must be 1MB! Please select different picture.")
                                    } else {
                                        setImage(URL.createObjectURL(arrayWithFiles[0]));
                                    
                                        setFormData({...formData, files: arrayWithFiles});
                                    }
                                }}
                            />
                            
                            {image && <FormLabel>NFT image preview</FormLabel> }
                            {image && <img alt="preview image" width="300px" height="200px" src={image}/>}
                            
                            <FormLabel 
                                title="These pictures will be presented in the 'See more detail' section">
                                Select other pictures that you want to show related to the property <InfoIcon mr={1} />
                            </FormLabel>
                            <Input type="file" accept="image/png, image/jpeg" multiple={true} 
                                onChange={(e) => { 
                                    let arrayWithFiles = formData.files;

                                    if (formData.files.length > 1){
                                        arrayWithFiles = [formData.files[0]];
                                    }

                                    for (let i = 0; i < e.target.files.length; i++){
                                        if (e.target.files[0].size > 1024*1024) {
                                            alert("Maximum picture size must be 1MB! Please select different picture.")
                                        } else {
                                            arrayWithFiles.push(e.target.files[i]);    
                                        }
                                    }

                                    setFormData({...formData, files: arrayWithFiles});
                                }}
                            />

                            {/* {image && <FormLabel>NFT image preview</FormLabel> }
                            {image && <img alt="preview image" width="300px" height="200px" src={image}/>} */}

                            <FormLabel>Price</FormLabel>
                            <Input 
                                step="any"
                                type="number"
                                min="0.01"
                                max="100000"
                                title="If you type e, E or - it will reset the value"
                                placeholder="0.1 ETH"
                                onChange={(e) => {
                                    try{
                                        let inputValue = e.target.value;
                                        inputValue = inputValue.replace(/[eE]/g, '');
                                        inputValue = inputValue.replace("-", '');
                                        e.target.value = inputValue;

                                        const price = parseEther(e.target.value).toString().replace("n", "");

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