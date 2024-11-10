import Image from "next/image"

export const emptyFavorites = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image
                src={"./Images/favoritesIllustation.jpg"}
                height={140}
                width={140}
                alt="Empty"
            />
            <h2 text-2xl font-semibold mt-6>
                No Favorite Boards
            </h2>
            <p className="text-muted-forground textg-sm mt-2">
                Try Seaching for something else
            </p>
        </div>
    )
}