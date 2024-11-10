'use client';

import './Navbar.css';
import Image from "next/image";
import Logo from "../../public/Logo2.png";
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { UserButton, useOrganization } from "@clerk/nextjs";
import { useApiMutation } from '../../hooks/use-api-mutation';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

const Navbar = ({ handleSidebar }) => {

    const { organization } = useOrganization();

    const { mutate } = useApiMutation(api.board.create);

    const onClick = () => {
        mutate({
            orgId: organization.id,
            title: "Untitle",
        })
            .then(() => {
                toast.success("Board Created Successfully")
            })
            .catch(() => {
                toast.error("Failed to Create")
            })
    }

    return (
        <div className="NavbarMainContainer">
            <div className="NavbarMainSubContainer">
                <div className="NavbarMainContainerLogo">
                    <Image height={40} priority src={Logo} alt='Logo' />
                </div>
                <div className="NavbarMainContainerMenu">
                    <h3 className="NavbarMainContainerMenuItems" onClick={onClick}><AddIcon />Create Session</h3>
                    <UserButton />
                </div>
                {/* SideBar */}
                <div className="MobileSidebarToogleBtn" onClick={handleSidebar}>
                    <MenuIcon />
                </div>
            </div>
        </div>
    );
}

export default Navbar;
