"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, Check, Search, Clock1, Package, Filter, X, DollarSign, GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export type MatrixIncomeTableType = {
    fromAddress: string
    packageNumber: number
    chainNumber: number
    amount: number
    createdAt: string
}

function AddressCell({ address }: { address: string }) {
    const [copied, setCopied] = useState(false)

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    return (
        <TooltipProvider>
            <div>
                <div className="flex items-center gap-2 group">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        <span className="hidden sm:inline">{address}</span>
                        <span className="sm:hidden">{truncateAddress(address)}</span>
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(address)}
                    >
                        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    )
}

function EmptyState({ isSearching }: { isSearching: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                {isSearching ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                    <Users className="h-8 w-8 text-muted-foreground" />
                )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{isSearching ? "No Results Found" : "No Team Present"}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
                {isSearching
                    ? "No records match your search criteria. Try adjusting your filters."
                    : "There are currently no team members to display. Start building your team to see data here."}
            </p>
        </div>
    )
}

type Props = {
    data: MatrixIncomeTableType[] | []
}

export default function MatrixIncomeTable(props: Props) {
    const data = props.data
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPackage, setSelectedPackage] = useState<string>("all")
    const [selectedChain, setSelectedChain] = useState<string>("all")

    // Filter data based on search term, package, and chain
    const filteredData = data.filter((member) => {
        const matchesSearch = member.fromAddress.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPackage = selectedPackage === "all" || member.packageNumber.toString() === selectedPackage
        const matchesChain = selectedChain === "all" || member.chainNumber.toString() === selectedChain

        return matchesSearch && matchesPackage && matchesChain
    })

    if (!data || data.length === 0) {
        return (
            <Card className="w-full max-w-90 lg:max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Matrix Income Overview
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    <EmptyState isSearching={false} />
                </CardContent>
            </Card>
        )
    }

    // Calculate pagination based on filtered data
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = filteredData.slice(startIndex, endIndex)

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1) // Reset to first page when changing items per page
    }

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset to first page when searching
    }

    // Handle package filter change
    const handlePackageChange = (value: string) => {
        setSelectedPackage(value)
        setCurrentPage(1) // Reset to first page when filtering
    }

    // Handle chain filter change
    const handleChainChange = (value: string) => {
        setSelectedChain(value)
        setCurrentPage(1) // Reset to first page when filtering
    }

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm("")
        setSelectedPackage("all")
        setSelectedChain("all")
        setCurrentPage(1)
    }

    // Check if any filters are active
    const hasActiveFilters = Boolean(searchTerm) || selectedPackage !== "all" || selectedChain !== "all"

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("ellipsis")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("ellipsis")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("ellipsis")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("ellipsis")
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <Card className="w-full max-w-90 lg:max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Matrix Income Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by wallet address..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Package Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedPackage} onValueChange={handlePackageChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Package" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Packages</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((packageNum) => (
                                    <SelectItem key={packageNum} value={packageNum.toString()}>
                                        Package {packageNum}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Chain Filter */}
                    <div className="flex items-center gap-2">
                        <GitFork className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedChain} onValueChange={handleChainChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Chain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Chains</SelectItem>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((chainNum) => (
                                    <SelectItem key={chainNum} value={chainNum.toString()}>
                                        Chain {chainNum}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="flex items-center gap-1 bg-transparent"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {searchTerm && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Search: {searchTerm}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearchChange("")} />
                            </Badge>
                        )}
                        {selectedPackage !== "all" && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Package {selectedPackage}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => handlePackageChange("all")} />
                            </Badge>
                        )}
                        {selectedChain !== "all" && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Chain {selectedChain}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => handleChainChange("all")} />
                            </Badge>
                        )}
                    </div>
                )}

                {/* Show search results info */}
                {hasActiveFilters && (
                    <div className="mb-4 text-sm text-muted-foreground">
                        {filteredData.length === 0
                            ? "No results found"
                            : `Found ${filteredData.length} result${filteredData.length === 1 ? "" : "s"}`}
                    </div>
                )}

                {filteredData.length === 0 ? (
                    <EmptyState isSearching={hasActiveFilters} />
                ) : (
                    <>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Wallet Address</TableHead>
                                            <TableHead className="text-center min-w-[120px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Package className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Package</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center min-w-[120px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <GitFork className="h-4 w-4 rotate-180" />
                                                    <span className="hidden sm:inline">Chain</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center min-w-[120px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Amount</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center min-w-[120px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock1 className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Date</span>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.map((member, index) => (
                                            <TableRow key={index} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <AddressCell address={member.fromAddress} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {member.packageNumber}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {member.chainNumber}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {member.amount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-mono">
                                                        {member.createdAt}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">Rows per page</p>
                                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={itemsPerPage} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[5, 10, 20, 30, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={pageSize.toString()}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} entries
                                </div>
                            </div>
                        </div>

                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <Pagination className="justify-center">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === "ellipsis" ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page as number)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
