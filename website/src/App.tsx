export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-10 md:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          ReadForge
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8">
          100% local text-to-speech. Premium voices, zero cloud dependency.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href="#platforms"
            className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 rounded-lg font-semibold transition text-center"
          >
            Download Now
          </a>
          <a
            href="#features"
            className="border border-slate-600 hover:border-slate-500 px-6 sm:px-8 py-3 rounded-lg font-semibold transition text-center"
          >
            Learn More
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Why ReadForge?</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4" role="img" aria-label="Lock">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
            <p className="text-slate-400">
              Your text never leaves your device. All processing happens locally.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4" role="img" aria-label="Infinity">∞</div>
            <h3 className="text-xl font-semibold mb-2">No Word Limits</h3>
            <p className="text-slate-400">
              Read unlimited text. No monthly caps, no premium voice restrictions.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4" role="img" aria-label="Bullseye">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Premium AI Voices</h3>
            <p className="text-slate-400">
              High-quality browser voices with premium Kokoro AI voices coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="container mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Available Everywhere</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Globe">🌐</div>
            <p className="font-semibold">Chrome Extension</p>
            <span className="inline-block mt-1 text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">Available</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Compass">🧭</div>
            <p className="font-semibold">Safari</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Laptop">💻</div>
            <p className="font-semibold">macOS</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Window">🪟</div>
            <p className="font-semibold">Windows</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Penguin">🐧</div>
            <p className="font-semibold">Linux</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Mobile phone">📱</div>
            <p className="font-semibold">iOS</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Robot">🤖</div>
            <p className="font-semibold">Android</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2" role="img" aria-label="Wrench">🔧</div>
            <p className="font-semibold">API</p>
            <span className="inline-block mt-1 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="container mx-auto px-3 sm:px-4 py-10 md:py-16 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl md:rounded-3xl my-4 md:my-8">
        <div className="text-center mb-6 md:mb-8">
          <span className="bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-medium">
            Coming Soon
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2">Interactive Reading Mode</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Control your reading with natural voice commands. Powered by PersonaPlex full duplex AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-400">Current Experience</h3>
            <div className="space-y-2 text-sm text-slate-500">
              <p>Click play button to start</p>
              <p>Click pause to stop</p>
              <p>Manually scroll to find your place</p>
              <p>Click again to resume</p>
            </div>
          </div>

          <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">With PersonaPlex</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-slate-400">You:</span> "Start reading"
              </div>
              <div className="bg-purple-900/50 p-2 rounded">
                <span className="text-purple-400">ReadForge:</span> "Starting from chapter 3..."
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-slate-400">You:</span> "Wait, what does that word mean?"
              </div>
              <div className="bg-purple-900/50 p-2 rounded">
                <span className="text-purple-400">ReadForge:</span> "It refers to..." <span className="text-purple-400/60">[explains, then resumes]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8 max-w-3xl mx-auto text-center">
          <div className="p-2 md:p-3">
            <p className="text-lg md:text-2xl font-bold text-purple-400">&lt;500ms</p>
            <p className="text-xs text-slate-400">Response Time</p>
          </div>
          <div className="p-2 md:p-3">
            <p className="text-lg md:text-2xl font-bold text-purple-400">Full Duplex</p>
            <p className="text-xs text-slate-400">Natural Interruption</p>
          </div>
          <div className="p-2 md:p-3">
            <p className="text-lg md:text-2xl font-bold text-purple-400">100%</p>
            <p className="text-xs text-slate-400">Local Processing</p>
          </div>
          <div className="p-2 md:p-3">
            <p className="text-lg md:text-2xl font-bold text-purple-400">Hands-Free</p>
            <p className="text-xs text-slate-400">Voice Control</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-center text-slate-400 text-sm mb-8 md:mb-12">Pre-launch pricing. Payment processing coming soon.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="text-slate-400 space-y-2 mb-6">
              <li>Piper voices (30+ languages, coming soon)</li>
              <li>All platforms</li>
              <li>100% offline</li>
            </ul>
            <button disabled className="w-full border border-slate-700 py-2 rounded-lg text-slate-500 cursor-not-allowed">
              Get Started
            </button>
          </div>
          <div className="bg-blue-900 p-6 rounded-xl border-2 border-blue-500">
            <h3 className="text-xl font-semibold mb-2">Personal</h3>
            <p className="text-3xl font-bold mb-4">$59<span className="text-lg font-normal">/year</span></p>
            <p className="text-sm text-slate-300 mb-4">or $99 lifetime</p>
            <ul className="text-slate-300 space-y-2 mb-6">
              <li>Kokoro premium voices</li>
              <li>Voice cloning</li>
              <li>Priority support</li>
            </ul>
            <button disabled className="w-full bg-slate-600 py-2 rounded-lg font-semibold text-slate-400 cursor-not-allowed">
              Subscribe
            </button>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <p className="text-3xl font-bold mb-4">$129<span className="text-lg font-normal">/year</span></p>
            <ul className="text-slate-400 space-y-2 mb-6">
              <li>Voice design</li>
              <li>API access</li>
              <li>Commercial license</li>
            </ul>
            <button disabled className="w-full border border-slate-700 py-2 rounded-lg text-slate-500 cursor-not-allowed">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-700 text-center text-slate-400">
        <p>&copy; 2026 ReadForge. All rights reserved.</p>
      </footer>
    </div>
  );
}
