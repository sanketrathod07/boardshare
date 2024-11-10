"use client";

import { api } from "../../../convex/_generated/api";
import { useApiMutation } from "../../../hooks/use-api-mutation";
import { cn } from "../../../lib/utils";
import { Plus } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const NewBoardButton = ({ orgId, disabled }) => {
    const { mutate, pending } = useApiMutation(api.board.create);


    const onClick = () => {
        mutate({
            orgId,
            title: "Untitled"
        })
        .then((id) => {
            toast.success("Board Created")
        })
        .catch(() => toast.error("Failed to Create new Board"))
    };

    return (
        <button
            disabled={pending || disabled}
            onClick={onClick}
            className={cn(
                "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6 md:w-48 h-60",
                (pending || disabled) && "opacity-75 hover:bg-blue-600 cursor-not-allowed"
            )}
        >
            <Plus className="h-12 w-12 text-white stroke-1" />
            <p className="text-sm text-white font-light">New Board</p>
        </button>
    );
};
