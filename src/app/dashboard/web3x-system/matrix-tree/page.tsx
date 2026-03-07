
import { EthereumTree } from "@/components/dashboard/web3x-system/matrix-tree/matrix-tree"
import { getSession } from "@/lib/get-session"

export default async function MatrixPage() {
  const data = await getSession()


  if(!data?.user.wallet_address){

    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You must be logged in to view this page.</p>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </main>
    )

  }

  return (
    <main className="min-h-screen">
      <EthereumTree walletAddress={data?.user.wallet_address} />
    </main>
  )
}
