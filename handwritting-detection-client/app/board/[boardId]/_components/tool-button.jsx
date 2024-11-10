"use client";

import { Hint } from "../../../../components/hint";
import { Button } from "../../../../components/UI/Button";


export const ToolButton = ({
    label,
    icon: Icon,
    onClick,
    isActive,
    isDisabled,
}) => {
    return (
        <Hint label={label} side="right" sideOffset={14}>
            <Button
                disabled={isDisabled}
                onClick={onClick}
                size="icon"
                variant={isActive ? "boardActive" : "board"}
            >
                <Icon />
            </Button>
        </Hint>
    )
}