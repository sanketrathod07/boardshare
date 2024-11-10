"use client";

import './style.css';

import Image from "next/image";
import {
    useOrganization,
    useOrganizationList,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Hint } from '@/components/hint';



export const Item = ({
    id,
    name,
    imageUrl,
}) => {
    const { organization } = useOrganization();
    const { setActive } = useOrganizationList();

    const isActive = organization?.id === id;

    const onClick = () => {
        if (!setActive) return;

        setActive({ organization: id });
    };

    return (
        <div className="OrganizationListItem">
            <Hint
                label={name}
                side="right"
                align="start"
                sideOffset={18}
            >
                <Image
                    fill
                    alt={name}
                    src={imageUrl}
                    onClick={onClick}
                    className={cn(
                        "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
                        isActive && "opacity-100"
                    )}
                />
            </Hint>
        </div>
    );
};