import InfoIcon from "../../assets/info_icon.png";

interface InfoCtaProps {
  infoMessage: string;
  infoDisplay: () => void;
  className?: string;
  iconClassName?: string;
}
export function InfoCta({
  infoMessage,
  infoDisplay,
  className = "",
  iconClassName = "w-[18px] sm:w-[24px]",
}: InfoCtaProps) {
  return (
    <>
      <div
        onClick={() => {
          infoDisplay();
        }}
        className={`flex items-center gap-2 self-start rounded-full p-2 text-[12px] hover:bg-white/5 sm:text-[14px] ${className}`}
      >
        <img className={iconClassName} src={InfoIcon} alt="more info flash movies" />
        {infoMessage && <div>{infoMessage}</div>}
      </div>
    </>
  );
};

