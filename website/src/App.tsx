export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">
          ReadForge
        </h1>
        <p className="text-2xl text-slate-300 mb-8">
          100% local text-to-speech. Premium voices, zero cloud dependency.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="#download"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
          >
            Download Now
          </a>
          <a
            href="#features"
            className="border border-slate-600 hover:border-slate-500 px-8 py-3 rounded-lg font-semibold transition"
          >
            Learn More
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why ReadForge?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
            <p className="text-slate-400">
              Your text never leaves your device. All processing happens locally.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4">∞</div>
            <h3 className="text-xl font-semibold mb-2">No Word Limits</h3>
            <p className="text-slate-400">
              Read unlimited text. No monthly caps, no premium voice restrictions.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Premium AI Voices</h3>
            <p className="text-slate-400">
              Kokoro-82M voices ranked #1 on TTS Arena. Natural, expressive audio.
            </p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Available Everywhere</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🌐</div>
            <p className="font-semibold">Chrome</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🧭</div>
            <p className="font-semibold">Safari</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">💻</div>
            <p className="font-semibold">macOS</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🪟</div>
            <p className="font-semibold">Windows</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🐧</div>
            <p className="font-semibold">Linux</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">📱</div>
            <p className="font-semibold">iOS</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🤖</div>
            <p className="font-semibold">Android</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🔧</div>
            <p className="font-semibold">API</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-3xl my-8">
        <div className="text-center mb-8">
          <span className="bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-medium">
            Coming Soon
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">Interactive Reading Mode</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Control your reading with natural voice commands. Powered by PersonaPlex full duplex AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto text-center">
          <div className="p-3">
            <p className="text-2xl font-bold text-purple-400">&lt;500ms</p>
            <p className="text-xs text-slate-400">Response Time</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-purple-400">Full Duplex</p>
            <p className="text-xs text-slate-400">Natural Interruption</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-purple-400">100%</p>
            <p className="text-xs text-slate-400">Local Processing</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-purple-400">Hands-Free</p>
            <p className="text-xs text-slate-400">Voice Control</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="text-slate-400 space-y-2 mb-6">
              <li>Piper voices (30+ languages)</li>
              <li>All platforms</li>
              <li>100% offline</li>
            </ul>
            <button className="w-full border border-slate-600 py-2 rounded-lg">
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
            <button className="w-full bg-blue-600 py-2 rounded-lg font-semibold">
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
            <button className="w-full border border-slate-600 py-2 rounded-lg">
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
