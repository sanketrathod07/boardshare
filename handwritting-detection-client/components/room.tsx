"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import { LiveMap, LiveList, LiveObject } from "@liveblocks/client"
import React from "react"; // Ensure React is imported

import { Layer } from "../types/canvas"
import { RoomProvider } from "../liveblocks.config";

interface RoomProps {
    children: React.ReactNode;
    roomId: string;
    fallback: React.ReactNode;
}

export const Room = ({
    children,
    roomId,
    fallback
}: RoomProps) => {
    return (
        <RoomProvider
            id={roomId}
            initialPresence={{
                cursor: null,
                selection: [],
                pencilDraft: null,
                penColor: null,
            }}
            initialStorage={{
                layers: new LiveMap<string, LiveObject<Layer>>(),
                layerIds: new LiveList<string>([]),
            }}
        >
            <ClientSideSuspense fallback={fallback}>
                {() => children}
            </ClientSideSuspense>
        </RoomProvider>
    )
}