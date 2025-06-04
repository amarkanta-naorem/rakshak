import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rakshak | On Time, Every Time, For Life",
  description: "Learn more about Rakshak",
};

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center space-y-5">
      <h1 className="font-semibold">Rakshak</h1>
      <Link
        href={"/dashboard"}
        className="border border-stone-500 h-[1.5rem] w-[5rem] rounded-lg text-xs flex items-center justify-center"
      >
        Dashboard
      </Link>
    </div>
  );
}
