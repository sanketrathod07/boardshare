'use client';

import { useOrganization } from "@clerk/nextjs";

import EmptyOrg from "./_components/empty-org";
import BoardList from "./_components/board_list";

const DashboardPageProps = {
    searchParams: {
        search: '',
        favorites: '',
    }
};


const DashboardPage = ({ searchParams }) => {

    const { organization } = useOrganization();
    return (
        <div className='flex-1 h-[calc(100%-80px)] p-6'>
            {!organization ? <EmptyOrg />
                :
                <BoardList
                    orgId={organization.id}
                    query={searchParams}
                />
            }
        </div>
    );
}

export default DashboardPage;