import { ethers } from "ethers";

const RPC_URL = "https://api-flow-evm-gateway-testnet.n.dwellir.com/f6bb3638-3e1d-4bf1-805e-a752adef0ccd";

export const getWalletBalance = async (address: string): Promise<string> => {
    const response = await fetch(RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
        }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    const balanceInWei = data.result;
    const balanceInEther = ethers.formatEther(balanceInWei);
    return Math.floor(Number(balanceInEther)).toString();
};