import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Bubble {
  id: number;
  row: number;
  col: number;
  popped: boolean;
  color: string;
}

export default function BubblesPage() {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(10);
  const [bubbleSize, setBubbleSize] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [totalBubbles, setTotalBubbles] = useState(rows * cols);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Bubble colors with a slight variation
  const bubbleColors = [
    'rgba(255, 200, 200, 0.5)',
    'rgba(200, 255, 200, 0.5)',
    'rgba(200, 200, 255, 0.5)',
    'rgba(255, 255, 200, 0.5)',
    'rgba(255, 200, 255, 0.5)',
    'rgba(200, 255, 255, 0.5)',
  ];

  // Initialize bubble wrap
  useEffect(() => {
    generateBubbleWrap();
    
    // Create pop sound
    popSoundRef.current = new Audio('/audio/pop.mp3');
    
    return () => {
      if (popSoundRef.current) {
        popSoundRef.current = null;
      }
    };
  }, []);

  // Regenerate bubble wrap when rows or columns change
  useEffect(() => {
    generateBubbleWrap();
  }, [rows, cols]);

  // Generate bubble wrap grid
  const generateBubbleWrap = () => {
    const newBubbles: Bubble[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = Math.floor(Math.random() * bubbleColors.length);
        newBubbles.push({
          id: row * cols + col,
          row,
          col,
          popped: false,
          color: bubbleColors[colorIndex],
        });
      }
    }
    
    setBubbles(newBubbles);
    setTotalBubbles(rows * cols);
    setPoppedCount(0);
  };

  // Handle bubble pop
  const handleBubblePop = (id: number) => {
    setBubbles(prevBubbles => 
      prevBubbles.map(bubble => 
        bubble.id === id ? { ...bubble, popped: true } : bubble
      )
    );
    
    // Play pop sound if enabled
    if (soundEnabled && popSoundRef.current) {
      // Create a new audio element for each pop for overlapping sounds
      const popSound = new Audio('/audio/pop.mp3');
      popSound.volume = 0.5;
      popSound.play().catch(e => console.error("Audio playback failed:", e));
    }
    
    setPoppedCount(prevCount => prevCount + 1);
  };

  // Reset bubble wrap
  const resetBubbleWrap = () => {
    generateBubbleWrap();
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">Bubble Pop</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pop the virtual bubble wrap for a satisfying sensory experience. 
          Click on each bubble to pop it.
        </p>
        <div className="mt-2">
          <p className="text-xl">
            <span className="font-medium">{poppedCount}</span> of {totalBubbles} bubbles popped
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div 
          className="bg-white rounded-lg overflow-auto mb-6 p-4 flex flex-wrap justify-center"
          style={{ 
            maxHeight: '500px',
            width: '100%'
          }}
        >
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              className="relative m-1 transition-all duration-200 transform"
              style={{
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
              }}
            >
              <button
                disabled={bubble.popped}
                onClick={() => !bubble.popped && handleBubblePop(bubble.id)}
                className={`
                  w-full h-full rounded-full border border-gray-200 
                  cursor-pointer focus:outline-none transform transition-all duration-150
                  ${bubble.popped ? 'opacity-30 scale-75' : 'hover:scale-105 active:scale-90'}
                `}
                style={{
                  backgroundColor: bubble.color,
                  boxShadow: bubble.popped ? 'none' : 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(0,0,0,0.1)',
                }}
                aria-label={bubble.popped ? "Popped bubble" : "Bubble to pop"}
              >
                {!bubble.popped && (
                  <div className="absolute top-1/4 left-1/4 w-1/5 h-1/5 rounded-full bg-white opacity-70" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rows">Rows: {rows}</Label>
              </div>
              <Slider 
                id="rows"
                min={2} 
                max={12} 
                step={1} 
                value={[rows]} 
                onValueChange={(value) => setRows(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cols">Columns: {cols}</Label>
              </div>
              <Slider 
                id="cols"
                min={2} 
                max={12} 
                step={1} 
                value={[cols]} 
                onValueChange={(value) => setCols(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="size">Bubble Size: {bubbleSize}px</Label>
              </div>
              <Slider 
                id="size"
                min={30} 
                max={100} 
                step={5} 
                value={[bubbleSize]} 
                onValueChange={(value) => setBubbleSize(value[0])}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="sound-toggle" 
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="sound-toggle">Enable Pop Sound</Label>
            </div>

            <Button 
              onClick={resetBubbleWrap} 
              variant="outline" 
              className="w-full mb-2"
            >
              Reset Bubbles
            </Button>

            <Button asChild variant="default" className="w-full">
              <Link href="/calm">Back to Calm Mode</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}