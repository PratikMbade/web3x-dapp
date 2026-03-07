/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { SetStateAction, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Rocket, Sparkles, ArrowRight, TrendingUp, Gift, User, Users, Wallet, AlertCircle, Loader2, DollarSign } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { icoContractInstance } from "@/contract/ico-contract/ico-contract"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function ActionCards() {
    const [buyDialogOpen, setBuyDialogOpen] = useState(false)
    const [buyMode, setBuyMode] = useState<"self" | "others">("self")
    const [usdtAmount, setUsdtAmount] = useState<string>("10") // Changed to string for better input control
    const [recipientAddress, setRecipientAddress] = useState("")
    const [buyLimitData, setBuyLimitData] = useState<any>(null)
    const [isLoadingLimit, setIsLoadingLimit] = useState(false)
    const [icoPhase, setIcoPhase] = useState<number | null>(null)
    const [pricePerToken, setPricePerToken] = useState<number | null>(null)
    const [isLoadingPrice, setIsLoadingPrice] = useState(false)
    const activeAccount = useActiveAccount();
    
    const minUSDT = 10 // Minimum $10
    const maxUSDT = 100000
    
    // Parse the USDT amount for calculations
    const usdtAmountNumber = parseFloat(usdtAmount) || 0
    
    // Calculate token amount based on USDT and price
    const tokenAmount = pricePerToken ? usdtAmountNumber / pricePerToken : 0

    const checkICOBuyLimit = async (userAddress: string) => {
        try {
            if (!activeAccount) return null;

            const ICOContractInst = await icoContractInstance(activeAccount);
            const raw = await ICOContractInst.getUserBuyLimit(userAddress);

            const formattedData = {
                maxLimitUSD: Number(formatUnits(raw.maxLimitUSD, 18)),
                maxLimitHorse: Number(raw.maxLimitHorse),
                purchasedUSD: Number(formatUnits(raw.purchasedUSD, 18)),
                availableUSD: Number(formatUnits(raw.availableUSD, 18)),
                availHorse: Number(formatUnits(raw.availHorse, 18)),
            };

            console.log('Formatted Buy Limit:', formattedData);
            return formattedData;

        } catch (error) {
            console.error('something went wrong in the checkICO buy', error);
            return null;
        }
    };

    // Fetch ICO Phase and Price
    const fetchICOPhaseAndPrice = async () => {
        try {
            if (!activeAccount) return;
            
            setIsLoadingPrice(true);
            const ICOContractInst = await icoContractInstance(activeAccount);
            
            // Get current ICO phase
            const phase = await ICOContractInst.IcoPhase();
            const phaseNumber = Number(phase);
            setIcoPhase(phaseNumber);
            console.log('Current ICO Phase:', phaseNumber);
            
            // Get price details for current phase
            const priceDetails = await ICOContractInst.icoPriceDetails(phaseNumber);
            
            // price is in wei, convert to regular number
            // Assuming price is stored as USDT per token in wei (18 decimals)
            const priceInUSDT = Number(formatUnits(priceDetails.price, 18));
            setPricePerToken(priceInUSDT*2);
            
            console.log('Price Details:', {
                tokenAmt: priceDetails.tokenAmt.toString(),
                tokenSold: priceDetails.tokenSold.toString(),
                price: priceInUSDT,
            });
            
            setIsLoadingPrice(false);
        } catch (error) {
            console.error('Error fetching ICO phase and price:', error);
            setIsLoadingPrice(false);
        }
    };

    const handleBuyICOInSmartContract = async (
        amount: number,
        userAddress: string
    ) => {
        try {
            if (!activeAccount) return;

            const ICOContractInst = await icoContractInstance(activeAccount);

            // Convert USD amount to wei (18 decimals)
            const amountInWei = parseUnits(amount.toString(), 18);

            toast.loading('Transaction pending...', { id: 'buy-ico' });

            const tx = await ICOContractInst.buyHorseIco(
                amountInWei,
                userAddress
            );

            // ⏳ wait for blockchain confirmation
            await tx.wait();

            toast.success('Buy ICO successfully 🎉', { id: 'buy-ico' });

        } catch (error: any) {
            console.error('Error buying tokens:', error);

            // User rejected transaction
            if (error?.code === 'ACTION_REJECTED') {
                toast.error('Transaction cancelled by user', { id: 'buy-ico' });
                return;
            }

            // Smart contract revert message
            const revertReason =
                error?.reason || error?.shortMessage || 'Transaction failed';

            toast.error(revertReason, { id: 'buy-ico' });
        }
    };

    // Fetch ICO phase and price when dialog opens
    useEffect(() => {
        if (buyDialogOpen && activeAccount) {
            fetchICOPhaseAndPrice();
        }
    }, [buyDialogOpen, activeAccount]);

    // Fetch buy limit when dialog opens or buy mode changes
    useEffect(() => {
        const fetchBuyLimit = async () => {
            if (!buyDialogOpen || !activeAccount) return;
            
            setIsLoadingLimit(true);
            
            // Determine target address based on mode
            let targetAddress = "";
            
            if (buyMode === "self") {
                // For self mode, always use activeAccount address
                targetAddress = activeAccount.address;
            } else if (buyMode === "others" && recipientAddress) {
                // For others mode, only fetch if recipient address is provided
                targetAddress = recipientAddress;
            }
            
            // Fetch buy limit if we have a valid target address
            if (targetAddress) {
                const limitData = await checkICOBuyLimit(targetAddress);
                setBuyLimitData(limitData);
            } else {
                // Clear buy limit data if no valid address
                setBuyLimitData(null);
            }
            
            setIsLoadingLimit(false);
        };

        fetchBuyLimit();
    }, [buyDialogOpen, buyMode, recipientAddress, activeAccount]);

    // Handle input change - allow any input while typing
    const handleUsdtAmountChange = (value: string) => {
        // Allow empty string or valid numbers (including decimals)
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setUsdtAmount(value);
        }
    };

    // Get max allowed amount
    const maxAllowed = buyLimitData 
        ? Math.min(maxUSDT, Math.floor(buyLimitData.availableUSD)) 
        : maxUSDT;

    // Calculate if user can afford the selected amount
    const canAffordTokens = buyLimitData 
        ? usdtAmountNumber <= buyLimitData.availableUSD && tokenAmount <= buyLimitData.availHorse
        : true;

    const exceedsLimit = buyLimitData && (usdtAmountNumber > buyLimitData.availableUSD || tokenAmount > buyLimitData.availHorse);
    const belowMinimum = usdtAmountNumber > 0 && usdtAmountNumber < minUSDT;
    const isValidAmount = usdtAmountNumber >= minUSDT && usdtAmountNumber <= maxAllowed && !exceedsLimit;

    const handleBuyConfirm = async () => {
        console.log("Buying tokens:", {
            mode: buyMode,
            usdtAmount: usdtAmountNumber,
            tokenAmount: tokenAmount,
            recipient: buyMode === "others" ? recipientAddress : "self",
            phase: icoPhase,
            pricePerToken: pricePerToken,
        })
        
        const targetAddress = buyMode === "self" 
            ? activeAccount?.address 
            : recipientAddress;
            
        if (targetAddress) {
            await handleBuyICOInSmartContract(usdtAmountNumber, targetAddress);
        }
        
        setBuyDialogOpen(false)
        // Reset state
        setUsdtAmount("10")
        setBuyMode("self")
        setRecipientAddress("")
        setBuyLimitData(null)
        setIcoPhase(null)
        setPricePerToken(null)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buy ICO Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-primary/30 hover:border-primary/50 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">
                                Phase {icoPhase ?? 4} Active
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Buy ICO Tokens</h3>
                        <p className="text-sm text-muted-foreground">
                            Get HORSE tokens at ${pricePerToken?.toFixed(4) ?? '0.0018'} before price increases
                        </p>
                    </div>
                    <Rocket className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                </div>

                <AlertDialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold h-12 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
                            <Rocket className="w-5 h-5 mr-2" />
                            Buy Now
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                                <Rocket className="w-5 h-5 text-primary" />
                                Buy HORSE Tokens
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                                {isLoadingPrice ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading current price...
                                    </span>
                                ) : (
                                    <>Purchase tokens at Phase {icoPhase} price: ${pricePerToken?.toFixed(6)} per token</>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Buy Mode Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-foreground">Who are you buying for?</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant={buyMode === "self" ? "default" : "outline"}
                                        className={`h-16 flex flex-col items-center gap-1 ${buyMode === "self"
                                                ? "bg-primary text-primary-foreground"
                                                : "border-border hover:bg-primary/10 hover:border-primary"
                                            }`}
                                        onClick={() => setBuyMode("self")}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="text-sm">Buy for Me</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={buyMode === "others" ? "default" : "outline"}
                                        className={`h-16 flex flex-col items-center gap-1 ${buyMode === "others"
                                                ? "bg-primary text-primary-foreground"
                                                : "border-border hover:bg-primary/10 hover:border-primary"
                                            }`}
                                        onClick={() => setBuyMode("others")}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="text-sm">Buy for Others</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Recipient Address (only for others) */}
                            {buyMode === "others" && (
                                <div className="space-y-2">
                                    <Label htmlFor="recipient" className="text-sm font-medium text-foreground">
                                        Recipient Wallet Address
                                    </Label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="recipient"
                                            placeholder="0x..."
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            className="pl-10 bg-background border-border"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Loading state for buy limit */}
                            {isLoadingLimit && (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading buy limits...
                                </div>
                            )}

                            {/* Buy Limit Info */}
                            {buyLimitData && !isLoadingLimit && (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Available HORSE</span>
                                        <span className="font-medium text-foreground">{buyLimitData.availHorse.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Available USD</span>
                                        <span className="font-medium text-foreground">${buyLimitData.availableUSD.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Already Purchased</span>
                                        <span className="font-medium text-foreground">${buyLimitData.purchasedUSD.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Message when waiting for recipient address */}
                            {buyMode === "others" && !recipientAddress && !isLoadingLimit && (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground text-center">
                                    Enter recipient address to view their buy limits
                                </div>
                            )}

                            {/* USDT Amount Input */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="usdtAmount" className="text-sm font-medium text-foreground">
                                        USDT Amount
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        Min: ${minUSDT} | Max: ${maxAllowed.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="usdtAmount"
                                        type="text"
                                        inputMode="decimal"
                                        value={usdtAmount}
                                        onChange={(e) => handleUsdtAmountChange(e.target.value)}
                                        disabled={isLoadingPrice || isLoadingLimit || (buyMode === "others" && !recipientAddress)}
                                        className="pl-10 bg-background border-border text-lg font-semibold"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Minimum purchase amount is $10 USDT
                                </p>
                                
                                {/* Show calculated token amount */}
                                {pricePerToken && usdtAmountNumber >= minUSDT && (
                                    <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                                        <span className="text-sm text-muted-foreground">You will receive: </span>
                                        <span className="text-lg font-bold text-primary">
                                            {tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} HORSE
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Warning if below minimum */}
                            {belowMinimum && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Minimum purchase amount is ${minUSDT} USDT
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Warning if exceeds limit */}
                            {exceedsLimit && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Amount exceeds your available limit. Maximum available: ${buyLimitData.availableUSD.toFixed(2)} ({buyLimitData.availHorse.toLocaleString()} HORSE)
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Cost Summary */}
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">USDT Amount</span>
                                    <span className="text-foreground font-semibold">${usdtAmountNumber.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price per Token</span>
                                    <span className="text-foreground">
                                        {isLoadingPrice ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            `$${pricePerToken?.toFixed(6) ?? '0.000000'}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ICO Phase</span>
                                    <span className="text-foreground">Phase {icoPhase ?? '-'}</span>
                                </div>
                                <div className="border-t border-primary/20 pt-2 mt-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-foreground">You will receive</span>
                                        <span className="text-primary">
                                            {tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} HORSE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleBuyConfirm}
                                disabled={
                                    (buyMode === "others" && !recipientAddress) ||
                                    !isValidAmount ||
                                    isLoadingLimit ||
                                    isLoadingPrice ||
                                    !pricePerToken ||
                                    !buyLimitData ||
                                    usdtAmount === ""
                                }
                                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                {isLoadingLimit || isLoadingPrice ? "Loading..." : "Confirm Purchase"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>

            {/* Claim Airdrop Card - unchanged */}
            <Card className="p-6 bg-gradient-to-br from-secondary/20 via-card to-accent/20 border-secondary/30 hover:border-secondary/50 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-secondary" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                                55 Remaining
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Claim Airdrop Gift</h3>
                        <p className="text-sm text-muted-foreground">Get 1000 free HORSE tokens for early supporters</p>
                    </div>
                    <Sparkles className="w-8 h-8 text-secondary/50 group-hover:text-secondary transition-colors" />
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-foreground font-semibold h-12 group-hover:shadow-lg group-hover:shadow-secondary/25 transition-all">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Claim Gift
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Card>
        </div>
    )
}