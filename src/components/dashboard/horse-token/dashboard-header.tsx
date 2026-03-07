export default function DashboardHeader() {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold text-balance">Horse Token</h1>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Live Dashboard</p>
                    <p className="text-lg font-semibold text-primary">$0.00542</p>
                </div>
            </div>
            <p className="text-muted-foreground">Decentralized equestrian token ecosystem with community-driven ICO</p>
        </div>
    )
}
