import { Button } from '@chakra-ui/react';
import React, { useState } from 'react';

const Carousel = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === children.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? children.length - 1 : prevIndex - 1));
  };

  return (
    <div style={{ position: 'relative', maxWidth: '300px', maxHeight: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)' }}>
        <Button mr={10} onClick={handlePrev}>Previous</Button>
        {children[currentIndex]}
        <Button ml={10} onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};

export default Carousel;