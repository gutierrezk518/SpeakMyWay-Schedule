import { useAppContext } from "@/contexts/app-context";
import { getBgClass } from "@/lib/utils";

interface CardButtonProps {
  icon: string;
  text: string;
  color: string;
  onClick?: () => void;
  isCategory?: boolean;
  border?: boolean;
}

export default function CardButton({
  icon,
  text,
  color,
  onClick,
  isCategory = false,
  border = false,
}: CardButtonProps) {
  const { addMessageWord } = useAppContext();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!isCategory) {
      addMessageWord(text);
    }
  };

  const getBackgroundClass = () => {
    if (border) {
      return `bg-white border-2 border-gray-300`;
    }
    return `${getBgClass(color)} text-black`;
  };

  const getSizeClass = () => {
    if (isCategory) {
      return "min-w-[100px] h-16";
    }
    return "card";
  };

  return (
    <button
      className={`${getBackgroundClass()} ${getSizeClass()} p-2 rounded-md flex flex-col items-center justify-center text-center`}
      onClick={handleClick}
    >
      <i className={`${icon} ${isCategory ? "text-2xl" : "text-xl"} ${border ? "text-gray-600" : "text-black"} mb-1`}></i>
      <span className={`text-sm ${isCategory ? "" : "line-clamp-1"} ${border ? "text-gray-600" : "text-black"}`}>{text}</span>
    </button>
  );
}
