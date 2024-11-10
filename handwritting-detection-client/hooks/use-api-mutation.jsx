import { useState } from "react";
import { useMutation } from "convex/react";

export const useApiMutation = (mutationFunction) => {
    const [pending, setPending] = useState(false);
    const apiMutation = useMutation(mutationFunction);

    const mutate = async (payload) => {
        setPending(true);
        return apiMutation(payload)
            .finally(() => setPending(false))
            .then((result) => {
                return result;
            })
            .catch((error) => {
                throw error;
            });
    };

    return {
        mutate,
        pending,
    };
}