import { useMutation } from "../liveblocks.config";

export const useDeleteAllLayers = () => {
    return useMutation((
        { storage, setMyPresence }
    ) => {
        const liveLayers = storage.get("layers");
        const liveLayersIds = storage.get("layerIds");

        // Clear all layers
        liveLayers.forEach((_, id) => liveLayers.delete(id));

        // Clear all layer IDs
        liveLayersIds.clear();

        // Clear selection and add action to history
        setMyPresence({ selection: [] }, { addToHistory: true });
    }, []);
};
