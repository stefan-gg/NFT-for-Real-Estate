import { Contract, parseEther } from "ethers";
import abi from "./abi.json";
import { getMetadata } from "../services/IPFSService";

export default class CollectionService {
    constructor(provider) {
        this.contract = new Contract(
            "0x50a8bb2F2943d33aEF8c4e119D2CdF77B981EfF9",
            abi, 
            provider);
    }

    async getAllNFTs() {
        const data = await this.contract.getAllTokensData();
        
        const nfts = await Promise.all(
            data.map(async (nft) => {
                const metadata = await getMetadata(nft.uri);
                
                return {
                    ...nft,
                    ...metadata,
                };
            })
        );
        return nfts;
    }

    async getNFT(id) {
        return await this.contract.getTokenData(id);
    }
    
    async mint(signer, cid, price) {
        return await this.contract
                    .connect(signer)
                    .mint(cid, price, { value: 1n * 10n ** 16n});
    }

    async listAllOffersForNFT(tokenId) {
        return await this.contract.listAllOffersForNFT(tokenId);
    }
}