
import Navbar from "../components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      <main className="pt-28 pb-16 flex flex-col items-center text-center px-4">
        <section className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">AccioFocus</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Boost your productivity with focused study rooms, solo sessions, and collaborative tools. Join a community of learners and achieve your goals together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/(auth)/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">
              Get Started
            </Link>
            <Link href="/(auth)/login" className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-semibold shadow hover:bg-blue-50 transition">
              Log In
            </Link>
          </div>
        </section>
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="bg-white/70 rounded-xl p-6 shadow flex flex-col items-center">
            <img src="/window.svg" alt="Solo Study" className="h-12 mb-3" />
            <h3 className="font-bold text-lg mb-1">Solo Study</h3>
            <p className="text-gray-600 text-sm">Focus in distraction-free solo rooms with productivity timers and progress tracking.</p>
          </div>
          <div className="bg-white/70 rounded-xl p-6 shadow flex flex-col items-center">
            <img src="/globe.svg" alt="Group Rooms" className="h-12 mb-3" />
            <h3 className="font-bold text-lg mb-1">Group Rooms</h3>
            <p className="text-gray-600 text-sm">Join or create study rooms, collaborate, and stay motivated with friends or peers.</p>
          </div>
          <div className="bg-white/70 rounded-xl p-6 shadow flex flex-col items-center">
            <img src="/vercel.svg" alt="Track Progress" className="h-12 mb-3" />
            <h3 className="font-bold text-lg mb-1">Track Progress</h3>
            <p className="text-gray-600 text-sm">Monitor your study stats, set goals, and celebrate your achievements over time.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
