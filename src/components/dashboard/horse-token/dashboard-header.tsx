import { FlameIcon } from "lucide-react";

export default function DashboardHeader() {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold text-balance">Horse Token</h1>
                <div className="text-right flex items-center gap-x-2 animate-bounce">
                    <p className="">ICO Buy Live </p>
                    <FlameIcon className="text-orange-500"/> 
                    {/* <p className="text-lg font-semibold ext-primary">$0.00542</p> */}
                </div>
            </div>
            <p className="hidden md:block text-muted-foreground">Decentralized equestrian token ecosystem with community-driven ICO</p>
        </div>
    )
}
