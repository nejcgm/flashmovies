import React from "react";
import InfoIcon from "../assets/info_icon.png";

interface InfoCtaProps {
  infoMessage: string;
  infoDisplay: () => void;
}
const InfoCta: React.FC<InfoCtaProps> = ({ infoMessage, infoDisplay }) => {
  return (
    <>
      <div
        onClick={() => {
          infoDisplay();
        }}
        className="gap-2 items-center text-[12px] sm:text-[14px] self-start flex p-2 rounded-full hover:bg-white/5 "
      >
        <img className="w-[18px] sm:w-[24px]" src={InfoIcon} alt="" />
        {infoMessage && <div>{infoMessage}</div>}
      </div>
    </>
  );
};

export default InfoCta;
