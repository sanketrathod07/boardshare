"use client";

import React, { memo } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { Hint } from "../../../../components/hint";
// import { Button } from "../../../../components/UI/Button";
import { Camera, Color, Layer } from "../../../../types/canvas";
import { useSelf } from "../../../../liveblocks.config";
import { useSelectionBounds } from "../../../../hooks/use-selection-bounds";
import { ColorPicker } from "./color-picker";
import { useMutation } from "@liveblocks/react";
import { useDeleteLayers } from "../../../../hooks/use-delete-layer";
import {
    LiveObject,
    LiveList,
    LiveMap
} from "@liveblocks/client";

interface SelectionToolsProps {
    camera: Camera
    setLastUsedColor: (color: Color) => void;
};
interface ButtonProps {
    variant: string;
    size: string;
    onClick: () => void;
    icon?: React.ReactNode; // React.ReactNode allows JSX elements
    // ... other props
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    return (
        <button
            ref={ref}
            onClick={props.onClick}
            className={`variant-<span class="math-inline">\{props\.variant\} size\-</span>{props.size}`} // example css class.
        >
            {props.icon}
        </button>
    )
});

export { Button };


export const SelectionTools = memo(({
    camera,
    setLastUsedColor,
}: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);


    const moveToFront = useMutation((
        { storage }
    ) => {
        const liveLayersIds = storage.get("layerIds") as LiveList<string>;
        const indices: number[] = [];

        const arr = liveLayersIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
            if (selection.includes(arr[i])) {
                indices.push(i);
            }
        }
        for (let i = indices.length - 1; i >= 0; i--) {
            liveLayersIds.move(
                indices[i],
                arr.length - 1 - (indices.length - 1 - i)
            );
        };

    }, [selection]);

    const moveToBack = useMutation((
        { storage }
    ) => {
        const liveLayersIds = storage.get("layerIds") as LiveList<string>;
        const indices: number[] = [];

        const arr = liveLayersIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
            if (selection.includes(arr[i])) {
                indices.push(i);
            }
        }
        for (let i = 0; i < indices.length; i++) {
            liveLayersIds.move(indices[i], i);
        }
    }, [selection])

    const setFill = useMutation((
        { storage },
        fill: Color,
    ) => {
        const liveLayers = storage.get("layers") as LiveMap<string, LiveObject<Layer>>;
        setLastUsedColor(fill);

        selection.forEach((id) => {
            liveLayers.get(id)?.set("fill", fill);
        })
    }, [selection, setLastUsedColor]);

    const deleteLayers = useDeleteLayers();

    const selectionBounds = useSelectionBounds() as { x: number; y: number; width: number; height: number };

    if (!selectionBounds) {
        return null;
    }

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
        <div
            className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
            style={{
                transform: `translate(
            calc(${x}px - 50%),
            calc(${y - 16}px - 100%)
            )`
            }}
        >
            <ColorPicker
                onChange={setFill}
            />
            <div className="flex flex-col gap-y-0.5">
                <Hint
                    label="Bring to front"
                    side="top"  // Add a value for 'side'
                    align="center"  // Add a value for 'align'
                    sideOffset={8}  // Add a value for 'sideOffset'
                    alignOffset={4}  // Add a value for 'alignOffset'
                >
                    <Button
                        variant="board"
                        size="icon"
                        onClick={moveToFront}
                        icon={<BringToFront />}
                    >
                    </Button>
                </Hint>
                <Hint
                    label="Bring to Back"
                    side="bottom"
                    align="center"  // Add a value for 'align'
                    sideOffset={8}  // Add a value for 'sideOffset'
                    alignOffset={4}
                >
                    <Button
                        variant="board"
                        size="icon"
                        onClick={moveToBack}
                        icon={<SendToBack />}
                    >
                    </Button>
                </Hint>
            </div>


            <div
                className="flex items-center pl-2 ml-2 border-l border-neutral-200"
            >
                <Hint label="Delete"
                    side="top"  // Add a value for 'side'
                    align="center"  // Add a value for 'align'
                    sideOffset={8}  // Add a value for 'sideOffset'
                    alignOffset={4}
                >
                    <Button
                        variant="board"
                        size="icon"
                        onClick={deleteLayers}
                        icon={<Trash2 />}
                    >
                    </Button>
                </Hint>
            </div>
        </div>
    )
})

SelectionTools.displayName = "SelectionTools";