import { Contract, parseEther } from "ethers";
import abi from "./abi.json";

export default class StateChanger {
    constructor(signer) {
        this.contract = new Contract(
            "0xEb0218539596264235c64B1444EA5CE7916f7C7C",
            // "0x8035a5806f15b3780c4BA3b5C839065D69D2752e",
            abi, 
            signer);
    }

    async buyNFT(tokenId, amount){
        return await this.contract.buyNFT(tokenId, /*parseEther(price),*/ { value: parseEther(amount) });
    }

    async withdrawNFT(tokenId) {
        return await this.contract.withdrawNFT(tokenId);
    }

    async relistNFT(tokenId) {
        return await this.contract.relistNFT(tokenId);
    }

    async changeTokenPrice(tokenId, price) {
        return await this.contract.changeTokenPrice(tokenId, price);
    }
}