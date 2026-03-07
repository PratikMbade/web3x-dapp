"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, User, Package, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TreeNode {
    id: string
    chainId: number
    wallet_address: string
    upline_address: string
    amount: string
    position: string
    userId: string
    packageNumber?: number
    label?: string
    children?: TreeNode[]
}

interface ApiResponse {
    matrixTrees: TreeNode[]
    downlineTrees: TreeNode[]
    metadata: {
        wallet_address: string
        chainId: number
        packageNumber: number
        matrixCount: number
        downlineCount: number
    }
}

interface NodeCardProps {
    node: TreeNode
    isParent?: boolean
}

const NodeCard: React.FC<NodeCardProps> = ({ node, isParent = false }) => {
    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="bg-transparent border-none">
                <CardContent
                    className={`${isParent ? "" : ""} flex flex-col items-center gap-2  ${isParent ? "min-w-[100px] min-h-[80px]" : "min-w-[100px] min-h-[50px]"}`}
                >
                    <div
                        className={`
            ${isParent ? "w-20 h-20 bg-gradient-to-br from-amber-500  to-red-600" : "w-14 h-14 bg-gradient-to-br from-indigo-600  to-violet-400"} 
             flex items-center justify-center 
            shadow-inner border border-slate-600/30
            group-hover:from-blue-600/20 group-hover:via-slate-700 group-hover:to-slate-800
            transition-all duration-300
            rounded-full
          `}
                    >
                        <User
                            className={`${isParent ? "h-6 w-6" : "h-4 w-4"} text-slate-300 group-hover:text-blue-300 transition-colors duration-300`}
                        />
                    </div>

                    {!isParent && (
                        <div
                            className={`
            bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent 
            ${isParent ? "text-sm" : "text-xs"} font-semibold tracking-wide
            group-hover:from-blue-300 group-hover:via-cyan-300 group-hover:to-blue-400
            transition-all duration-300
          `}
                        >
                            <span className="text-slate-300 group-hover:text-blue-300 transition-colors duration-300">
                                {formatAddress(node.wallet_address)}
                            </span>
                        </div>
                    )}

                    {isParent && (
                        <div className="text-slate-400 text-xs text-center font-medium tracking-tight leading-tight mt-1">
                            {formatAddress(node.wallet_address)}
                            <div className="text-[10px] mt-1 text-slate-500">
                                {node.position}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

interface EthereumTreeProps {
    walletAddress: string // The main wallet address to fetch data for
}

export const EthereumTree: React.FC<EthereumTreeProps> = ({ walletAddress }) => {
    const [currentTreeIndex, setCurrentTreeIndex] = useState(0)
    const [selectedPackage, setSelectedPackage] = useState("1")
    const [selectedChain, setSelectedChain] = useState("1")
    const [apiData, setApiData] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch data from API
    const fetchMatrixData = async (wallet: string, chainId: string, packageNumber: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/matrix-tree?wallet_address=${encodeURIComponent(wallet)}&chainId=${chainId}&packageNumber=${packageNumber}`
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: ApiResponse = await response.json()
            console.log('Fetched matrix data:', data);
            setApiData(data)
        } catch (err) {
            console.error('Error fetching matrix data:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
            setApiData(null)
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when wallet, chain, or package changes
    useEffect(() => {
        if (walletAddress) {
            fetchMatrixData(walletAddress, selectedChain, selectedPackage)
        }
    }, [walletAddress, selectedChain, selectedPackage])

    const treeData = useMemo(() => {
        if (!apiData) return []

        const { matrixTrees, downlineTrees } = apiData

        // Group downlines by upline
        const downlinesByUpline: Record<string, TreeNode[]> = {}
        downlineTrees.forEach(downline => {
            if (!downlinesByUpline[downline.upline_address]) {
                downlinesByUpline[downline.upline_address] = []
            }
            downlinesByUpline[downline.upline_address].push(downline)
        })

        // Sort matrix trees by position (left, middle, right)
        const positionOrder = { 'left': 0, 'middle': 1, 'right': 2 }
        const sortedMatrixTrees = [...matrixTrees].sort((a, b) =>
            (positionOrder[a.position as keyof typeof positionOrder] ?? 99)
            - (positionOrder[b.position as keyof typeof positionOrder] ?? 99)
        )

        // Build tree structure
        return sortedMatrixTrees.map(partner => ({
            ...partner,
            label: `${partner.position.charAt(0).toUpperCase() + partner.position.slice(1)} Partner`,
            children: downlinesByUpline[partner.wallet_address] || []
        }))
    }, [apiData])

    const totalTrees = 12 // Total packages

    const nextTree = () => {
        if (currentTreeIndex < totalTrees - 1) {
            setCurrentTreeIndex(currentTreeIndex + 1)
            setSelectedPackage(String(currentTreeIndex + 2))
        }
    }

    const prevTree = () => {
        if (currentTreeIndex > 0) {
            setCurrentTreeIndex(currentTreeIndex - 1)
            setSelectedPackage(String(currentTreeIndex))
        }
    }

    return (
        <div className="w-90 md:w-full min-h-screen  text-white p-4 mx-auto">

            <Button
                variant="secondary"
                size="sm"
                onClick={() => window.history.back()}
                className="text-amber-400 hover:text-amber-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200 -translate-x-5"
            >
                <ChevronLeft className="h-4 w-4" />
                Back
            </Button>


            <div className="flex flex-col md:flex-row items-center justify-between mb-6 w-90 md:w-full  ">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevTree}
                        disabled={currentTreeIndex === 0 || loading}
                        className="text-amber-400 hover:text-amber-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <h1 className="text-lg font-semibold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent tracking-tight">
                        Tree Navigation
                    </h1>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTree}
                        disabled={currentTreeIndex === totalTrees - 1 || loading}
                        className="text-amber-400 hover:text-amber-300 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-row items-center gap-4 mt-3 md:mt-0">
                    {/* Chain Selector */}
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30 w-full md:w-fit">
                        <div className="text-xs text-slate-300 mr-2">Recycle</div>
                        <Select
                            value={selectedChain}
                            onValueChange={setSelectedChain}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-[105px] h-7 bg-transparent border-0 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Recycle 1</SelectItem>
                                <SelectItem value="2">Recycle 2</SelectItem>
                                <SelectItem value="3">Recycle 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Package Selector */}
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30 w-full md:w-fit">
                        <Package className="w-4 h-4 text-amber-400" />
                        <Select
                            value={selectedPackage}
                            onValueChange={(value) => {
                                setSelectedPackage(value)
                                setCurrentTreeIndex(parseInt(value, 10) - 1)
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-[105px] h-7 bg-transparent border-0 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: totalTrees }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                        Package {i + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                </div>


                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30 mt-3 md:mt-0">
                    <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm shadow-amber-400/50"></div>
                    <span className="text-xs text-slate-300 font-medium">
                        Package {selectedPackage} of {totalTrees}
                    </span>
                </div>
            </div>

            <div className="border-2 rounded-xl border-slate-700/30 bg-gradient-to-tl from-amber-900/20 via-yellow-900/20 to-transparent p-6">
                {/* Root Node - Me */}
                <div className="flex items-center justify-center mt-10">
                    <div
                        className={`
             w-20 h-20
            bg-gradient-to-br from-yellow-500  to-amber-600
             flex flex-col items-center justify-center 
            shadow-inner border border-slate-600/30
            group-hover:from-blue-600/20 group-hover:via-slate-700 group-hover:to-slate-800
            transition-all duration-300
            rounded-full
          `}
                    >
                        <User
                            className={` h-6 w-6 text-slate-300 group-hover:text-blue-300 transition-colors duration-300`}
                        />
                    </div>
                </div>
                <p className="text-center text-sm text-slate-300">
                    <span>Me</span>
                    <div className="text-[10px] text-slate-500 mt-1">
                        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '—'}
                    </div>
                </p>

                {error && (
                    <div className="text-center py-12">
                        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-400">
                            <p className="font-medium">Error loading data</p>
                            <p className="text-sm text-red-300 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-400" />
                        <p className="text-slate-400 mt-2">Loading matrix tree data...</p>
                    </div>
                ) : !error && (
                    /* Tree Structure */
                    <div className="max-w-5xl mx-auto mt-12 mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Render real partners */}
                            {treeData.map((partner, partnerIndex) => (
                                <motion.div
                                    key={partner.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: partnerIndex * 0.15, ease: "easeOut" }}
                                    className="flex flex-col items-center gap-6"
                                >
                                    <NodeCard node={partner} isParent />

                                    <div className="grid grid-cols-3 gap-10">
                                        {partner.children?.slice(0, 3).map((child, childIndex) => (
                                            <motion.div
                                                key={child.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: partnerIndex * 0.15 + childIndex * 0.08 + 0.3,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                <NodeCard node={child} />
                                            </motion.div>
                                        ))}

                                        {/* Fill empty child slots */}
                                        {Array.from({ length: Math.max(0, 3 - (partner.children?.length || 0)) }).map((_, index) => (
                                            <motion.div
                                                key={`empty-child-${partner.id}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: partnerIndex * 0.15 + index * 0.08 + 0.3,
                                                    ease: "easeOut",
                                                }}
                                                className="flex flex-col items-center mt-6"
                                            >
                                                <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-slate-100" />
                                                </div>
                                                <span className="text-[10px] text-slate-100 mt-2">Empty</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Render empty parent slots so there are always 3 columns */}
                            {Array.from({ length: Math.max(0, 3 - treeData.length) }).map((_, emptyIndex) => {
                                const animDelay = (treeData.length + emptyIndex) * 0.15
                                return (
                                    <motion.div
                                        key={`empty-parent-${emptyIndex}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: animDelay, ease: "easeOut" }}
                                        className="flex flex-col items-center gap-6"
                                    >
                                        {/* Empty parent card */}
                                        <div className="w-20 h-20 bg-transparent flex items-center justify-center rounded-full border border-slate-700/30 mt-6">
                                            <div className="w-20 h-20 rounded-full border border-dashed border-slate-600/40 flex items-center justify-center bg-slate-800/20">
                                                <User className="h-6 w-6 text-slate-400" />
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">Empty</span>

                                        {/* children empty slots under the empty parent (3 placeholders) */}
                                        <div className="grid grid-cols-3 gap-10 mt-7">
                                            {Array.from({ length: 3 }).map((_, ci) => (
                                                <motion.div
                                                    key={`empty-parent-child-${emptyIndex}-${ci}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{
                                                        duration: 0.4,
                                                        delay: animDelay + ci * 0.08 + 0.3,
                                                        ease: "easeOut",
                                                    }}
                                                    className="flex flex-col items-center mt-6"
                                                >
                                                    <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-slate-100" />
                                                    </div>
                                                    <span className="text-[10px] text-slate-100 mt-2">Empty</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>

                        {/* Show message if no data */}
                        {!loading && treeData.length === 0 && !error && (
                            <div className="text-center py-12 text-slate-500">
                                No data available for Package {selectedPackage} on Chain {selectedChain}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}