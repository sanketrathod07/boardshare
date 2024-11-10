"use client";

import { Button } from "../../../../components/UI/Button";
import { Skeleton } from "../../../../components/UI/skeleton";
import Image from "next/image";
import Logo from "../../../../public/logo.png";
import Link from "next/link";
import { Actions } from "../../../../components/actions";
import { Hint } from "../../../../components/hint";
import { useRenameModel } from "../../../../store/use-rename-modal";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";


const TabSeparator = () => {
    return (
        <div className="text-neutral-300 px-1.5">|</div>
    );
}

export const Info = ({ boardId }) => {
    if (!boardId || typeof boardId !== 'string') {
        console.error('boardId is not defined or not a string');
        return <InfoSkeleton />;
    }

    const { onOpen } = useRenameModel();

    const data = useQuery(api.board.get, {
        id: boardId
    })

    if (!data) return <InfoSkeleton />;

    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-4 h-16 flex items-center shadow-md">
            <Hint label="Go to Home" side="bottom" sideOffset={20} className="bg-black">
                <Button asChild variant="board" className="px-2">
                    <Link href="/">
                        <Image
                            src={Logo}
                            alt="BoardShare Logo"
                            height={40}
                            width={40}
                        />
                    </Link>
                </Button>
            </Hint>
            <TabSeparator />
            <Hint label="Rename" side="bottom" sideOffset={20} className="bg-black">
                <Button
                    variant="board"
                    className="text-base font-normal px-2"
                    onClick={() => onOpen(data?._id, data?.title)}
                >
                    {data.title}
                </Button>
            </Hint>
        </div>
    );
};

export const InfoSkeleton = () => {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]">
            <Skeleton className="h-full w-full bg-muted-400" />
        </div>
    );
};
