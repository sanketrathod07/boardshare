import Image from "next/image";
import favoritesImg from "./FavoritesImg.jpg";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EmptyBoards } from "./EmptyBoards";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";

const board_list = ({ orgId, query }) => {
  const data = useQuery(api.boards.get, { orgId });

  if (!data) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Team Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!data.length && query.search) {
    return <div>Try Searching Something Else...</div>;
  }

  if (!data.length && query.favorites) {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none pointer-events-none">
        <Image
          src={favoritesImg}
          height={440}
          width={440}
          alt="Empty"
        />
        <h2 className="text-2xl font-semibold mt-6">No Favorite Boards</h2>
        <p className="text-muted-forground textg-sm mt-2">
          Try Searching for something else
        </p>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyBoards />;
  }

  const favoriteBoards = data.filter((board) => board.isFavorite);

  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite Boards" : "Team Boards"}
      </h2>
      <div className="ButtonCardContainer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10 ">
        {query.favorites
          ? favoriteBoards.map((board) => (
            <BoardCard
              key={board._id}
              id={board._id}
              title={board.title}
              imageUrl={board.imageUrl}
              authorId={board.authorId}
              authorName={board.authorName}
              createdAt={board._creationTime}
              orgId={board.orgId}
              isFavorite={board.isFavorite}
            />
          ))
          : (
            <>
              <NewBoardButton orgId={orgId} />
              {data.map((board) => (
                <BoardCard
                  key={board._id}
                  id={board._id}
                  title={board.title}
                  imageUrl={board.imageUrl}
                  authorId={board.authorId}
                  authorName={board.authorName}
                  createdAt={board._creationTime}
                  orgId={board.orgId}
                  isFavorite={board.isFavorite}
                />
              ))}
            </>
          )}
      </div>
    </div>
  );
};

export default board_list;
