import React from 'react'
import SearchIcon from '@mui/icons-material/Search';

const Input = () => {
    return (
        <div className="site-search ">
            <div className='NavbarInputSearchIcon'>
                <SearchIcon color='#747474'/>
            </div>
            <input type="search" placeholder="Search" className="search-input" aria-label="Search" />
        </div>
    )
}

export default Input
