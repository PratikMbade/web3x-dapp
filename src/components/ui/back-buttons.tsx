'use client'
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

type Props = {
  link: string;
  text: string;
};

export const BackButton = (props: Props) => {



  return (
    <>
      <Link href={`${props.link}`}>
        {" "}
        <div className="flex cursor-pointer  items-center justify-center gap-x-3  border-2 border-yellow-400  px-3 rounded-2xl  w-fit m-3 hover:bg-muted-foreground/15">
          <FaArrowLeft className="text-lg" />
          <p className="text-lg">{props.text}</p>
        </div>
      </Link>
    </>
  );
};