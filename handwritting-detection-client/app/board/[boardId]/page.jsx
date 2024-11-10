'use client';

import { Canvas } from './_components/canvas';
import { Room } from "../../../components/room";
import { Loading } from "./_components/loading";


const BoardIdPage = ({ params }) => { 
    return (
        <Room roomId={params.boardId} fallback={<Loading/>}>
            <Canvas boardId={params.boardId} />
        </Room>
    )
}

export default BoardIdPage;