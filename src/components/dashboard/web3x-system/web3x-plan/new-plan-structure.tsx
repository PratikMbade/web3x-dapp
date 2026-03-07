"use client"

import Image from "next/image"
import type { PlanStructureProps } from "@/types/plan"
import Link from "next/link"

export default function PlanStructure({ planName, globalCount, highestPlanetBought }: PlanStructureProps) {



    return (
        <div
            key={highestPlanetBought}
            className="w-full relative bg-gradient-to-r from-slate-900 to-purple-600/10"
            id={planName}
        >
            <svg
                width="100%"
                viewBox="0 90 380 228"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <rect
                    width="776"
                    height="776"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 -188.021)"
                    fill="#1A1A1A"
                />
                <circle
                    r="97"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 199.953)"
                    stroke="#4D4D4D"
                    strokeLinejoin="round"
                />
                <circle
                    r="155.2"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 199.952)"
                    stroke="#333333"
                    strokeLinejoin="round"
                />
                <circle
                    r="213.4"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 199.952)"
                    stroke="#333333"
                    strokeLinejoin="round"
                />
                <circle
                    r="271.6"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 199.951)"
                    stroke="#333333"
                    strokeLinejoin="round"
                />
                <circle
                    r="329.8"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 187.081 199.952)"
                    stroke="#333333"
                    strokeLinejoin="round"
                />
                <path
                    d="M271.087 151.456C285.684 159.883 296.226 170.36 301.673 181.855C307.12 193.35 307.285 205.466 302.151 217.009C297.017 228.552 286.762 239.124 272.396 247.682C258.03 256.24 240.049 262.489 220.226 265.814L204.488 234.543C214.9 232.797 224.343 229.515 231.888 225.02C239.433 220.525 244.819 214.973 247.516 208.911C250.212 202.848 250.125 196.485 247.264 190.448C244.403 184.411 238.867 178.908 231.201 174.482L271.087 151.456Z"
                    fill="white"
                    fillOpacity="0.1"
                />
                <path
                    d="M217.829 266.201C197.889 269.285 176.901 269.317 156.933 266.293C136.966 263.268 118.708 257.293 103.959 248.955C89.2095 240.617 78.4784 230.204 72.823 218.742C67.1675 207.281 66.7829 195.166 71.707 183.593L126.486 191.361C123.9 197.439 124.102 203.801 127.072 209.821C130.043 215.84 135.679 221.309 143.425 225.689C151.171 230.068 160.76 233.206 171.247 234.794C181.734 236.383 192.757 236.366 203.23 234.746L217.829 266.201Z"
                    fill="white"
                    fillOpacity="0.1"
                />
                <path
                    d="M72.3258 182.202C77.6687 170.69 88.1151 160.181 102.636 151.71C117.156 143.24 135.249 137.099 155.132 133.894C175.015 130.689 196.001 130.531 216.023 133.434C236.044 136.337 254.41 142.202 269.309 150.451L230.267 173.954C222.442 169.622 212.796 166.542 202.281 165.017C191.766 163.492 180.744 163.576 170.301 165.259C159.859 166.942 150.356 170.167 142.73 174.616C135.104 179.065 129.617 184.584 126.811 190.63L72.3258 182.202Z"
                    fill="white"
                    fillOpacity="0.1"
                />
                <circle
                    r="30.1"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 214.383 266.637)"
                    fill="#1F1F1F"
                    stroke="#1A1A1A"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <circle
                    r="30.1"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 71.5718 184.192)"
                    fill="#1F1F1F"
                    stroke="#1A1A1A"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <circle
                    r="30.1"
                    transform="matrix(0.866044 0.499967 -0.866044 0.499967 271.087 151.457)"
                    fill="#1F1F1F"
                    stroke="#1A1A1A"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>



            {/* Center Planet - Always Purple */}

      <Link href={'/dashboard/web3x-system/matrix-tree'}>
             <div className="absolute top-[26%] md:top-[29%] right-[40%] md:right-[41%]">
                <Image
                    src="/Orange.png"
                    alt="Center Planet"
                    loading="lazy"
                    height={70}
                    width={70}
                    className=""
                />
            </div>
      </Link>


            {/* Top Right Planet */}
            <>
                {globalCount >= 1 ? (
                    <div className="absolute top-[11%] right-[20%]">

                        <Image
                            src="/Yellow.png"
                            alt="Active Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>
                ) : (
                    <div className="absolute top-[11%] right-[20%]">
                        <Image
                            src="/Silver.png"
                            alt="Inactive Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>
                )}
            </>



            {/* Left Planet */}
            <>
                {globalCount >= 2 ? (
                    <div className="absolute top-[25%] left-[10%]">

                        <Image
                            src="/Yellow.png"
                            alt="Active Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>
                ) : (
                    <div className="absolute top-[25%] left-[10%]">
                        <Image
                            src="/Silver.png"
                            alt="Inactive Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>
                )}
            </>



            {/* Bottom Planet */}
            <>
                {globalCount >= 3 ? (
                    <div className="absolute bottom-[10%] right-[35%]">

                        <Image
                            src="/Yellow.png"
                            alt="Active Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>

                ) : (

                    <div className="absolute bottom-[10%] right-[35%]">
                        <Image
                            src="/Silver.png"
                            alt="Inactive Planet"
                            loading="lazy"
                            height={60}
                            width={60}
                        />
                    </div>

                )}
            </>



            <div className="z-10 absolute top-[23%] right-[44%] flex flex-col items-center text-xl font-semibold"></div>
        </div>
    )
}
