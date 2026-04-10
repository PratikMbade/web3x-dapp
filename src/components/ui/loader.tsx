import React from "react";
import { FadeLoader } from "react-spinners";

type Props = {
    loaderDescription:string
};

const TransactionLoader = (props: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-[2px] "></div>
      <div className="rounded-lg shadow-lg w-auto md:w-1/2 md:h-[30rem] p-6 z-10 flex flex-col items-center justify-center mx-9">
        <div>
          <FadeLoader color="#ffd008" />
        </div>
        <p>{props.loaderDescription}</p>
      </div>
    </div>
  );
};

export default TransactionLoader;