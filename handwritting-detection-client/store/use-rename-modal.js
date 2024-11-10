import { create } from "zustand";

const defaultValues = { id: "", title: "" };

export const useRenameModel = create((set) => ({
    isOpen: false,
    onOpen: (id, title) => set({
        isOpen: true,
        initialValues: { id, title },
    }),
    onClose: () => set({ 
        isOpen: false,
        initialValues: defaultValues,
    }),
    initialValues: defaultValues,
}));