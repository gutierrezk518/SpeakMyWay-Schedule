import { Link } from "wouter";

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Removed</h1>
        <p className="mb-6">Authentication has been temporarily disabled while migrating to Supabase.</p>
        <Link href="/">
          <a className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Home Page
          </a>
        </Link>
      </div>
    </div>
  );
}