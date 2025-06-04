import Image from "next/image";

export default function UserProfileNavbarMenu () {
    return (
        <div className="flex items-start space-x-2 cursor-pointer">
            <Image src="/images/user.png" alt="User Profile" width={0} height={0} sizes="(max-width: 640px) 40px, (max-width: 1024px) 30px, 35px" className="h-[60%] w-auto object-contain rounded-md bg-[#3778E1]/20 shadow-inner" style={{ filter: 'contrast(1.1)' }}/>
            <section className="flex flex-col max-w-[180px]">
            <h1 className="text-sm font-semibold text-[#1D3557] w-[8rem] truncate">Amarkanta Naorem</h1>
            <p className="text-xs italic text-[#6B7280] lowercase">admin</p>
            </section>
        </div>
    );
}