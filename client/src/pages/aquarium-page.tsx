import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Fish types with different colors and sizes
const FISH_TYPES = [
  { color: "#ff9999", size: 30, speed: 1.5, yOffset: 0, direction: 1 },
  { color: "#ff9966", size: 40, speed: 1, yOffset: 50, direction: -1 },
  { color: "#99ff99", size: 25, speed: 2, yOffset: 100, direction: 1 },
  { color: "#9999ff", size: 35, speed: 1.2, yOffset: 150, direction: -1 },
  { color: "#ffff99", size: 20, speed: 1.8, yOffset: 200, direction: 1 },
  { color: "#ff99ff", size: 45, speed: 0.8, yOffset: 250, direction: -1 },
];

interface Fish {
  id: number;
  x: number;
  y: number;
  type: typeof FISH_TYPES[number];
}

export default function AquariumPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fishCount, setFishCount] = useState(6);
  const [bubbleFrequency, setBubbleFrequency] = useState(50);
  const animationRef = useRef<number>(0);
  const fishesRef = useRef<Fish[]>([]);
  const bubblesRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  
  // Initialize the aquarium
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    // Initialize audio
    audioRef.current = new Audio('/audio/aquarium-ambience.mp3');
    audioRef.current.loop = true;
    if (soundEnabled) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }

    // Initialize fish
    initializeFish();
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Handle sound toggle
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (soundEnabled) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [soundEnabled]);

  // Update fish count when changed
  useEffect(() => {
    initializeFish();
  }, [fishCount]);

  // Initialize fish with random positions
  const initializeFish = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const fishes: Fish[] = [];
    
    for (let i = 0; i < fishCount; i++) {
      const typeIndex = i % FISH_TYPES.length;
      const type = FISH_TYPES[typeIndex];
      
      fishes.push({
        id: i,
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * (canvas.height - 100),
        type,
      });
    }
    
    fishesRef.current = fishes;
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw water background
    drawWaterBackground(context, canvas);
    
    // Create bubbles randomly
    if (Math.random() * 100 < bubbleFrequency / 10) {
      createBubble(canvas);
    }
    
    // Update and draw bubbles
    updateBubbles(context, canvas);
    
    // Update and draw fish
    updateFish(context, canvas);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  };

  // Draw water background with gradient
  const drawWaterBackground = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#a8d8eb');
    gradient.addColorStop(1, '#1e4f7c');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand at the bottom
    context.fillStyle = '#e6d2a1';
    context.fillRect(0, canvas.height - 20, canvas.width, 20);
  };

  // Create a new bubble
  const createBubble = (canvas: HTMLCanvasElement) => {
    bubblesRef.current.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      size: 2 + Math.random() * 6,
      speed: 1 + Math.random() * 2,
    });
  };

  // Update and draw all bubbles
  const updateBubbles = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    bubblesRef.current = bubblesRef.current.filter(bubble => {
      // Move bubble upward
      bubble.y -= bubble.speed;
      
      // Remove bubbles that have reached the top
      if (bubble.y + bubble.size < 0) return false;
      
      // Draw bubble
      context.beginPath();
      context.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.fill();
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      context.stroke();
      
      return true;
    });
  };

  // Update and draw all fish
  const updateFish = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    fishesRef.current.forEach(fish => {
      // Move fish horizontally
      fish.x += fish.type.speed * fish.type.direction;
      
      // Wrap fish around when they exit the canvas
      if (fish.x > canvas.width + 50) {
        fish.x = -50;
      } else if (fish.x < -50) {
        fish.x = canvas.width + 50;
      }
      
      // Add slight vertical movement
      fish.y += Math.sin(Date.now() / 1000 + fish.id) * 0.5;
      
      // Draw fish
      drawFish(context, fish);
    });
  };

  // Draw an individual fish
  const drawFish = (context: CanvasRenderingContext2D, fish: Fish) => {
    const { x, y, type } = fish;
    const { size, color, direction } = type;
    
    context.save();
    context.translate(x, y);
    
    // Flip fish based on direction
    if (direction < 0) {
      context.scale(-1, 1);
    }
    
    // Draw fish body
    context.beginPath();
    context.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    
    // Draw tail
    context.beginPath();
    context.moveTo(size * 0.5, 0);
    context.lineTo(size * 1.2, size * 0.5);
    context.lineTo(size * 1.2, -size * 0.5);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    
    // Draw eye
    context.beginPath();
    context.arc(-size * 0.2, -size * 0.1, size * 0.1, 0, Math.PI * 2);
    context.fillStyle = 'white';
    context.fill();
    context.beginPath();
    context.arc(-size * 0.17, -size * 0.07, size * 0.05, 0, Math.PI * 2);
    context.fillStyle = 'black';
    context.fill();
    
    context.restore();
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">Aquarium</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch as colorful fish swim in your virtual aquarium. Listen to the calming water sounds.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="bg-blue-900 rounded-lg overflow-hidden mb-4 relative" style={{ height: '500px' }}>
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fish-count">Number of Fish: {fishCount}</Label>
              </div>
              <Slider 
                id="fish-count"
                min={1} 
                max={15} 
                step={1} 
                value={[fishCount]} 
                onValueChange={(value) => setFishCount(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bubble-frequency">Bubble Frequency: {bubbleFrequency}%</Label>
              </div>
              <Slider 
                id="bubble-frequency"
                min={0} 
                max={100} 
                step={1} 
                value={[bubbleFrequency]} 
                onValueChange={(value) => setBubbleFrequency(value[0])}
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
              <Label htmlFor="sound-toggle">Enable Sound</Label>
            </div>

            <Button asChild variant="default" className="w-full">
              <Link href="/calm">Back to Calm Mode</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}