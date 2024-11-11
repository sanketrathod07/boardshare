'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CursorsPresence } from "./cursors-presence";
import { useMutation } from '@liveblocks/react';
import { LayerPreview } from './layer-preview';
import { Participants } from './participants';
import { Toolbar } from './toolbar';
import { nanoid } from 'nanoid';
import { Info } from './info';


import {
    useSelf,
    useHistory,
    useCanRedo,
    useCanUndo,
    useStorage,
    useOthersMapped,
} from '../../../../liveblocks.config';
import {
    LiveObject,
    createClient,
    LiveList,
    LiveMap
} from "@liveblocks/client";
import {
    CanvasMode,
    LayerType,
    Point,
    CanvasState,
    Color,
    Camera,
    Layer,
    Side,
    XYWH,
} from '../../../../types/canvas';
import {
    colorToCss,
    connectionIdToColor,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds
} from '../../../../lib/utils';
import { SelectionBox } from './selection-box';
import { SelectionTools } from './selection-tools';
import { Path } from './path';
import { useDisableScrollBounce } from '../../../../hooks/use-disable-scroll-bounce';
import { useDeleteLayers } from '../../../../hooks/use-delete-layer';
import axios from 'axios';
import { useDeleteAllLayers } from '../../../../hooks/use-delete-all-layers';

import { toast } from 'react-toastify';




const MAX_LAYERS = 100;

interface CanvasProps {
    boardId: string;
}

interface Presence {
    selection: string[];
}


interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

