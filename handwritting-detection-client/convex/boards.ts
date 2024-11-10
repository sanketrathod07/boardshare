import { v } from "convex/values";

import { query } from "./_generated/server";
import { favorite } from "./board";

export const get = query({
    args: {
        orgId: v.string(),
    },
    handler: async (ctx, args) => {
        const identify = await ctx.auth.getUserIdentity();

        if (!identify) {
            throw new Error("Unauthorized");
        }

        const boards = await ctx.db
            .query("boards")
            .withIndex("bg_org", (q) => q.eq("orgId", args.orgId))
            .order("desc")
            .collect();

        const boardsWithFavoriteRelation = boards.map((board) => {
            return ctx.db
                .query("userFavorites")
                .withIndex("by_user_board", (q) =>
                    q
                        .eq("userId", identify.subject)
                        .eq("boardId", board._id)
                )
                .unique()
                .then((favorite) => {
                    return {
                        ...board,
                        isFavorite: !!favorite,
                    };
                });
        });

        const boardsWithFavoriteBoolean = Promise.all(boardsWithFavoriteRelation);

        return boardsWithFavoriteBoolean;
    },
})