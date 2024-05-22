import { Contract, parseEther } from "ethers";
import abi from "./abi.json";

export default class StateChanger {
    constructor(signer) {
        this.contract = new Contract(
            "0x6715f9A241aCfcea3A585E0eE44A24B45B4448De",
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
}