import Image from "next/image"

import boardsImg from "./emptyBoardsImg.jpg"

import { api } from "../../../convex/_generated/api";
import { Button } from "../../../components/UI/Button"
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "../../../hooks/use-api-mutation";
import { toast } from "sonner";


export const EmptyBoards = () => {
    const { organization } = useOrganization();
    const { mutate, pending } = useApiMutation(api.board.create);

    const onClick = () => {
        if (!organization) return;

        mutate({
            orgId: organization.id,
            title: "Untitled"
        })
        .then((id) => {
            toast.success("Board Created!")
        })
        .catch(() => toast.error("Failed to create board"))
    }



    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image
                src={boardsImg}
                height={440}
                width={440}
                alt="Empty"
                draggable="false"
            />
            <h2 className="text-2xl font-semibold mt-6">
                Create your first board!
            </h2>
            <p className="text-muted-forground textg-sm mt-2">
                Start by creating a board for your organization
            </p>
            <div className="mt-6">
                <Button disabled={pending} onClick={onClick} size="lg">
                    Create Board
                </Button>
            </div>
        </div>
    )
}