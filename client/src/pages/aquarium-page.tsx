import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Finding Nemo inspired fish characters
const FISH_CHARACTERS = [
  { 
    name: "Nemo", 
    bodyColor: "#FF7F00", // Bright orange
    stripeColor: "#FFFFFF", // White stripes
    size: 30, 
    speed: 0.7, 
    yOffset: 0, 
    direction: 1,
    hasStripes: true,
    finColor: "#FF9C40",
    details: {
      hasLuckyFin: true
    }
  },
  { 
    name: "Marlin", 
    bodyColor: "#FF6600", // Darker orange
    stripeColor: "#FFFFFF", // White stripes
    size: 45, 
    speed: 0.6, 
    yOffset: 50, 
    direction: -1,
    hasStripes: true,
    finColor: "#FF8533",
    details: {
      hasLuckyFin: false
    }
  },
  { 
    name: "Dory", 
    bodyColor: "#1B75BB", // Blue
    stripeColor: "#FFF200", // Yellow accent
    size: 40, 
    speed: 0.8, 
    yOffset: 100, 
    direction: 1,
    hasStripes: false,
    finColor: "#0E3D62",
    details: {
      hasTallyMarks: true
    }
  },
  { 
    name: "Bubbles", 
    bodyColor: "#FFF200", // Yellow
    stripeColor: "#000000", // Black stripes
    size: 35, 
    speed: 0.5, 
    yOffset: 150, 
    direction: -1,
    hasStripes: true,
    finColor: "#FFD700",
    details: {
      hasSpots: true
    }
  },
  { 
    name: "Peach", 
    bodyColor: "#FF9BA2", // Pink
    stripeColor: "#FFFFFF", // White
    size: 38, 
    speed: 0.4, 
    yOffset: 200, 
    direction: 1,
    hasStripes: false,
    finColor: "#FF8C96",
    details: {
      hasSpots: false
    }
  },
  { 
    name: "Gill", 
    bodyColor: "#5B6770", // Dark gray
    stripeColor: "#FFFFFF", // White
    size: 50, 
    speed: 0.5, 
    yOffset: 250, 
    direction: -1,
    hasStripes: true,
    finColor: "#3D4752",
    details: {
      hasScar: true
    }
  },
];

interface Fish {
  id: number;
  x: number;
  y: number;
  type: typeof FISH_CHARACTERS[number];
  wiggle: number; // For more natural swimming motion
  blinkTimer: number; // For eye blinking
  targetX: number; // Target X position for natural movement
  targetY: number; // Target Y position for natural movement
  speed: number; // Current speed (can be increased when touched)
  speedMultiplier: number; // Multiplier for when fish is scared
  speedResetTimer: number; // Timer to reset speed after being scared
}