// Debounce function
function debounce(fn: (...args: any[]) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

export const Canvas = ({ boardId, }: CanvasProps) => {
    const layerIds = useStorage((root) => root.layerIds);
    // console.log("layerIds", layerIds)

    const [resultsArray, setResultsArray] = useState<GeneratedResult[]>([]);

    const pencilDraft = useSelf((me) => me.presence.pencilDraft)
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    })

    useDisableScrollBounce();
    const history = useHistory();
    const canRedo = useCanRedo();
    const canUndo = useCanUndo();

    // ********************CANVAS PREDICTION CODE **********************

    const svgRef = useRef(null);
    const [dictOfVars, setDictOfVars] = useState({})



    // Function to convert SVG to PNG
    const convertSvgToPng = useCallback(async () => {
        const toastId = toast.loading("Processing image...");
        const svgElement = svgRef.current;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.crossOrigin = "anonymous";


        img.onload = async () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            try {
                const pngDataUrl = canvas.toDataURL("image/png");

                const response = await axios.post('https://boardshare.onrender.com/calculate', {
                    image: pngDataUrl,
                    dict_of_vars: dictOfVars
                });

                const resp = await response.data;

                const newResults = resp.data.map((data: Response) => ({
                    expression: data.expr,
                    answer: data.result
                }));
                // console.log("newResults", newResults)

                setResultsArray((prevResults) => [...prevResults, ...newResults]);

                resp.data.forEach((data: Response) => {
                    if (data.assign === true) {
                        setDictOfVars({
                            ...dictOfVars,
                            [data.expr]: data.result
                        });
                    }
                });

                toast.update(toastId, { render: "Image processed successfully!", type: "success", isLoading: false, autoClose: 500 });

            } catch (error) {
                console.error("Error sending image to server:", error);
                toast.update(toastId, { render: "Failed to process image", type: "error", isLoading: false, autoClose: 500 });
            }
        };

        img.onerror = (error) => {
            console.error("Error loading SVG as image:", error);
            toast.update(toastId, { render: "Error loading SVG", type: "error", isLoading: false, autoClose: 3000 });
        };

        img.src = url;
    }, [dictOfVars]);


    // const deletePencile = useMutation(({ setMyPresence }) => {
    //     setMyPresence({ pencilDraft: null });
    // }, []);

    // console.log("pencilDraft", pencilDraft)

    const debouncedConvertSvgToPng = useMemo(() => debounce(convertSvgToPng, 500), [convertSvgToPng]);



    // ********************CANVAS PREDICTION CODE **********************


    const insertLayer = useMutation(
        ({ storage, setMyPresence },
            layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
            position: Point,
        ) => {
            const liveLayers = storage.get("layers") as LiveMap<string, LiveObject<Layer>>;

            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            const liveLayersIds = storage.get("layerIds") as LiveList<string>;
            const layerId = nanoid();

            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });

            liveLayersIds.push(layerId);
            liveLayers.set(layerId, layer);

            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        }, [lastUsedColor]);

    const translateSelectedLayers = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y,
        }

        const liveLayers = storage.get("layers");

        if (Array.isArray(self.presence.selection)) {
            for (const id of self.presence.selection) {
                const layer = liveLayers.get(id);

                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }
        } else {
            console.error("self.presence.selection is not an array.");
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point });
    }, [
        canvasState
    ])

    const unselectLayers = useMutation((
        { self, setMyPresence }
    ) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, [])

    const updateSelectionNet = useMutation((
        { storage, setMyPresence },
        current: Point,
        origin: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin,
            current,
        });

        const ids = findIntersectingLayersWithRectangle(
            layerIds,
            layers,
            origin,
            current,
        )

        setMyPresence({ selection: ids })
    }, [layerIds]);

    const startMultiSelection = useCallback((
        current: Point,
        origin: Point,
    ) => {
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
        ) {
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, [])

    const continueDrawing = useMutation((
        { self, setMyPresence },
        point: Point,
        e: React.PointerEvent
    ) => {

        const { pencilDraft } = self.presence;

        if (
            canvasState.mode !== CanvasMode.Pencil ||
            e.buttons !== 1 ||
            pencilDraft == null
        ) {
            return;
        }

        setMyPresence({
            cursor: point,
            pencilDraft:
                pencilDraft.length === 1 &&
                    pencilDraft[0][0] === point.x &&
                    pencilDraft[0][1] === point.y
                    ? pencilDraft
                    : [...pencilDraft, [point.x, point.y, e.pressure]],
        });
    }, [canvasState.mode]);




    const insertPath = useMutation((
        { storage, self, setMyPresence }
    ) => {
        const liveLayers = storage.get("layers");
        const { pencilDraft } = self.presence;

        if (
            pencilDraft == null ||
            pencilDraft.length < 2 || // Ensure there's at least a path
            liveLayers.size >= MAX_LAYERS // Check max layers limit
        ) {
            setMyPresence({ pencilDraft: null });
            return;
        }

        // Create a unique ID for the new layer
        const id = nanoid();

        // Insert the new layer into the `liveLayers` map
        liveLayers.set(
            id,
            new LiveObject(penPointsToPathLayer(
                pencilDraft,
                lastUsedColor
            )),
        );


        // Add the layer ID to the `layerIds` list
        const liveLayerIds = storage.get("layerIds");
        liveLayerIds.push(id); // Ensure the ID is added to the layer list

        setMyPresence({ pencilDraft: null });
        setCanvasState({ mode: CanvasMode.Pencil });
    }, [lastUsedColor]
    );


    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number,) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                penColor: lastUsedColor,
            });
        },
        [lastUsedColor]
    );


    const resizeSelectedLayer = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return;
        }

        const bounds = resizeBounds(
            canvasState.initialBounds,
            canvasState.corner,
            point,
        );

        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0])

        if (layer) {
            layer.update(bounds);
        };
    }, [canvasState])

    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH
    ) => {
        history.pause();
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner,
        })
    }, [history])

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }));
    }, []);

    const onPointerMove = useMutation(({ setMyPresence }, e: React.PointerEvent) => {
        e.preventDefault();
        const current = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(current, canvasState.origin)
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(current)
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        }

        setMyPresence({ cursor: current });
    }, [
        continueDrawing,
        camera,
        canvasState,
        updateSelectionNet,
        startMultiSelection,
        resizeSelectedLayer,
        translateSelectedLayers,
    ]);

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, [
        camera,
        canvasState,
        resizeSelectedLayer,
        translateSelectedLayers,
    ]);

    const onPointerDown = useCallback((
        e: React.PointerEvent,
    ) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
            return;
        }

        if (canvasState.mode === CanvasMode.Pencil) {
            startDrawing(point, e.pressure);
            return;
        }

        setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    }, [camera, canvasState.mode, setCanvasState, startDrawing]);


    const onPointerUp = useMutation((
        { },
        e
    ) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Pressing
        ) {
            unselectLayers();
            setCanvasState({
                mode: CanvasMode.None,
            })
        } else if (canvasState.mode === CanvasMode.Pencil) {
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
        } else {
            setCanvasState({
                mode: CanvasMode.None,
            });
        }
        history.resume();
    }, [
        camera,
        setCanvasState,
        canvasState,
        history,
        insertLayer,
        unselectLayers,
        insertPath,
    ]);

    const selection = useOthersMapped((other) => other.presence.selection)

    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) {
                return;
            }

            history.pause();
            e.stopPropagation();

            const point = pointerEventToCanvasPoint(e, camera);

            if (!Array.isArray(self.presence.selection) || !self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [
            setCanvasState,
            camera,
            history,
            canvasState.mode,
        ]
    );



    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selection) {
            const [connectionId, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
        }

        return layerIdsToColorSelection;
    }, [selection]);

    const deleteLayers = useDeleteLayers();
    const deleteAllLayers = useDeleteAllLayers();

    const handleDeleteAll = () => {
        deleteAllLayers();

        setResultsArray([]);
        setDictOfVars({});
    };


    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            switch (e.key) {
                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
                }
            }
        }
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [deleteLayers, history])


    // ********************FLOATING ARRAY SHOWCASE **********************

    const ArrayShowcase = React.memo(() => {
        const handleRemove = (index) => {
            const element = document.getElementById(`result-${index}`);
            if (element) {
                element.classList.add('fade-out');
                setTimeout(() => {
                    setResultsArray((prevResults) => prevResults.filter((_, i) => i !== index));
                }, 300);
            }
        };

        return (
            <div style={{ position: 'absolute', top: '10%', right: '1%', userSelect: 'none' }}>
                {resultsArray.map((result, index) => (
                    <div
                        id={`result-${index}`}
                        key={index}
                        className="popup"
                        style={{
                            position: 'relative',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '8px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            width: '200px',
                            textAlign: 'center',
                        }}
                    >
                        <button
                            onClick={() => handleRemove(index)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>
                        <p>
                            <strong>{result.expression}</strong>
                        </p>
                        <p>= {result.answer}</p>
                    </div>
                ))}
            </div>
        );
    });




    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canRedo={canRedo}
                canUndo={canUndo}
                redo={history.redo}
                undo={history.undo}
                runRoute={debouncedConvertSvgToPng}
                deletePencile={handleDeleteAll}
            />
            <SelectionTools
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            />
            <ArrayShowcase />
            <svg
                id="canvas"
                ref={svgRef}
                className='h-full w-full bg-white'
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
            >

                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px)`
                    }}
                >
                    {layerIds.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current !== null && (
                        <rect
                            style={{ fill: 'rgba(59, 130, 246, 0.05)', stroke: '#3b82f6', strokeWidth: 1 }}
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />

                    )}
                    <CursorsPresence />
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};
