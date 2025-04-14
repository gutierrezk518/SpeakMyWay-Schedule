import { useAppContext } from "@/contexts/app-context";

interface MessageWordProps {
  id: string;
  word: string;
}

export default function MessageWord({ id, word }: MessageWordProps) {
  const { removeMessageWord } = useAppContext();

  return (
    <div className="message-word inline-flex items-center bg-neutral-light rounded-md px-3 py-2 mr-2 mb-2 relative">
      <span>{word}</span>
      <button 
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
        onClick={() => removeMessageWord(id)}
      >
        &times;
      </button>
    </div>
  );
}
