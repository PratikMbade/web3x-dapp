export const dynamic = 'force-dynamic';
export const revalidate = 0;

import MainStructure from '@/components/dashboard/web3x-system/web3x-plan/main-structure';
import { redirect } from 'next/navigation';




type Props = {
  params: Promise<{ slug: string }>;
};

const packageData = [{
    id: '1',
    userId: 'user-1',
    amount: 5,
    chainid: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    packageNumber: 1,
    packageBuyTranxHash: 'txhash-1'
}
]
export default async function PlanPage(props:Props){

    const slug = (await props.params).slug;




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