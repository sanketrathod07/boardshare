'use client';

import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import OrgSidebar from "./_components/org-sidebar";

const DashboardLayout = ({ children }) => {

    const [isOpen, setIsOpen] = useState(true);

    const handleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
        <main className="h-full w-full flex">
            <OrgSidebar handleSidebar={handleSidebar} isOpen={isOpen}/>
            <div className=" h-full w-full relative">
                <div className="h-full flex-1">
                    <Navbar handleSidebar={handleSidebar} />
                    {children}
                </div>
            </div>
        </main>
    )
}

export default DashboardLayout;