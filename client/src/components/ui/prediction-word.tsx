import { useAppContext } from "@/contexts/app-context";

interface PredictionWordProps {
  word: string;
}

export default function PredictionWord({ word }: PredictionWordProps) {
  const { addMessageWord } = useAppContext();

  return (
    <button 
      className="bg-gray-100 px-3 py-1 rounded-md text-sm hover:bg-gray-200"
      onClick={() => addMessageWord(word)}
    >
      {word}
    </button>
  );
}
