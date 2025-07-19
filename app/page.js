
import Navbar from "../components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="pt-20 pb-16 flex flex-col items-center text-center px-4">
        <section
          className="w-full h-[70vh] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden rounded-2xl shadow-lg"
          style={{
            backgroundImage: 'url(/2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '340px',
          }}
        >
          <div className="w-full p-0 md:p-8 ">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-left md:text-left">
              Welcome to <span className="text-green-500">AccioFocus!</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 text-left md:text-left">
              Boost your productivity with focused study rooms, solo sessions, and collaborative tools. Join a community of learners and achieve your goals together!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-8">
              <Link href="/(auth)/signup" className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition">
                Get Started
              </Link>
              <Link href="/(auth)/login" className="px-6 py-3 bg-white border border-green-600 text-green-500 rounded-lg font-semibold shadow hover:bg-green-50 transition">
                Log In
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
             </div>
        </section>
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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
