import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CalmPage() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-3">Calm Mode</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose an activity to help you relax and calm down. These sensory activities are designed to provide a relaxing break.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/calm/coloring">
          <a className="block h-full">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="rounded-full bg-purple-100 p-4 mb-4">
                    <i className="ri-brush-line text-4xl text-purple-600"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">Coloring Pages</h2>
                  <p className="text-gray-500 text-center text-sm">
                    Color pictures of the world, animals, and more to help focus your mind.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </a>
        </Link>

        <Link href="/calm/aquarium">
          <a className="block h-full">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-4 mb-4">
                    <i className="ri-fish-line text-4xl text-blue-600"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">Aquarium</h2>
                  <p className="text-gray-500 text-center text-sm">
                    Watch peaceful fish swim in a virtual aquarium with calming sounds.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </a>
        </Link>

        <Link href="/calm/bubbles">
          <a className="block h-full">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-4 mb-4">
                    <i className="ri-bubble-chart-line text-4xl text-green-600"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-center mb-2">Bubble Pop</h2>
                  <p className="text-gray-500 text-center text-sm">
                    Pop virtual bubble wrap for a satisfying sensory experience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </a>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}