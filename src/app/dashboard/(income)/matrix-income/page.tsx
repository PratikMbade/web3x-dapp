
import {  getMatrixIncomeTableForAdmin } from '@/actions/income';

import MatrixIncomeTable from '@/components/dashboard/income/matrix-income-table';
import { getSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';




type Props = {
   params: Promise<{ slug: string }>
}





export default async function IncomeDynamicPage(props:Props){

    const slug = 'matrix-income'
  const session = await getSession()


    if(!session || !session.user) {
        redirect('/login');
    }

    if(slug === 'matrix-income'){
       const data = await getMatrixIncomeTableForAdmin(session.user.wallet_address!.toLowerCase() )


        return (
             <div className="container max-w-90 mx-auto lg:max-w-6xl py-8">
                <div className="mb-8 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold">Matrix Income </h1>
                    <p className="text-muted-foreground mt-2 text-center">
                        Manage your Matrix income
                    </p>
                </div>
                <MatrixIncomeTable data={data}/>
            </div>

        )
    }


}