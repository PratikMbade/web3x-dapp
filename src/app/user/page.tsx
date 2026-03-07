// app/user/page.tsx or wherever you need it
import { getServerSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function UserPage() {
    const session = await getServerSession();

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">No Session</h1>
                    <p className="text-gray-600">Please connect your wallet to continue</p>
                </div>
            </div>
        );
    }

    const user = session.user;

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">Wallet Address:</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {user.wallet_address}
                    </p>

                    <p className="text-sm text-gray-600 mt-4">Registration Status:</p>
                    <p className={`font-semibold ${user.isRegistered ? 'text-green-600' : 'text-yellow-600'}`}>
                        {user.isRegistered ? 'Registered' : 'Not Registered'}
                    </p>

                    {user.metaunityId && (
                        <>
                            <p className="text-sm text-gray-600 mt-4">Metaunity ID:</p>
                            <p className="font-medium">{user.metaunityId}</p>
                        </>
                    )}

                    {user.regId && (
                        <>
                            <p className="text-sm text-gray-600 mt-4">Registration ID:</p>
                            <p className="font-medium">{user.regId}</p>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-sm text-gray-600">Direct Team:</p>
                            <p className="font-bold text-lg">{user.directTeam}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Team:</p>
                            <p className="font-bold text-lg">{user.totalTema}</p>
                        </div>
                    </div>

                    {user.sponsor_address && (
                        <>
                            <p className="text-sm text-gray-600 mt-4">Sponsor Address:</p>
                            <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                {user.sponsor_address}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}