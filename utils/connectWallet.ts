import { BrowserProvider } from "ethers";
import { toast } from "sonner";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const FLOW_TESTNET_PARAMS = {
    chainId: "0x221",
    chainName: "Flow EVM Testnet",
    nativeCurrency: {
        name: "FLOW",
        symbol: "FLOW",
        decimals: 18,
    },
    rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
    blockExplorerUrls: ["https://evm-testnet.flowscan.io/"],
};

const FLOW_TESTNET_CHAIN_ID = 545;

// Logging helper with colors
const log = {
    info: (message: string, data?: any) => {
        console.log(`%c[INFO] ${message}`, 'color: #3b82f6; font-weight: bold', data || '');
    },
    success: (message: string, data?: any) => {
        console.log(`%c[SUCCESS] ${message}`, 'color: #10b981; font-weight: bold', data || '');
    },
    error: (message: string, data?: any) => {
        console.error(`%c[ERROR] ${message}`, 'color: #ef4444; font-weight: bold', data || '');
    },
    warning: (message: string, data?: any) => {
        console.warn(`%c[WARNING] ${message}`, 'color: #f59e0b; font-weight: bold', data || '');
    },
};

export const connectWallet = async (
    setIsConnected: (val: boolean) => void,
    setUserAddress: (val: string) => void,
    setSigner: (val: any) => void
) => {
    // Check if wallet exists
    if (!window.ethereum) {
        log.error("No EVM wallet detected");
        toast.error("No EVM Wallet Detected", {
            description: "Please install MetaMask or another EVM wallet",
        });
        return;
    }

    const connectingToast = toast.loading("Connecting wallet...", {
        description: "Please approve the connection in your wallet",
    });

    try {
        log.info("Initializing wallet connection");
        const provider = new BrowserProvider(window.ethereum);

        // Request accounts
        log.info("Requesting accounts");
        const accounts = await provider.send("eth_requestAccounts", []);

        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }

        const address = accounts[0];
        log.success("Account connected", { address });

        // Get signer
        const signer = await provider.getSigner();
        setSigner(signer);
        setUserAddress(address);

        // Check network
        log.info("Checking network");
        const { chainId } = await provider.getNetwork();
        const currentChainId = parseInt(chainId.toString(), 10);

        log.info("Current chain ID", { currentChainId, expected: FLOW_TESTNET_CHAIN_ID });

        if (currentChainId !== FLOW_TESTNET_CHAIN_ID) {
            log.warning("Wrong network detected, attempting to switch");
            toast.dismiss(connectingToast);

            const switchingToast = toast.loading("Switching to Flow EVM Testnet...", {
                description: "Please approve the network switch in your wallet",
            });

            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: FLOW_TESTNET_PARAMS.chainId }],
                });

                log.success("Successfully switched to Flow EVM Testnet");
                toast.dismiss(switchingToast);
                toast.success("Network Switched", {
                    description: "Successfully switched to Flow EVM Testnet",
                });
            } catch (switchError: any) {
                log.error("Failed to switch network", switchError);

                if (switchError.code === 4902) {
                    log.info("Network not found, attempting to add");
                    toast.dismiss(switchingToast);

                    const addingToast = toast.loading("Adding Flow EVM Testnet...", {
                        description: "Please approve adding the network in your wallet",
                    });

                    try {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [FLOW_TESTNET_PARAMS],
                        });

                        log.success("Successfully added Flow EVM Testnet");
                        toast.dismiss(addingToast);
                        toast.success("Network Added", {
                            description: "Flow EVM Testnet has been added successfully",
                        });
                    } catch (addError: any) {
                        log.error("Failed to add network", addError);
                        toast.dismiss(addingToast);
                        toast.error("Failed to Add Network", {
                            description: addError.message || "Could not add Flow EVM Testnet",
                        });
                        return;
                    }
                } else if (switchError.code === 4001) {
                    log.warning("User rejected network switch");
                    toast.dismiss(switchingToast);
                    toast.warning("Network Switch Cancelled", {
                        description: "You need to switch to Flow EVM Testnet to continue",
                    });
                    return;
                } else {
                    toast.dismiss(switchingToast);
                    toast.error("Failed to Switch Network", {
                        description: "Please switch to Flow EVM Testnet manually",
                    });
                    return;
                }
            }
        }

        // Connection successful
        setIsConnected(true);
        toast.dismiss(connectingToast);
        toast.success("Wallet Connected Successfully");
        log.success("Wallet connection completed successfully", { address });

    } catch (error: any) {
        log.error("Wallet connection failed", error);
        toast.dismiss(connectingToast);

        if (error.code === 4001) {
            toast.warning("Connection Cancelled", {
                description: "You rejected the connection request",
            });
        } else if (error.code === -32002) {
            toast.warning("Request Pending", {
                description: "Please check your wallet for a pending connection request",
            });
        } else {
            toast.error("Connection Failed", {
                description: error.message || "Wallet connection failed. Please try again.",
            });
        }

        console.error("Connection error:", error);
    }
};