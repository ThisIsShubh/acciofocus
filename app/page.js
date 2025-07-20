
import Navbar from "../components/navbar";
import Link from "next/link";
import { FaCheck, FaChartLine, FaUsers, FaHeadphones, FaClock, FaTrophy, FaLeaf, FaUserFriends, FaLock } from "react-icons/fa";
import { IoMdRocket } from "react-icons/io";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="pt-20 pb-16 flex flex-col items-center text-center px-6">
       {/* Hero section */}
        <section
          className="w-full h-[80vh] p-8 flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden rounded-2xl shadow-lg"
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


        {/* Solo section */}
        <section className="w-full max-w-7xl mx-auto px-4 py-12 ">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-20">
            {/* Text Content */}
            <div className="flex-1 flex flex-col items-start gap-2 text-left md:text-left">
              <h3 className="text-3xl md:text-4xl text-green-600 font-bold mb-2">Enter Focus Mode Instantly</h3>
              <p className="text-gray-700 text-base md:text-lg mb-4">Don’t want to sign up? No problem. Start a solo study session right away with all the tools you need to stay on track. Designed for deep work. No login. No distractions. Just focus.</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-6">
                <li>Distraction-free Pomodoro timer</li>
                <li>Ambient soundscapes for deep focus</li>
                <li>Task checklist for your session</li>
                <li>Session stats and progress</li>
              </ul>
              <Link href="/study/solo" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition text-lg">
                <IoMdRocket className="text-2xl" />
                Start Solo Session
              </Link>
            </div>
            {/* Image */}
            <div className="flex justify-center mb-6 md:mb-0">
              <img src="/D.png" alt="Solo Session Illustration" className="w-full max-w-xs md:max-w-sm h-auto object-contain drop-shadow-lg" />
            </div>
          </div>
        </section>

       {/* Features Section */}
        <section className="w-full py-16 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-500 mb-4">Supercharge Your Study Sessions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Accio Focus provides all the tools you need to eliminate distractions and maximize productivity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaClock className="text-3xl text-green-300" />}
              title="Smart Pomodoro Timer"
              description="Customizable focus sessions with intelligent breaks to maintain peak concentration."
            />
            <FeatureCard 
              icon={<FaChartLine className="text-3xl text-green-300" />}
              title="Progress Dashboard"
              description="Track your study habits, set goals, and visualize your learning journey."
            />
            <FeatureCard 
              icon={<FaUsers className="text-3xl text-green-300" />}
              title="Study Rooms"
              description="Collaborate with friends or join public rooms to stay motivated together."
            />
            <FeatureCard 
              icon={<FaHeadphones className="text-3xl text-green-300" />}
              title="Ambient Soundscapes"
              description="Choose from rain, cafe, forest, and white noise to create your perfect study environment."
            />
            <FeatureCard 
              icon={<FaLock className="text-3xl text-green-300" />}
              title="Focus Mode"
              description="Temporarily block distracting websites during your study sessions."
            />
            <FeatureCard 
              icon={<FaUserFriends className="text-3xl text-green-300" />}
              title="Study Buddies"
              description="Connect with friends, share progress, and keep each other accountable."
            />
          </div>
        </section>

        {/* Room section */}
        <section className="w-full max-w-7xl mx-auto px-4 py-12 ">
          <div className="flex flex-col-reverse md:flex-row-reverse items-center justify-between gap-10 md:gap-20">
            {/* Text Content */}
            <div className="flex-1 flex flex-col items-end gap-2 text-right md:text-right">
              <h3 className="text-3xl md:text-4xl text-green-600 font-bold mb-2">Study Together, Stay Accountable</h3>
              <p className="text-gray-700 text-base md:text-lg mb-4">Boost motivation and beat procrastination with our collaborative study rooms. Whether you're cramming for finals or tackling your daily goals — you're never alone.</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-6">
                <li>Join public rooms to meet new study partners</li>
                <li>Create private rooms to focus with friends</li>
                <li>See live timers, who's active, and what they're working on</li>
                <li>Share goals, track progress, and cheer each other on</li>
              </ul>
              <Link href="/study/solo" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition text-lg">
                <FaUsers className="text-2xl" />
                Check out Rooms
              </Link>
            </div>
            {/* Image */}
            <div className="flex justify-center mb-6 md:mb-0">
              <img src="/A.png" alt="Solo Session Illustration" className="w-full max-w-xs md:max-w-sm h-auto object-contain drop-shadow-lg" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-green-500 mb-4">How Accio Focus Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Achieve laser focus in just three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <StepCard 
                number="1"
                title="Start Your Session"
                description="Choose between a solo session or join/create a study room. Customize your timer, sounds, and environment."
              />
              <StepCard 
                number="2"
                title="Focus & Study"
                description="Dive into your work with our distraction-free interface. Track tasks and manage your time effectively."
              />
              <StepCard 
                number="3"
                title="Track Progress"
                description="Review your session analytics, earn achievements, and see your progress over time."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Proven Results</h2>
              <p className="text-lg text-white-200 max-w-3xl mx-auto">
                Join our community of focused learners
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard 
                value="500K+"
                label="Active Users"
              />
              <StatCard 
                value="15M+"
                label="Study Hours"
              />
              <StatCard 
                value="92%"
                label="Report Increased Focus"
              />
              <StatCard 
                value="4.9/5"
                label="User Rating"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section className="w-full py-16 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Start for free, upgrade when you need more
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PricingCard 
              title="Free"
              price="$0"
              description="Perfect for trying out Accio Focus"
              features={[
                "Unlimited solo sessions",
                "Basic Pomodoro timer",
                "3 ambient sounds",
                "Session task list",
                "Basic stats dashboard"
              ]}
              cta="Get Started"
              highlight={false}
            />
            <PricingCard 
              title="Pro"
              price="$4.99"
              description="For serious learners"
              features={[
                "Everything in Free",
                "Advanced Pomodoro settings",
                "All ambient sounds",
                "YouTube background",
                "Detailed analytics",
                "Study room creation",
                "Friend system"
              ]}
              cta="Start Free Trial"
              highlight={true}
            />
            <PricingCard 
              title="Student"
              price="$2.99"
              description="Special discount for students"
              features={[
                "Everything in Pro",
                "Student ID verification required",
                "Extended session history",
                "Priority support",
                "Custom themes"
              ]}
              cta="Verify Student Status"
              highlight={false}
            />
          </div>
        </section> */}

                {/* Testimonials */}
        <section className="w-full py-16 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-500 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of students and professionals who have transformed their study habits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Medical Student"
              quote="Accio Focus helped me double my study efficiency. The Pomodoro technique combined with ambient sounds is a game-changer!"
              avatar="/avatar1.png"
            />
            <TestimonialCard 
              name="Michael Chen"
              role="Software Engineer"
              quote="The study rooms feature keeps me accountable. Studying with friends remotely has never been easier or more productive."
              avatar="/avatar2.png"
            />
            <TestimonialCard 
              name="Emma Rodriguez"
              role="Graphic Designer"
              quote="I've tried countless productivity apps, but Accio Focus is the only one that actually helped me build consistent study habits."
              avatar="/avatar3.png"
            />
          </div>
        </section>

        {/* Final CTA */}
        <section 
          className="w-full py-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl relative overflow-hidden"
          style={{
            backgroundImage: 'url(/3.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '340px',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 z-0 rounded-2xl" />
          <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Study Habits?</h2>
            <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
              Join thousands of students and professionals who have found their focus with Accio Focus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/(auth)/signup" className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg shadow-lg hover:bg-green-50 transition transform hover:-translate-y-1">
                Join Now
              </Link>
              <Link href="/study/solo" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">
                Study
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-green-500 mr-2">Accio</span>Focus
              </h3>
              <p className="text-gray-400 mb-4">
                The ultimate focus platform for students and lifelong learners.
              </p>
              <div className="flex space-x-4">
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/study/solo">Solo Study</Link></li>
                <li><Link href="/study/rooms">Study Rooms</Link></li>
                <li><Link href="/download">Download</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/guides">Study Guides</Link></li>
                <li><Link href="/community">Community</Link></li>
                <li><Link href="/support">Support</Link></li>
                <li><Link href="/faq">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2023 Accio Focus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Components
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg relative border border-green-100">
    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
      {number}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ name, role, quote, avatar }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
    <div className="flex items-center mb-4">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
      <div className="ml-4">
        <h4 className="font-bold text-gray-800">{name}</h4>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>
    </div>
    <p className="text-gray-600 italic">"{quote}"</p>
    <div className="flex mt-4 text-amber-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold mb-2">{value}</div>
    <div className="text-blue-200 text-lg">{label}</div>
  </div>
);

const PricingCard = ({ title, price, description, features, cta, highlight }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${highlight ? "border-green-500 transform -translate-y-2 shadow-green-200" : "border-gray-100"}`}>
    {highlight && (
      <div className="bg-green-500 text-white text-center py-2 font-bold">
        MOST POPULAR
      </div>
    )}
    <div className="p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <div className="text-4xl font-bold text-gray-900 mb-4">{price}<span className="text-lg font-normal text-gray-600">/month</span></div>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <FaCheck className="text-green-500 mr-2" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-3 rounded-lg font-bold ${highlight ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
        {cta}
      </button>
    </div>
  </div>
);

const SocialIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
    </svg>
  </div>
);
