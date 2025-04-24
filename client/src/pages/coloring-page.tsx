import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// List of images to color
const COLORING_IMAGES = [
  { id: 'world', name: 'World', src: '/coloring/world.svg' },
  { id: 'tiger', name: 'Tiger', src: '/coloring/tiger.svg' },
  { id: 'fish', name: 'Fish', src: '/coloring/fish.svg' },
];

// Color palette
const COLORS = [
  { id: 'red', value: '#ff6b6b', name: 'Red' },
  { id: 'orange', value: '#ff922b', name: 'Orange' },
  { id: 'yellow', value: '#ffd43b', name: 'Yellow' },
  { id: 'green', value: '#69db7c', name: 'Green' },
  { id: 'turquoise', value: '#66d9e8', name: 'Turquoise' },
  { id: 'blue', value: '#4dabf7', name: 'Blue' },
  { id: 'purple', value: '#da77f2', name: 'Purple' },
  { id: 'pink', value: '#faa2c1', name: 'Pink' },
  { id: 'brown', value: '#b08968', name: 'Brown' },
  { id: 'black', value: '#212529', name: 'Black' },
  { id: 'grey', value: '#adb5bd', name: 'Grey' },
  { id: 'white', value: '#ffffff', name: 'White' },
];

export default function ColoringPage() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedImage, setSelectedImage] = useState('world');
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Load the SVG content
  useEffect(() => {
    // For this demo, we'll create placeholder SVGs
    // In a real implementation, you would load actual SVG files
    const placeholderSvgs = {
      world: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="white" stroke="black" stroke-width="2" class="colorable" data-name="earth" /><path d="M 50,100 Q 75,70 100,100 T 150,100" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="continent" /></svg>',
      tiger: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="80" r="40" fill="white" stroke="black" stroke-width="2" class="colorable" data-name="head" /><circle cx="85" cy="70" r="5" fill="black" class="colorable" data-name="eye1" /><circle cx="115" cy="70" r="5" fill="black" class="colorable" data-name="eye2" /><path d="M 80,90 Q 100,105 120,90" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="mouth" /><path d="M 60,140 Q 100,180 140,140" fill="white" stroke="black" stroke-width="2" class="colorable" data-name="body" /><path d="M 70,140 L 50,180" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="leg1" /><path d="M 130,140 L 150,180" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="leg2" /></svg>',
      fish: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 50,100 Q 100,70 150,100 Q 100,130 50,100" fill="white" stroke="black" stroke-width="2" class="colorable" data-name="body" /><circle cx="70" cy="90" r="5" fill="black" class="colorable" data-name="eye" /><path d="M 150,100 L 180,80 L 180,120 Z" fill="white" stroke="black" stroke-width="2" class="colorable" data-name="tail" /><path d="M 100,70 L 100,50" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="fin1" /><path d="M 100,130 L 100,150" fill="none" stroke="black" stroke-width="2" class="colorable" data-name="fin2" /></svg>',
    };

    setSvgContent(placeholderSvgs[selectedImage as keyof typeof placeholderSvgs]);
  }, [selectedImage]);

  // Setup coloring functionality
  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    svgContainerRef.current.innerHTML = svgContent;
    const elements = svgContainerRef.current.querySelectorAll('.colorable');
    
    elements.forEach((element) => {
      element.addEventListener('click', (e) => {
        const target = e.target as SVGElement;
        if (target.getAttribute('fill') !== selectedColor) {
          target.setAttribute('fill', selectedColor);
        }
      });
    });

    return () => {
      elements.forEach((element) => {
        element.removeEventListener('click', () => {});
      });
    };
  }, [svgContent, selectedColor]);

  // Reset coloring - set all elements back to white
  const resetColoring = () => {
    if (!svgContainerRef.current) return;
    
    const elements = svgContainerRef.current.querySelectorAll('.colorable');
    elements.forEach((element) => {
      // Keep eyes black for the tiger
      if (element.getAttribute('data-name') === 'eye' || 
          element.getAttribute('data-name') === 'eye1' || 
          element.getAttribute('data-name') === 'eye2') {
        element.setAttribute('fill', 'black');
      } else {
        element.setAttribute('fill', 'white');
      }
    });
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">Coloring Page</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select colors and click on different parts of the image to color them in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
          <div className="bg-white rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            <div ref={svgContainerRef} className="w-full max-w-md mx-auto cursor-pointer"></div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <Tabs defaultValue="images">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="images" className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-medium">Choose an Image</h2>
                <RadioGroup
                  value={selectedImage}
                  onValueChange={setSelectedImage}
                  className="flex flex-col space-y-2"
                >
                  {COLORING_IMAGES.map((image) => (
                    <div key={image.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={image.id} id={`image-${image.id}`} />
                      <Label htmlFor={`image-${image.id}`}>{image.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="colors">
              <h2 className="text-lg font-medium mb-3">Choose a Color</h2>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((color) => (
                  <div 
                    key={color.id}
                    className={`
                      h-12 rounded-md cursor-pointer flex items-center justify-center
                      ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                    style={{ backgroundColor: color.value, color: color.id === 'white' ? '#333' : 'white' }}
                    onClick={() => setSelectedColor(color.value)}
                  >
                    <span className="text-xs font-medium">{color.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-2">
            <Button onClick={resetColoring} variant="outline" className="w-full">
              Reset Coloring
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