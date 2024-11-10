import Image from "next/image"
import Logo from '../../public/Logo2.png'


export const Loading = () => {
    return (
        <div className="h-full w-full flex flex-col justify-center items-center">
            <Image
                src={Logo}
                alt="Logo"
                width={420}
                height={420}
                className="animate-pulse duration-350"
            />

        </div>
    )
}