import React from 'react'
import './sidebar/style.css';
import Link from 'next/link';

import WorkspacesIcon from '@mui/icons-material/Workspaces';
import FavoriteIcon from '@mui/icons-material/Favorite';

const SidebarBtn = () => {

    return (
        <>
            <Link href="/" className='SidebarMainBtnDiv'>
                <button >
                    <WorkspacesIcon />Team Board
                </button>
            </Link>
            <Link href={{
                pathname: "/",
                query: { favorites: true }
            }} className='SidebarMainBtnDiv'>
                <button >
                    <FavoriteIcon />Favorite Boards
                </button>
            </Link>


        </>

    )
}

export default SidebarBtn