export default function AquariumPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fishCount, setFishCount] = useState(6);
  const [bubbleFrequency, setBubbleFrequency] = useState(50);
  const animationRef = useRef<number>(0);
  const fishesRef = useRef<Fish[]>([]);
  const bubblesRef = useRef<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([]);
  const seaweedRef = useRef<{ x: number; height: number; width: number; segments: number }[]>([]);
  const coralRef = useRef<{ x: number; y: number; size: number; color: string }[]>([]);

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

    // Initialize environment elements
    initializeEnvironment(canvas);

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

  // Initialize environment elements
  const initializeEnvironment = (canvas: HTMLCanvasElement) => {
    // Initialize seaweed
    const seaweedCount = 8;
    const seaweed = [];

    for (let i = 0; i < seaweedCount; i++) {
      seaweed.push({
        x: Math.random() * canvas.width,
        height: 50 + Math.random() * 100,
        width: 10 + Math.random() * 15,
        segments: 5 + Math.floor(Math.random() * 5)
      });
    }

    seaweedRef.current = seaweed;

    // Initialize coral
    const coralCount = 6;
    const coral = [];
    const coralColors = ['#FF6F61', '#FF9671', '#FFC75F', '#F9F871'];

    for (let i = 0; i < coralCount; i++) {
      coral.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 20,
        size: 20 + Math.random() * 30,
        color: coralColors[Math.floor(Math.random() * coralColors.length)]
      });
    }

    coralRef.current = coral;
  };

  // Initialize fish with random positions and movement properties
  const initializeFish = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const fishes: Fish[] = [];

    for (let i = 0; i < fishCount; i++) {
      const typeIndex = i % FISH_CHARACTERS.length;
      const type = FISH_CHARACTERS[typeIndex];

      // Random starting position
      const x = Math.random() * canvas.width;
      const y = 50 + Math.random() * (canvas.height - 150);

      // Random target position for natural movement
      const targetX = Math.random() * canvas.width;
      const targetY = Math.max(50, Math.min(canvas.height - 100, y + (Math.random() - 0.5) * 200));

      fishes.push({
        id: i,
        x,
        y,
        type,
        wiggle: Math.random() * Math.PI * 2, // Random starting phase for wiggle
        blinkTimer: Math.random() * 100, // Random blink timer
        targetX,
        targetY,
        speed: type.speed, // Base speed from character type
        speedMultiplier: 1, // Normal speed initially
        speedResetTimer: 0 // No timer initially
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

    // Draw environment
    drawEnvironment(context, canvas);

    // Create bubbles randomly
    if (Math.random() * 100 < bubbleFrequency / 10) {
      createBubble(canvas);
    }

    // Update and draw bubbles
    updateBubbles(context, canvas);

    // Update and draw fish
    updateFish(context, canvas);

    // Draw caustic light effects (water surface light reflections)
    drawCausticEffects(context, canvas);

    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  };

  // Draw water background with gradient
  const drawWaterBackground = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    // Create deep ocean gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#91d5ff');  // Light blue at top
    gradient.addColorStop(0.7, '#1890ff'); // Medium blue
    gradient.addColorStop(1, '#096dd9');   // Deep blue at bottom

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sand at the bottom with texture
    const sandHeight = 30;
    context.fillStyle = '#f0d6a7';
    context.fillRect(0, canvas.height - sandHeight, canvas.width, sandHeight);

    // Add sand texture
    for (let i = 0; i < canvas.width; i += 4) {
      for (let j = 0; j < sandHeight; j += 4) {
        if (Math.random() > 0.7) {
          context.fillStyle = `rgba(225, 198, 153, ${Math.random() * 0.5})`;
          context.fillRect(
            i + Math.random() * 4, 
            canvas.height - sandHeight + j + Math.random() * 4, 
            2, 
            2
          );
        }
      }
    }
  };

  // Draw environment elements (seaweed, coral, etc.)
  const drawEnvironment = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    // Draw seaweed
    seaweedRef.current.forEach(seaweed => {
      drawSeaweed(context, seaweed, canvas.height);
    });

    // Draw coral
    coralRef.current.forEach(coral => {
      drawCoral(context, coral);
    });
  };

  // Draw seaweed
  const drawSeaweed = (
    context: CanvasRenderingContext2D, 
    seaweed: { x: number; height: number; width: number; segments: number }, 
    canvasHeight: number
  ) => {
    const { x, height, width, segments } = seaweed;
    const segmentHeight = height / segments;

    context.save();

    // Use Perlin noise-like effect for gentle swaying
    const time = Date.now() / 2000;

    for (let i = 0; i < segments; i++) {
      const segmentY = canvasHeight - (i + 1) * segmentHeight;
      const swayAmount = Math.sin(time + i * 0.5) * (i + 1) * 2;

      context.fillStyle = `rgba(0, 128, 0, ${0.6 + i * 0.05})`;

      context.beginPath();
      context.ellipse(
        x + swayAmount, 
        segmentY + segmentHeight / 2, 
        width / 2 - i * (width / (2 * segments)), 
        segmentHeight / 2, 
        0, 
        0, 
        Math.PI * 2
      );
      context.fill();
    }

    context.restore();
  };

  // Draw coral
  const drawCoral = (
    context: CanvasRenderingContext2D, 
    coral: { x: number; y: number; size: number; color: string }
  ) => {
    const { x, y, size, color } = coral;

    context.save();

    // Draw main coral structure
    context.fillStyle = color;

    // Draw multiple coral branches
    const branchCount = 4 + Math.floor(size / 10);

    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI;
      const branchHeight = size * (0.6 + Math.random() * 0.4);
      const branchWidth = size * 0.2;

      context.save();
      context.translate(x, y);
      context.rotate(angle);

      // Draw coral branch (rounded rectangle)
      context.beginPath();
      context.roundRect(
        -branchWidth / 2, 
        -branchHeight, 
        branchWidth, 
        branchHeight, 
        [branchWidth / 2, branchWidth / 2, 0, 0]
      );
      context.fill();

      context.restore();
    }

    // Add some highlights
    context.globalAlpha = 0.3;
    context.fillStyle = '#ffffff';

    for (let i = 0; i < 5; i++) {
      const dotSize = size * 0.05;
      const dotX = x + (Math.random() - 0.5) * size * 0.8;
      const dotY = y - Math.random() * size * 0.8;

      context.beginPath();
      context.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  };

  // Draw caustic light effects
  const drawCausticEffects = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    context.save();

    context.globalAlpha = 0.1;
    context.fillStyle = '#ffffff';

    const time = Date.now() / 2000;
    const causticCount = 15;

    for (let i = 0; i < causticCount; i++) {
      const x = ((time * 30 + i * canvas.width / causticCount) % canvas.width);
      const width = 40 + Math.sin(time + i) * 20;
      const height = 150 + Math.sin(time * 1.5 + i) * 50;

      context.beginPath();
      context.ellipse(x, 150, width, height, Math.sin(time) * 0.2, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  };

  // Create a new bubble
  const createBubble = (canvas: HTMLCanvasElement) => {
    bubblesRef.current.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      size: 2 + Math.random() * 6,
      speed: 0.5 + Math.random() * 1, // Slower bubbles
      opacity: 0.3 + Math.random() * 0.5,
    });
  };

  // Update and draw all bubbles
  const updateBubbles = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    bubblesRef.current = bubblesRef.current.filter(bubble => {
      // Move bubble upward with some side-to-side motion
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(Date.now() / 1000 + bubble.y * 0.1) * 0.3;

      // Remove bubbles that have reached the top
      if (bubble.y + bubble.size < 0) return false;

      // Draw bubble with more realistic appearance
      context.beginPath();
      context.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);

      // Bubble gradient
      const gradient = context.createRadialGradient(
        bubble.x - bubble.size * 0.3, 
        bubble.y - bubble.size * 0.3, 
        0,
        bubble.x, 
        bubble.y, 
        bubble.size
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity + 0.2})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${bubble.opacity - 0.2})`);

      context.fillStyle = gradient;
      context.fill();

      // Bubble highlight
      context.beginPath();
      context.arc(
        bubble.x - bubble.size * 0.3, 
        bubble.y - bubble.size * 0.3, 
        bubble.size * 0.2, 
        0, 
        Math.PI * 2
      );
      context.fillStyle = `rgba(255, 255, 255, ${bubble.opacity + 0.4})`;
      context.fill();

      return true;
    });
  };

  // Update and draw all fish with natural swimming behavior
  const updateFish = (
    context: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement
  ) => {
    fishesRef.current.forEach(fish => {
      // Decrease speed multiplier over time
      if (fish.speedMultiplier > 1) {
        fish.speedResetTimer -= 1;
        if (fish.speedResetTimer <= 0) {
          fish.speedMultiplier = Math.max(1, fish.speedMultiplier - 0.1);
        }
      }

      // Calculate actual current speed
      const currentSpeed = fish.speed * fish.speedMultiplier;

      // Calculate distance to target
      const dx = fish.targetX - fish.x;
      const dy = fish.targetY - fish.y;
      const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

      // If fish is close to target, set a new target
      if (distanceToTarget < fish.type.size || Math.random() < 0.005) {
        fish.targetX = Math.random() * canvas.width;
        fish.targetY = Math.max(50, Math.min(canvas.height - 100, fish.y + (Math.random() - 0.5) * 200));

        // Sometimes make them change direction when selecting a new target
        if (Math.random() < 0.3) {
          fish.type = { ...fish.type, direction: -fish.type.direction };
        }
      }

      // Natural movement toward target
      if (distanceToTarget > 0) {
        const moveX = dx / distanceToTarget * currentSpeed * 0.5;
        const moveY = dy / distanceToTarget * currentSpeed * 0.3;

        fish.x += moveX;
        fish.y += moveY;
      }

      // Add some randomness to movement
      fish.x += (Math.random() - 0.5) * 0.5;
      fish.y += (Math.random() - 0.5) * 0.3;

      // Update wiggle for swimming motion based on speed
      fish.wiggle += 0.05 * fish.speedMultiplier;
      if (fish.wiggle > Math.PI * 2) fish.wiggle -= Math.PI * 2;

      // Update blink timer
      fish.blinkTimer -= 1;
      if (fish.blinkTimer < 0) fish.blinkTimer = 100 + Math.random() * 200;

      // Boundary checking - keep fish inside the aquarium with some margin
      if (fish.x < fish.type.size) {
        fish.x = fish.type.size;
        fish.targetX = fish.type.size + Math.random() * 100;
      } else if (fish.x > canvas.width - fish.type.size) {
        fish.x = canvas.width - fish.type.size;
        fish.targetX = canvas.width - fish.type.size - Math.random() * 100;
      }

      if (fish.y < fish.type.size) {
        fish.y = fish.type.size;
        fish.targetY = fish.type.size + Math.random() * 50;
      } else if (fish.y > canvas.height - fish.type.size - 30) { // Keep above sand
        fish.y = canvas.height - fish.type.size - 30;
        fish.targetY = canvas.height - fish.type.size - 30 - Math.random() * 50;
      }

      // Draw fish with the current direction they're swimming
      const effectiveDirection = moveX < 0 ? -1 : 1;
      const fishWithDirection = {
        ...fish,
        type: {
          ...fish.type,
          direction: effectiveDirection
        }
      };

      // Draw fish
      drawNemoFish(context, fishWithDirection);
    });
  };

  // Draw a Finding Nemo style fish
  const drawNemoFish = (context: CanvasRenderingContext2D, fish: Fish) => {
    const { x, y, type, wiggle, blinkTimer } = fish;
    const { size, bodyColor, stripeColor, direction, hasStripes, finColor, details } = type;

    context.save();
    context.translate(x, y);

    // Flip fish based on direction
    if (direction < 0) {
      context.scale(-1, 1);
    }

    // Add wiggle movement for more natural swimming
    const wiggleAmount = Math.sin(wiggle) * size * 0.05;
    context.rotate(wiggleAmount);

    // Draw fins (behind body)
    context.fillStyle = finColor;

    // Top fin
    context.beginPath();
    context.moveTo(0, -size * 0.3);
    context.quadraticCurveTo(
      size * 0.2, -size * 0.7 + wiggleAmount, 
      size * 0.1, -size * 0.3
    );
    context.fill();

    // Back fin
    context.beginPath();
    context.moveTo(size * 0.3, 0);
    context.quadraticCurveTo(
      size * 0.8, -size * 0.3 + wiggleAmount * 3, 
      size * 0.9, 0
    );
    context.quadraticCurveTo(
      size * 0.8, size * 0.3 + wiggleAmount * 3, 
      size * 0.3, 0
    );
    context.fill();

    // Draw fish body
    context.beginPath();
    context.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    context.fillStyle = bodyColor;
    context.fill();

    // Draw stripes for clownfish
    if (hasStripes) {
      context.fillStyle = stripeColor;

      // First stripe
      context.beginPath();
      context.ellipse(-size * 0.3, 0, size * 0.08, size * 0.3, 0, 0, Math.PI * 2);
      context.fill();

      // Second stripe
      context.beginPath();
      context.ellipse(0, 0, size * 0.08, size * 0.3, 0, 0, Math.PI * 2);
      context.fill();

      // Third stripe
      context.beginPath();
      context.ellipse(size * 0.3, 0, size * 0.08, size * 0.3, 0, 0, Math.PI * 2);
      context.fill();
    }

    // Draw character-specific details
    if (type.name === "Dory") {
      // Dory's yellow tail
      context.fillStyle = '#FFF200';
      context.beginPath();
      context.ellipse(size * 0.4, 0, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
      context.fill();

      // Black marking
      context.fillStyle = '#000000';
      context.beginPath();
      context.ellipse(size * 0.1, -size * 0.2, size * 0.15, size * 0.1, Math.PI / 4, 0, Math.PI * 2);
      context.fill();
    }

    if (details?.hasLuckyFin && type.name === "Nemo") {
      // Nemo's smaller right fin
      context.fillStyle = finColor;
      context.beginPath();
      context.moveTo(-size * 0.1, -size * 0.2);
      context.quadraticCurveTo(
        -size * 0.4, -size * 0.3, 
        -size * 0.2, -size * 0.1
      );
      context.fill();
    }

    // Draw pectoral fin
    context.fillStyle = finColor;
    context.beginPath();
    context.moveTo(-size * 0.1, size * 0.1);
    context.quadraticCurveTo(
      -size * 0.4 + Math.sin(wiggle) * size * 0.1, size * 0.3, 
      -size * 0.1, size * 0.3
    );
    context.fill();

    // Draw eye
    context.beginPath();
    context.arc(-size * 0.35, -size * 0.1, size * 0.12, 0, Math.PI * 2);
    context.fillStyle = 'white';
    context.fill();

    // Blinking animation
    const isBlinking = blinkTimer < 10;
    if (!isBlinking) {
      context.beginPath();
      context.arc(-size * 0.32, -size * 0.08, size * 0.06, 0, Math.PI * 2);
      context.fillStyle = 'black';
      context.fill();

      // Eye highlight
      context.beginPath();
      context.arc(-size * 0.34, -size * 0.1, size * 0.03, 0, Math.PI * 2);
      context.fillStyle = 'white';
      context.fill();
    } else {
      // Draw closed eye
      context.beginPath();
      context.ellipse(-size * 0.35, -size * 0.1, size * 0.12, size * 0.03, 0, 0, Math.PI * 2);
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fill();
    }

    // Draw mouth
    context.beginPath();
    context.moveTo(-size * 0.5, 0);
    context.quadraticCurveTo(
      -size * 0.6, size * 0.05 + Math.sin(wiggle) * 0.02 * size, 
      -size * 0.5, size * 0.1
    );
    context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    context.lineWidth = size * 0.02;
    context.stroke();

    context.restore();
  };

  // Handle canvas click for interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create bubbles around click point
    for (let i = 0; i < 15; i++) {
      bubblesRef.current.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        size: 2 + Math.random() * 8,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }

    // Make fish react to the click/touch by swimming away faster
    fishesRef.current.forEach(fish => {
      const dx = fish.x - x;
      const dy = fish.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 200) { // Larger detection radius
        // Calculate fear factor based on proximity (closer = more scared)
        const fearFactor = 1 + (200 - distance) / 50;

        // Set speed multiplier based on how close the click was
        fish.speedMultiplier = Math.min(3, fearFactor);
        fish.speedResetTimer = 60; // Reset after ~1 second

        // Set new target away from click point
        if (distance > 0) {
          // Get direction away from click
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Set target position away from click
          fish.targetX = fish.x + dirX * 300;
          fish.targetY = fish.y + dirY * 300;

          // Immediate movement away (startled reaction)
          fish.x += dirX * 10 * fish.speedMultiplier;
          fish.y += dirY * 10 * fish.speedMultiplier;

          // Make sure they stay in bounds
          fish.targetX = Math.max(fish.type.size, Math.min(canvas.width - fish.type.size, fish.targetX));
          fish.targetY = Math.max(fish.type.size, Math.min(canvas.height - fish.type.size - 30, fish.targetY));
        }
      }
    });
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling

    if (!canvasRef.current || e.touches.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Use the same logic as click handler
    // Create bubbles around touch point
    for (let i = 0; i < 15; i++) {
      bubblesRef.current.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        size: 2 + Math.random() * 8,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }

    // Make fish react to the touch by swimming away faster
    fishesRef.current.forEach(fish => {
      const dx = fish.x - x;
      const dy = fish.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 200) {
        // Calculate fear factor based on proximity
        const fearFactor = 1 + (200 - distance) / 40;

        // Set speed multiplier based on how close the touch was
        fish.speedMultiplier = Math.min(3, fearFactor);
        fish.speedResetTimer = 60;

        // Set new target away from touch point
        if (distance > 0) {
          const dirX = dx / distance;
          const dirY = dy / distance;

          fish.targetX = fish.x + dirX * 300;
          fish.targetY = fish.y + dirY * 300;

          // Immediate movement away
          fish.x += dirX * 15 * fish.speedMultiplier;
          fish.y += dirY * 15 * fish.speedMultiplier;

          // Make sure they stay in bounds
          fish.targetX = Math.max(fish.type.size, Math.min(canvas.width - fish.type.size, fish.targetX));
          fish.targetY = Math.max(fish.type.size, Math.min(canvas.height - fish.type.size - 30, fish.targetY));
        }
      }
    });
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">Finding Nemo Aquarium</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enjoy your underwater adventure with Nemo and friends! Click in the water to interact with the fish.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
        <div className="bg-blue-900 rounded-lg overflow-hidden mb-4 relative" style={{ height: '500px' }}>
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fish-count" className="text-lg">Number of Fish: {fishCount}</Label>
              </div>
              <Slider 
                id="fish-count"
                min={1} 
                max={12} 
                step={1} 
                value={[fishCount]} 
                onValueChange={(value) => setFishCount(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bubble-frequency" className="text-lg">Bubble Frequency: {bubbleFrequency}%</Label>
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
              <Label htmlFor="sound-toggle" className="text-lg">Enable Ocean Sounds</Label>
            </div>

            <Button asChild variant="default" className="w-full text-lg">
              <Link href="/calm">Back to Calm Mode</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}