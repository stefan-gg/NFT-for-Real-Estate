import { BrowserProvider, toBigInt } from 'ethers';
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

import Header from './Header';
import Gallery from './Gallery';
import CollectionService from './collection/CollectionService';
import StateChanger from './collection/StateChanger';
import { uploadJSON, getFilesCids } from './services/IPFSService';

function App() {
  const [provider, setProvider] = useState(null);
  const [collectionService, setCollectionService] = useState(null);
  const [stateChanger, setStateChanger] = useState(null);
  const [user, setUser] = useState({
    signer: null,
    balance: 0,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [list, setList] = useState([]);
  const [view, setView] = useState('All NFTs');
  const [purchase, setPurchase] = useState(false);
  const [withdraw, setWithdraw] = useState(false);

  const toast = useToast({
    position: 'top-right',
    isClosable: true,
    duration: 3000,
  });

  const viewOptions = ['All Properties', 'My Properties', 'Offers', 'My Offers'];

  useEffect(() => {
    const setupProvider = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
      }
    };

    setupProvider();
  }, []);

  useEffect(() => {
    if (provider) {
      loadAccounts();

      const _collectionService = new CollectionService(provider);
      _collectionService.getAllNFTs().then(_list => setList(_list));

      setCollectionService(_collectionService);

      window.ethereum.on('accountsChanged', accounts => {
        updateAccounts(accounts);
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return () => {
        window.ethereum?.removeAllListeners();
      };
    }
  }, [provider]);

  const refreshGallery = async () => {
    if (collectionService)
      await collectionService.getAllNFTs().then(_list => setList(_list));
  };

  const loadAccounts = async () => {
    const accounts = await provider.send('eth_accounts', []);
    updateAccounts(accounts);
  };

  const updateAccounts = async accounts => {
    if (provider) {
      if (accounts && accounts.length > 0) {
        setUser({
          signer: await provider.getSigner(),
          balance: await provider.getBalance(accounts[0]),
        });

        setStateChanger(new StateChanger(await provider.getSigner()));
      } else {
        setUser({ signer: null, balance: 0 });
      }
    }
  };

  const handleConnectWallet = async () => {
    setIsMinting(true);
    setIsConnecting(true);

    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      toast({ title: 'Wallet connected', status: 'success' });
      updateAccounts(accounts);
    } catch (error) {
      toast({
        title: 'Wallet connection failed',
        status: 'error',
        description: error.code,
      });
    }

    setIsConnecting(false);
    setIsMinting(false);
  };

  const withdrawNFT = async (tokenId) => {
    setWithdraw(true);
    if (user.signer && stateChanger){

      toast({
        title: 'Withdrawal process is in progress!',
        status: 'info',
      });

      await stateChanger.withdrawNFT(tokenId).then(tx => {

        provider.once(tx.hash, () => {
          toast({
            title: 'Withdrawal process is successful!',
            status: 'success',
          });
        });
      });
      setWithdraw(false);
    }
  };

  const relistNft = async (tokenId) => {
    setWithdraw(true);

    toast({
      title: 'Relisting process is in progress!',
      status: 'info',
    });

    if (user.signer && stateChanger){

      await stateChanger.relistNFT(tokenId).then(tx => {

        provider.once(tx.hash, () => {
          toast({
            title: 'Relisting process is successful!',
            status: 'success',
          });
        });
      });
      setWithdraw(false);
    }
  };

  const handleCreateNFT = async data => {
    setIsMinting(true);

    toast({
      title: 'NFT creation process has started!',
      status: 'info',
    });

    const arr = await getFilesCids(data.files);

    const metadata = {
      typeOfProperty: data.typeOfProperty,
      propertyArea: data.propertyArea,
      description: data.description,
      numberOfRooms: data.numberOfRooms,
      location: data.location,
      files: arr,
    };

    await uploadJSON(Date.now().toString(), metadata, cid => {
      if (collectionService) {
        const price = toBigInt(data.price);

        collectionService.mint(user.signer, cid, price).then(tx => {

          setIsMinting(false);

          provider.once(tx.hash, () => {
            toast({
              title: 'Your NFT is created!',
              status: 'success',
              description: 'You can now refresh the market too see your new Property NFT',
            });
          });
        });
      }
    });
  };

  const handleBuyNft = async (tokenId, price) => {
    setPurchase(true);

    if (user.signer && stateChanger) {

      toast({
        title: 'Purchase is in progess.',
        status: 'info',
      });

      await stateChanger.buyNFT(tokenId, price).then(tx => {

        provider.once(tx.hash, () => {
          toast({
            title: 'Purchase is successful!',
            status: 'success',
          });
        });
        setPurchase(false);
      });
    } else {
      toast({
        title: 'There was an error, please try again later.',
        status: 'error',
      });
    }
  };

  const changePrice = async (tokenId, price) => {
    if (user.signer && stateChanger){

      toast({
        title: 'Property price change is in progess.',
        status: 'info',
      });

      await stateChanger.changeTokenPrice(tokenId, price).then(tx => {

        provider.once(tx.hash, () => {
          toast({
            title: 'Property price is updated successfuly!',
            status: 'success',
          });
        });
      });

    }
  }

  return (
    <>
      <Header
        user={user}
        isConnecting={isConnecting}
        isMinting={isMinting}
        viewOptions={viewOptions}
        handleViewOptionsSelect={e => setView(e.target.value)}
        handleConnect={handleConnectWallet}
        handleCreateNFT={handleCreateNFT}
      />
      {list.length > 0 && 
        (<Gallery
          list={list}
          refreshGallery={refreshGallery}
          view={view}
          handleBuyNft={handleBuyNft}
          purchase={purchase}
          withdrawNFT={withdrawNFT}
          withdraw={withdraw}
          relistNft={relistNft}
          changePrice={changePrice}
        />)
      }
    </>
  );
}

export default App;
