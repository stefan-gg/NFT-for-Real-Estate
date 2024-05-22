import { Contract, parseEther } from "ethers";
import abi from "./abi.json";
import { getMetadata } from "../services/IPFSService";

export default class CollectionService {
    constructor(provider) {
        this.contract = new Contract(
            "0x6715f9A241aCfcea3A585E0eE44A24B45B4448De",
            // "0x8035a5806f15b3780c4BA3b5C839065D69D2752e",
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
}