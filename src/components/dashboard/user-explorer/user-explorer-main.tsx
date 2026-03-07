"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserProfileDisplay } from "@/components/dashboard/user-explorer/user-profile-display"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UserExplorerMain() {
    const [ethAddress, setEthAddress] = useState("")
    const [searchedAddress, setSearchedAddress] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateEthAddress = (address: string) => {
        // Basic Ethereum address validation (0x followed by 40 hex characters)
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
        return ethAddressRegex.test(address)
    }

    const handleSearch = async () => {
        setError(null)
        
        if (!ethAddress.trim()) {
            setError("Please enter an Ethereum address")
            return
        }
        console.log('validateEthAddress',validateEthAddress(ethAddress));

        if (!validateEthAddress(ethAddress.trim())) {
            setError("Invalid Ethereum address format")
            return
        }

        setIsSearching(true)
        
        try {
            const response = await fetch(`/api/users/${ethAddress.trim()}`)
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch user data")
            }

            const userData = await response.json()
            
            // Verify user exists (you might want to check if userData has the expected fields)
            if (!userData || !userData.ethAddress) {
                setError("User not found")
                setSearchedAddress(null)
            } else {
                setSearchedAddress(ethAddress.trim())
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch user data")
            setSearchedAddress(null)
        } finally {
            setIsSearching(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <DashboardLayout title="User Explorer">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
                    {/* Search Section */}
                    <div className="w-full max-w-3xl mx-auto space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">Search User by Ethereum Address</h2>
                            <p className="text-sm text-muted-foreground">
                                Enter a valid Ethereum address to view user profile and statistics
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={ethAddress}
                                    onChange={(e) => setEthAddress(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button 
                                onClick={handleSearch}
                                disabled={isSearching}
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* User Profile Display */}
                    {searchedAddress && (
                        <UserProfileDisplay ethAddress={searchedAddress} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}