# NFT-for-Real-Estate

This project is created for the Polkadot Prodigy hackathon


The only requirement for this project is secret keys for Filebase. You can obtain them by creating a Filebase account. However, there might be additional setup steps, so I recommend checking the link to the website I posted on my TaiKai project profile (link: https://taikai.network/PolkadotProdigy/hackathons/prodigy/projects/clwctl9vz0c0wyg01wjat92qz/idea).

Project functionalities:
 - buy NFT (user can buy selected NFT)
 - make an offer for NFT (user can make an offer for NFT)
 - remove NFT from the market (only the NFT owner can do this, NFT is still there but nobody can buy or bid on it, all the offers are refunded if there are any)
 - accept/decline the offer (only the owner of the NFT can see the offers for the NFT and he can accept or reject them and if he accepts the offer all the other offers are refunded)
 - notifications (a simple system of showing notifications related to the user offers, the user will see if his offer has been accepted or rejected)

The app is hosted on Netlify: https://dynamic-biscotti-aeb33e.netlify.app/ <br>
Requirements: MetaMask extension installed and connected, and use Sepolia test network 

If you want to run the project locally, you can clone the project and run these commands:
  - cd nft-for-real-estate
  - npm install
  - npm start
