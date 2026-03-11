/* eslint-disable @typescript-eslint/no-unused-vars */


import { getDirectTeamMembers } from '@/actions/user';

import TeamTable from '@/components/dashboard/team/direct-team-table';
import { getSession } from '@/lib/get-session';

import { redirect } from 'next/navigation';




export default async function DirectTeamPage() {

  const session = await getSession()

  if(!session || !session.user) {
    redirect('/login');
  }

    const data =  await getDirectTeamMembers(session.user.wallet_address!);

  return (
    <div className="container max-w-90 mx-auto lg:max-w-6xl py-8">
      <div className="mb-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Direct Team Management</h1>
        <p className="text-muted-foreground mt-2 text-center">
          Manage your team structure and track performance metrics
        </p>
      </div>

      <TeamTable data={data} />
    </div>
  );
}
