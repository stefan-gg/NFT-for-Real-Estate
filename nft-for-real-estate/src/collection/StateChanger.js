import { Contract, parseEther } from "ethers";
import abi from "./abi.json";

export default class StateChanger {
    constructor(signer) {
        this.contract = new Contract(
            "0x50a8bb2F2943d33aEF8c4e119D2CdF77B981EfF9",
            abi, 
            signer);
    }

    async buyNFT(tokenId, amount){
        return await this.contract.buyNFT(tokenId, { value: parseEther(amount) });
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

    async addTokenOffer(tokenId, price) {
        return await this.contract.addOffer(tokenId, { value: price });
    }

    async removeOffer(tokenId, buyer) {
        return await this.contract.removeOfferAsTokenOwner(tokenId, buyer);
    }

    async acceptOffer(tokenId, buyer) {
        return await this.contract.acceptOffer(tokenId, buyer);
    }

    async removeAllOffers(tokenId) {
        return await this.contract.removeAllOffers(tokenId);
    }

    async getNotificationsForUser() {
        return await this.contract.getNotificationsForUser();
    }
}