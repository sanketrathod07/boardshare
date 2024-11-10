import './Sidebar.css';
import SidebarBtn from './SidebarBtn';
import CloseIcon from '@mui/icons-material/Close';
import { OrganizationSwitcher } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { GanttChart } from 'lucide-react';

const OrgSidebar = ({ handleSidebar, isOpen }) => {
    const [sideBarClass, setSideBarClass] = useState('');
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);

    useEffect(() => {
        setSideBarClass(isOpen ? 'SideBarActiveClass' : '');
    }, [isOpen]);

    const handleDesktopBtn = () => {
        setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
    };

    return (
        <>
            <div className={`DesktopSidebarOpenAndCloseBtn ${isDesktopSidebarOpen ? 'deactived' : ''}`} onClick={handleDesktopBtn}>
                <GanttChart />
            </div>
            <div className={`OrganizationSidebar ${isDesktopSidebarOpen ? 'HandleSideBarVisibility' : ''} ${sideBarClass} fixed z-[1] left-0 bg-[rgb(0 0 0);] h-full flex p-3 flex-col gap-y-4 text-white `}>
                <div className='CloseIconSidebar' onClick={handleSidebar}>
                    <CloseIcon />
                </div>
                <div className="CreategroupsSidebar">
                    <OrganizationSwitcher
                        hidePersonal
                        appearance={{
                            elements: {
                                rootBox: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                    backgroundColor: "white",
                                    border: "1px solid #E5E7EB",
                                    fontWeight: "900",
                                    borderRadius: "8px",
                                },
                                organizationSwitcherTrigger: {
                                    padding: "10px",
                                    fontWeight: "900",
                                    width: "100%",
                                    borderRadius: "15px",
                                    border: "1px solid #E5E7EB",
                                    justifyContent: "space-between",
                                    backgroundColor: "white",
                                }
                            }
                        }}
                    />
                    <div className='CreategroupsSidebarBtnContainer'>
                        <SidebarBtn />
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrgSidebar;
