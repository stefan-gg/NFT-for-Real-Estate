import { Contract, parseEther } from "ethers";
import abi from "./abi.json";

export default class StateChanger {
    constructor(signer) {
        this.contract = new Contract(
            "0x14D7F9aBE8af7bc30A4e4b3972aD4e5e6Eb11DfD",
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

    async deleteNotificationsForUser() {
        return await this.contract.deleteNotificationsForUser();
    }
}