import Image from "next/image"
import Img from './emptyOrgDashboard.jpg'
import { CreateOrganization, OrganizationSwitcher } from "@clerk/nextjs"

import { Button } from '../../../components/UI/Button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "../../../components/UI/dialog";

const emptyOrg = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center select-none">
            <Image
                src={Img}
                alt="Empty"
                height={700}
                width={700}
                draggable="false"
            />
            <h2 className="text-2xl font-semibold mt-6">
                Welcome to Board
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Create an organization to get started
            </p>
            <div className="mt-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            Create Organization
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none max-w-[490px]">
                        <CreateOrganization />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default emptyOrg
