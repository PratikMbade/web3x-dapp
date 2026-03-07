"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowUpRight, Globe, Sparkles } from "lucide-react";

// Type definitions for documents
type SupportedLanguage = "en" | "hi" | "es" | "fr" | "de" | "zh" | "ja" | "ar";

interface DocumentConfig {
    id: string;
    title: string;
    description: string;
    fileName: string;
    category: "token" | "matrix" | "nft";
    icon: React.ReactNode;
    accentGradient: string;
}

interface LocalizedDocument extends DocumentConfig {
    language: SupportedLanguage;
    languageLabel: string;
}

// Language configuration
const languageLabels: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "हिंदी",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    zh: "中文",
    ja: "日本語",
    ar: "العربية",
};

// Document configurations - easily extensible for multiple languages
const baseDocuments: DocumentConfig[] = [
    {
        id: "horse-token",
        title: "Horse Token",
        description:
            "Web3X Ecosystem: Utility-Based Token with Matrix Rewards and Royalty NFTs",
        fileName: "web3x_horse_token_eng",
        category: "token",
        icon: <Sparkles className="w-5 h-5" />,
        accentGradient: "from-orange-500 via-amber-500 to-yellow-500",
    },
    {
        id: "matrix-nft",
        title: "M & N (Matrix & NFT)",
        description:
            "Möbius Loop DAO: 100% distribution and Weekly royalty earnings through NFT integration",
        fileName: "web3x_mn_eng",
        category: "matrix",
        icon: <Globe className="w-5 h-5" />,
        accentGradient: "from-orange-600 via-orange-500 to-amber-400",
    },
    {
        id: "royalty-nft",
        title: "Royalty NFT",
        description:
            "Status-based program offering exclusive bonuses tied to six NFT levels",
        fileName: "web3x_royalty_nft_eng",
        category: "nft",
        icon: <FileText className="w-5 h-5" />,
        accentGradient: "from-amber-500 via-orange-500 to-red-500",
    },
];

// Generate localized documents
const generateLocalizedDocuments = (
    language: SupportedLanguage
): LocalizedDocument[] => {
    const languageSuffix =
        language === "en" ? "__English_" : `__${languageLabels[language]}_`;

    return baseDocuments.map((doc) => ({
        ...doc,
        language,
        languageLabel: languageLabels[language],
        fileName: `${doc.fileName}`,
    }));
};

// Currently available documents (English only for now)
const availableDocuments: LocalizedDocument[] =
    generateLocalizedDocuments("en");

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1,
        },
    },
};

const hoverVariants: Variants = {
    rest: {
        scale: 1,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.25)",
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
        },
    },
};

const arrowVariants: Variants = {
    rest: { x: 0, y: 0, rotate: 0 },
    hover: {
        x: 4,
        y: -4,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 20,
        },
    },
};

const glowVariants: Variants = {
    rest: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
        },
    },
};

interface DocumentCardProps {
    document: LocalizedDocument;
    index: number;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, index }) => {
    const pdfPath = `/${document.fileName}.pdf`;

    return (
        <motion.a
            href={"#"}
            target="_blank"
            rel="noopener noreferrer"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-2xl"
        >
            <motion.div variants={hoverVariants} className="h-full">
                <Card className="relative h-full overflow-hidden border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg dark:shadow-zinc-950/50 rounded-2xl group cursor-pointer transition-colors duration-300">
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-orange-500/20 via-transparent to-orange-500/20 dark:from-orange-500/30 dark:to-orange-500/30 pointer-events-none" />

                

                    {/* Category accent line */}
                    <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${document.accentGradient}`}
                    />

                    <CardHeader className="pb-3 pt-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {/* Icon container */}
                                <div
                                    className={`p-2.5 rounded-xl bg-gradient-to-br ${document.accentGradient} text-white shadow-lg shadow-orange-500/25`}
                                >
                                    {document.icon}
                                </div>

                                {/* Language badge */}
                                <Badge
                                    variant="secondary"
                                    className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/50 font-medium text-xs"
                                >
                                    {document.languageLabel}
                                </Badge>
                            </div>

                            {/* Arrow indicator */}
                            <motion.div
                                variants={arrowVariants}
                                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                            </motion.div>
                        </div>

                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-4 tracking-tight leading-tight">
                            {document.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0 pb-6">
                        <CardDescription className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                            {document.description}
                        </CardDescription>

                        {/* PDF indicator */}
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-medium">PDF Document</span>
                            <span className="text-orange-500 dark:text-orange-400">•</span>
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                                Click to view
                            </span>
                        </div>
                    </CardContent>

                    {/* Decorative corner accent */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
                        <div
                            className={`absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl ${document.accentGradient} opacity-5 dark:opacity-10`}
                            style={{
                                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                            }}
                        />
                    </div>
                </Card>
            </motion.div>
        </motion.a>
    );
};

interface PDFDocumentsGridProps {
    title?: string;
    subtitle?: string;
    filterLanguage?: SupportedLanguage;
}

export const PDFDocumentsGrid: React.FC<PDFDocumentsGridProps> = ({
    title = "Marketing",
    subtitle = "Explore the Web3X ecosystem through our comprehensive guides and whitepapers",
    filterLanguage,
}) => {
    const documents = filterLanguage
        ? availableDocuments.filter((doc) => doc.language === filterLanguage)
        : availableDocuments;

    return (
        <section className="w-full py-12 px-4 sm:px-6 lg:px-8 mt-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-4">
                        <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                            {title}
                        </span>
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                    {documents.map((document, index) => (
                        <DocumentCard key={document.id} document={document} index={index} />
                    ))}
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-10"
                >
                    More languages coming soon • PDFs open in a new tab
                </motion.p>
            </div>
        </section>
    );
};

// Default export
export default PDFDocumentsGrid;