import { ethers, JsonRpcProvider } from "ethers";
import { ABI } from "./abi";

const RPC_URL = "https://api-flow-evm-gateway-testnet.n.dwellir.com/f6bb3638-3e1d-4bf1-805e-a752adef0ccd";
const provider = new JsonRpcProvider(RPC_URL);

export const getWalletBalance = async (address: string): Promise<string> => {
    try {
        const balanceInWei = await provider.getBalance(address);
        const balanceInEther = ethers.formatEther(balanceInWei);
        return Math.floor(Number(balanceInEther)).toString();
    } catch (error) {
        console.error(`Failed to get wallet balance for ${address}:`, error);
        return "0";
    }
};

export const getContractBalance = async (): Promise<string> => {
    try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("Contract address not configured");
        }
        const contract = new ethers.Contract(contractAddress, ABI, provider);
        const balanceInWei = await contract.getContractBalance();
        const balanceInEther = ethers.formatEther(balanceInWei);
        return Math.floor(Number(balanceInEther)).toString();
    } catch (error) {
        console.error("Failed to get contract balance from contract function:", error);
        return "0";
    }
};
