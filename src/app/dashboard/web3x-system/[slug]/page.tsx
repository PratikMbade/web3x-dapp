export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getUserPackage } from '@/actions/user';
import MainStructure from '@/components/dashboard/web3x-system/web3x-plan/main-structure';
import { getSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';




type Props = {
  params: Promise<{ slug: string }>;
};


export default async function PlanPage(props:Props){
  const session = await getSession()

  if(!session){
    return redirect("/")
  }

    const slug = (await props.params).slug;

    const packageData = await getUserPackage(session?.user.wallet_address)




    if(slug === 'MN-packages'){




        return (
            <div>
                <MainStructure package={packageData}/>
            </div>
        )
    }


    return (
        <div>

        </div>
    )
}