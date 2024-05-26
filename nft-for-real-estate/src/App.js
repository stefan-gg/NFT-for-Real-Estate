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
    position: 'top',
    isClosable: true,
    duration: 3000,
  });

  const viewOptions = ['All Properties', 'My Properties'];

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
    if (collectionService){
      await collectionService.getAllNFTs().then(_list => setList(_list));
    }
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

      try {
        await stateChanger.withdrawNFT(tokenId).then(tx => {

          provider.once(tx.hash, () => {
            toast({
              title: 'Withdrawal process is successful!',
              status: 'success',
            });
          });
        });
        setWithdraw(false);
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      } finally {
        setWithdraw(false);
      }
    }
  };

  const relistNft = async (tokenId) => {
    setWithdraw(true);

    toast({
      title: 'Relisting process is in progress!',
      status: 'info',
    });

    if (user.signer && stateChanger){

      try {
        await stateChanger.relistNFT(tokenId).then(tx => {

          provider.once(tx.hash, () => {
            toast({
              title: 'Relisting process is successful!',
              status: 'success',
            });
          });
        });
        setWithdraw(false);
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      } finally {
        setWithdraw(false);
      }
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
    try {
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
    }  catch (error) {
      if (error.code === 4001) {
        toast({
          title: 'Wallet connection failed',
          status: 'error',
          description: 'Transaction rejected by user.',
        });
      } else {
        toast({
          title: 'Wallet connection failed',
          status: 'error',
          description: 'Transaction rejected !',
        });
      }
    } finally {
      setIsMinting(false);
    }
  };

  const handleBuyNft = async (tokenId, price) => {
    setPurchase(true);

    if (user.signer && stateChanger) {

      toast({
        title: 'Purchase is in progess.',
        status: 'info',
      });

      try{
        await stateChanger.buyNFT(tokenId, price).then(tx => {

          provider.once(tx.hash, () => {
            toast({
              title: 'Purchase is successful!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
          setPurchase(false);
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: "Transaction rejected !",
          });
        }
      } finally {
        setPurchase(false);
      }
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

      try {
        await stateChanger.changeTokenPrice(tokenId, price).then(tx => {

          provider.once(tx.hash, () => {
            toast({
              title: 'Property price is updated successfully!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      }
    }
  };

  const addOffer = async (tokenId, price) => {
    if (user.signer && stateChanger){
      toast({
        // position: 'top',
        title: 'If you want to add offer you need to confirm transaction on Metamask.',
        status: 'info',
        duration: "10000"
      });

      try{
        await stateChanger.addTokenOffer(tokenId, price).then(tx => {
          provider.once(tx.hash, () => {
            toast({
              title: 'Offer is added successfully!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: "Transaction rejected !",
          });
        }
      }
    }
  }

  const listAllOffersForToken = async (tokenId) => {
    if (collectionService) {
      return await collectionService.listAllOffersForNFT(tokenId);
    }
  }

  const acceptOffer = async (tokenId, buyerAddress) => {
    toast({
      title: 'If you want to continue please accept Metamask transaction!',
      status: 'info',
      duration: '7000',
    });

    if (user.signer && stateChanger) {
      try {
        await stateChanger.acceptOffer(tokenId, buyerAddress).then(tx => {
          provider.once(tx.hash, () => {
            toast({
              title: 'Offer accepted!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      }
    }
  };

  const removeOffer = async (tokenId, buyerAddress) => {
    toast({
      title: 'If you want to continue please accept Metamask transaction!',
      status: 'info',
      duration: '7000',
    });

    if (user.signer && stateChanger){
      try {
        await stateChanger.removeOffer(tokenId, buyerAddress).then(tx => {
          provider.once(tx.hash, () => {
            toast({
              title: 'Offer is removed successfully!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      }
    }
  }

  const removeAllOffers = async (tokenId) => {
    toast({
      title: 'If you want to continue please accept Metamask transaction!',
      status: 'info',
      duration: '7000',
    });

    if (user.signer && stateChanger){
      try {
        await stateChanger.removeAllOffers(tokenId).then(tx => {
          provider.once(tx.hash, () => {
            toast({
              title: 'Offer is removed successfully!',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });
      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      }
    }
  }

  const listNotifications = async () => {
    toast({
      title:
        'If you want to continue please accept Metamask transaction! If you do not have any new notifications you can reject the transaction.',
      status: 'info',
      duration: '7000',
    });

    if (user.signer && stateChanger){
      try {
        const notificationList = await stateChanger.getNotificationsForUser();

        if (notificationList.length == 0){
          toast({
            title: "You don't have any new notifications.",
            status: 'info',
            duration: "10000"
          });
        }

        for(let i = 0; i < notificationList.length; i++){
          if (notificationList[i][1] === false){
            toast({
              title: 'Rejected offer for token with ID : ' + notificationList[i][0],
              status: 'error',
              duration: "10000"
            });
          } else {
            toast({
              title: 'Accepted offer for token with ID : ' + notificationList[i][0],
              status: 'success',
              duration: "10000"
            });
          }
        }

        await stateChanger.deleteNotificationsForUser().then(tx => {
          provider.once(tx.hash, () => {
            toast({
              title: 'There are no more notifications! ',
              status: 'success',
              description: 'Please refresh the page'
            });
          });
        });

      } catch (error) {
        if (error.code === 4001) {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected by user.',
          });
        } else {
          toast({
            title: 'Wallet connection failed',
            status: 'error',
            description: 'Transaction rejected !',
          });
        }
      }
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
      {user.balance &&
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
          addOffer={addOffer}
          listAllTokenOffers={listAllOffersForToken}
          acceptOffer={acceptOffer}
          removeOffer={removeOffer}
          removeAllOffers={removeAllOffers}
          listNotifications={listNotifications}
        />)
      }
    </>
  );
}

export default App;
