# SDD-003: macOS Desktop Application

**Feature:** macOS Menu Bar App with Document Reader
**Phase:** 1C
**Priority:** P0
**Status:** Draft

---

## Overview

Build a macOS menu bar application that provides text-to-speech for PDFs and EPUBs with a Python TTS server backend. The app will serve as the foundation for ReadForge desktop and can relay TTS to browser extensions.

## Goals

1. Menu bar app with quick access to TTS controls
2. PDF and EPUB reader with synchronized text highlighting
3. Python TTS server running Kokoro-82M with Metal/MPS acceleration
4. Reading position persistence across sessions
5. Global keyboard shortcuts

## Technical Specification

### Project Structure

```
desktop-mac/
├── ReadForge/
│   ├── App/
│   │   ├── ReadForgeApp.swift
│   │   ├── AppDelegate.swift
│   │   └── AppState.swift
│   ├── Views/
│   │   ├── MenuBarView.swift
│   │   ├── ReaderWindow/
│   │   │   ├── ReaderWindowController.swift
│   │   │   ├── PDFReaderView.swift
│   │   │   ├── EPUBReaderView.swift
│   │   │   └── PlayerControlsView.swift
│   │   ├── Components/
│   │   │   ├── VoicePicker.swift
│   │   │   ├── SpeedSlider.swift
│   │   │   └── ProgressIndicator.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   ├── Services/
│   │   ├── TTSService.swift
│   │   ├── DocumentService.swift
│   │   ├── ReadingPositionService.swift
│   │   └── KeyboardShortcutService.swift
│   ├── Models/
│   │   ├── Document.swift
│   │   ├── ReadingPosition.swift
│   │   └── Voice.swift
│   └── Resources/
│       └── Assets.xcassets
├── ReadForge.xcodeproj
├── tts-server/
│   ├── server.py
│   ├── kokoro_engine.py
│   ├── requirements.txt
│   └── models/
│       └── .gitkeep
└── scripts/
    ├── build.sh
    └── package.sh
```

### App Lifecycle

```swift
// ReadForgeApp.swift
import SwiftUI

@main
struct ReadForgeApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var appState = AppState.shared

    var body: some Scene {
        // Menu bar only - no dock icon
        MenuBarExtra {
            MenuBarView()
                .environmentObject(appState)
        } label: {
            Image(systemName: appState.isPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
        }
        .menuBarExtraStyle(.window)

        // Reader window (opened on demand)
        WindowGroup(id: "reader") {
            ReaderWindow()
                .environmentObject(appState)
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 800, height: 600)

        // Settings window
        Settings {
            SettingsView()
                .environmentObject(appState)
        }
    }
}

// AppDelegate.swift
import AppKit
import ServiceManagement

class AppDelegate: NSObject, NSApplicationDelegate {
    var ttsServer: Process?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hide dock icon
        NSApp.setActivationPolicy(.accessory)

        // Start TTS server
        startTTSServer()

        // Register global shortcuts
        KeyboardShortcutService.shared.register()

        // Check for updates
        checkForUpdates()
    }

    func applicationWillTerminate(_ notification: Notification) {
        // Stop TTS server
        ttsServer?.terminate()
    }

    private func startTTSServer() {
        let serverPath = Bundle.main.path(forResource: "server", ofType: "py", inDirectory: "tts-server")
        let pythonPath = "/usr/bin/python3"

        ttsServer = Process()
        ttsServer?.executableURL = URL(fileURLWithPath: pythonPath)
        ttsServer?.arguments = [serverPath!]
        ttsServer?.environment = [
            "READFORGE_PORT": "8765",
            "READFORGE_MODEL_PATH": modelPath()
        ]

        do {
            try ttsServer?.run()
        } catch {
            print("Failed to start TTS server: \(error)")
        }
    }

    private func modelPath() -> String {
        return Bundle.main.path(forResource: "kokoro-82m", ofType: "onnx", inDirectory: "models") ?? ""
    }
}
```

### Menu Bar View

```swift
// Views/MenuBarView.swift
import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject var appState: AppState
    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 12) {
            // Quick controls
            HStack {
                Button(action: { appState.togglePlayPause() }) {
                    Image(systemName: appState.isPlaying ? "pause.fill" : "play.fill")
                        .font(.title2)
                }
                .buttonStyle(.plain)

                Button(action: { appState.skipBackward() }) {
                    Image(systemName: "backward.fill")
                }
                .buttonStyle(.plain)

                Button(action: { appState.skipForward() }) {
                    Image(systemName: "forward.fill")
                }
                .buttonStyle(.plain)

                Spacer()

                // Speed indicator
                Text("\(appState.speed, specifier: "%.1f")x")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)

            // Progress (if playing)
            if appState.isPlaying || appState.currentDocument != nil {
                VStack(alignment: .leading, spacing: 4) {
                    Text(appState.currentDocument?.title ?? "No document")
                        .font(.caption)
                        .lineLimit(1)

                    ProgressView(value: appState.progress)
                        .progressViewStyle(.linear)
                }
                .padding(.horizontal)
            }

            Divider()

            // Voice selection
            VoicePicker(selectedVoice: $appState.selectedVoice)
                .padding(.horizontal)

            // Speed slider
            SpeedSlider(speed: $appState.speed)
                .padding(.horizontal)

            Divider()

            // Quick actions
            VStack(spacing: 8) {
                Button("Open Document...") {
                    openDocument()
                }
                .keyboardShortcut("o", modifiers: .command)

                Button("Read from Clipboard") {
                    readClipboard()
                }
                .keyboardShortcut("v", modifiers: [.command, .shift])

                if appState.recentDocuments.count > 0 {
                    Menu("Recent Documents") {
                        ForEach(appState.recentDocuments) { doc in
                            Button(doc.title) {
                                appState.openDocument(doc)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal)

            Divider()

            // Footer
            HStack {
                Button("Settings...") {
                    NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
                }
                .keyboardShortcut(",", modifiers: .command)

                Spacer()

                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .keyboardShortcut("q", modifiers: .command)
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .frame(width: 280)
    }

    private func openDocument() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.pdf, .epub]
        panel.allowsMultipleSelection = false

        if panel.runModal() == .OK, let url = panel.url {
            appState.openDocument(at: url)
        }
    }

    private func readClipboard() {
        if let text = NSPasteboard.general.string(forType: .string) {
            appState.readText(text)
        }
    }
}
```

### PDF Reader View

```swift
// Views/ReaderWindow/PDFReaderView.swift
import SwiftUI
import PDFKit

struct PDFReaderView: View {
    @EnvironmentObject var appState: AppState
    let document: PDFDocument

    @State private var currentPage = 0
    @State private var highlightedRange: NSRange?

    var body: some View {
        VStack(spacing: 0) {
            // PDF view
            PDFKitRepresentable(
                document: document,
                currentPage: $currentPage,
                highlightedRange: $highlightedRange
            )

            // Player controls
            PlayerControlsView()
        }
        .onReceive(appState.$currentSentenceIndex) { index in
            updateHighlight(for: index)
        }
    }

    private func updateHighlight(for sentenceIndex: Int) {
        guard let sentences = appState.currentDocumentSentences,
              sentenceIndex < sentences.count else { return }

        let sentence = sentences[sentenceIndex]
        highlightedRange = NSRange(location: sentence.startOffset, length: sentence.text.count)

        // Navigate to correct page if needed
        if let page = findPage(containing: sentence.startOffset) {
            currentPage = page
        }
    }

    private func findPage(containing offset: Int) -> Int? {
        // Implementation to find which page contains the given text offset
        return nil
    }
}

struct PDFKitRepresentable: NSViewRepresentable {
    let document: PDFDocument
    @Binding var currentPage: Int
    @Binding var highlightedRange: NSRange?

    func makeNSView(context: Context) -> PDFView {
        let pdfView = PDFView()
        pdfView.document = document
        pdfView.autoScales = true
        pdfView.displayMode = .singlePageContinuous
        return pdfView
    }

    func updateNSView(_ pdfView: PDFView, context: Context) {
        // Update page
        if let page = document.page(at: currentPage) {
            pdfView.go(to: page)
        }

        // Update highlight
        pdfView.clearSelection()
        if let range = highlightedRange,
           let selection = document.findString(
               extractText(at: range),
               withOptions: .caseInsensitive
           ).first {
            pdfView.setCurrentSelection(selection, animate: true)
        }
    }

    private func extractText(at range: NSRange) -> String {
        // Extract text at range from document
        return ""
    }
}
```

### EPUB Reader View

```swift
// Views/ReaderWindow/EPUBReaderView.swift
import SwiftUI
import WebKit

struct EPUBReaderView: View {
    @EnvironmentObject var appState: AppState
    let epubURL: URL

    @State private var webView: WKWebView?
    @State private var currentChapter = 0
    @State private var chapters: [EPUBChapter] = []

    var body: some View {
        VStack(spacing: 0) {
            // Chapter navigation
            HStack {
                Button(action: previousChapter) {
                    Image(systemName: "chevron.left")
                }
                .disabled(currentChapter == 0)

                Text(chapters[safe: currentChapter]?.title ?? "Loading...")
                    .font(.headline)

                Button(action: nextChapter) {
                    Image(systemName: "chevron.right")
                }
                .disabled(currentChapter >= chapters.count - 1)
            }
            .padding()

            // WebView for EPUB content
            EPUBWebView(
                epubURL: epubURL,
                currentChapter: $currentChapter,
                chapters: $chapters,
                onSentenceHighlight: highlightSentence
            )

            // Player controls
            PlayerControlsView()
        }
        .onAppear {
            loadEPUB()
        }
    }

    private func loadEPUB() {
        // Parse EPUB and extract chapters
        let parser = EPUBParser()
        chapters = parser.parse(epubURL)
    }

    private func highlightSentence(_ index: Int) {
        // Send message to WebView to highlight sentence
        let js = "highlightSentence(\(index))"
        webView?.evaluateJavaScript(js)
    }

    private func previousChapter() {
        currentChapter = max(0, currentChapter - 1)
    }

    private func nextChapter() {
        currentChapter = min(chapters.count - 1, currentChapter + 1)
    }
}

struct EPUBChapter {
    let id: String
    let title: String
    let htmlContent: String
    let textContent: String
}
```

### TTS Service

```swift
// Services/TTSService.swift
import Foundation
import AVFoundation

class TTSService: ObservableObject {
    static let shared = TTSService()

    @Published var isPlaying = false
    @Published var currentSentenceIndex = 0
    @Published var availableVoices: [Voice] = []

    private var webSocket: URLSessionWebSocketTask?
    private var audioEngine = AVAudioEngine()
    private var playerNode = AVAudioPlayerNode()

    init() {
        setupAudioEngine()
        loadVoices()
    }

    private func setupAudioEngine() {
        audioEngine.attach(playerNode)
        audioEngine.connect(playerNode, to: audioEngine.mainMixerNode, format: nil)

        do {
            try audioEngine.start()
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }

    private func loadVoices() {
        availableVoices = [
            Voice(id: "af_heart", name: "Heart", language: "en", gender: .female),
            Voice(id: "af_bella", name: "Bella", language: "en", gender: .female),
            Voice(id: "am_adam", name: "Adam", language: "en", gender: .male),
            Voice(id: "am_michael", name: "Michael", language: "en", gender: .male),
        ]
    }

    func connect() {
        let url = URL(string: "ws://localhost:8765/ws/synthesize")!
        let session = URLSession(configuration: .default)
        webSocket = session.webSocketTask(with: url)
        webSocket?.resume()

        receiveMessages()
    }

    func synthesize(text: String, voice: String, speed: Double) async {
        let sentences = SentenceSplitter.split(text)

        for (index, sentence) in sentences.enumerated() {
            guard isPlaying else { break }

            await MainActor.run {
                currentSentenceIndex = index
            }

            let request = TTSRequest(
                text: sentence.text,
                voiceId: voice,
                speed: speed
            )

            try? webSocket?.send(.string(request.json()))

            // Wait for audio to finish
            await waitForAudioCompletion()
        }

        await MainActor.run {
            isPlaying = false
        }
    }

    private func receiveMessages() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .data(let data):
                    self?.playAudioChunk(data)
                case .string(let text):
                    if text.contains("complete") {
                        // Sentence complete
                    }
                @unknown default:
                    break
                }

                // Continue receiving
                self?.receiveMessages()

            case .failure(let error):
                print("WebSocket error: \(error)")
            }
        }
    }

    private func playAudioChunk(_ data: Data) {
        // Convert raw PCM to audio buffer
        let format = AVAudioFormat(standardFormatWithSampleRate: 24000, channels: 1)!
        let frameCount = UInt32(data.count / 4) // Float32

        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount

        data.withUnsafeBytes { rawBuffer in
            let floatBuffer = rawBuffer.bindMemory(to: Float.self)
            buffer.floatChannelData?[0].initialize(from: floatBuffer.baseAddress!, count: Int(frameCount))
        }

        playerNode.scheduleBuffer(buffer)

        if !playerNode.isPlaying {
            playerNode.play()
        }
    }

    private func waitForAudioCompletion() async {
        while playerNode.isPlaying {
            try? await Task.sleep(nanoseconds: 50_000_000) // 50ms
        }
    }

    func pause() {
        isPlaying = false
        playerNode.pause()
    }

    func resume() {
        isPlaying = true
        playerNode.play()
    }

    func stop() {
        isPlaying = false
        playerNode.stop()
        currentSentenceIndex = 0
    }
}

struct TTSRequest: Codable {
    let text: String
    let voiceId: String
    let speed: Double

    func json() -> String {
        let encoder = JSONEncoder()
        let data = try! encoder.encode(self)
        return String(data: data, encoding: .utf8)!
    }
}
```

### Python TTS Server

```python
# tts-server/server.py
import asyncio
import json
import os
import struct
from pathlib import Path

import numpy as np
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from kokoro_engine import KokoroEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize TTS engine
MODEL_PATH = os.environ.get("READFORGE_MODEL_PATH", "models/kokoro-82m.onnx")
engine = KokoroEngine(MODEL_PATH)

@app.websocket("/ws/synthesize")
async def websocket_synthesize(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)

            text = request.get("text", "")
            voice_id = request.get("voiceId", "af_heart")
            speed = request.get("speed", 1.0)

            # Synthesize audio
            audio = engine.synthesize(text, voice_id, speed)

            # Stream audio in chunks
            chunk_size = 4800  # 200ms at 24kHz
            for i in range(0, len(audio), chunk_size):
                chunk = audio[i:i + chunk_size]
                # Send as raw bytes (float32)
                await websocket.send_bytes(chunk.tobytes())

            # Send completion marker
            await websocket.send_text(json.dumps({"status": "complete"}))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_PATH}

@app.get("/voices")
async def list_voices():
    return engine.get_voices()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("READFORGE_PORT", "8765"))
    uvicorn.run(app, host="127.0.0.1", port=port)
```

```python
# tts-server/kokoro_engine.py
import numpy as np
import onnxruntime as ort

class KokoroEngine:
    def __init__(self, model_path: str):
        # Use CoreML on macOS for Metal acceleration
        providers = ["CoreMLExecutionProvider", "CPUExecutionProvider"]

        self.session = ort.InferenceSession(
            model_path,
            providers=providers
        )

        self.sample_rate = 24000
        self.voices = self._load_voices()

    def _load_voices(self):
        return [
            {"id": "af_heart", "name": "Heart", "language": "en", "gender": "female"},
            {"id": "af_bella", "name": "Bella", "language": "en", "gender": "female"},
            {"id": "af_nicole", "name": "Nicole", "language": "en", "gender": "female"},
            {"id": "am_adam", "name": "Adam", "language": "en", "gender": "male"},
            {"id": "am_michael", "name": "Michael", "language": "en", "gender": "male"},
            {"id": "bf_emma", "name": "Emma (British)", "language": "en-GB", "gender": "female"},
            {"id": "bm_george", "name": "George (British)", "language": "en-GB", "gender": "male"},
        ]

    def get_voices(self):
        return self.voices

    def synthesize(self, text: str, voice_id: str, speed: float = 1.0) -> np.ndarray:
        # Tokenize text
        tokens = self._tokenize(text)

        # Get voice embedding
        voice_embedding = self._get_voice_embedding(voice_id)

        # Run inference
        inputs = {
            "input_ids": tokens,
            "voice_embedding": voice_embedding,
            "speed": np.array([speed], dtype=np.float32)
        }

        outputs = self.session.run(None, inputs)
        audio = outputs[0].squeeze()

        return audio.astype(np.float32)

    def _tokenize(self, text: str) -> np.ndarray:
        # Kokoro uses a simple character-based tokenization
        # This is a simplified version - real implementation would use the proper tokenizer
        tokens = [ord(c) for c in text]
        return np.array([tokens], dtype=np.int64)

    def _get_voice_embedding(self, voice_id: str) -> np.ndarray:
        # Load voice embedding from file or use default
        # This is a placeholder - real implementation would load actual embeddings
        return np.zeros((1, 256), dtype=np.float32)
```

### Keyboard Shortcuts

```swift
// Services/KeyboardShortcutService.swift
import Foundation
import Carbon
import AppKit

class KeyboardShortcutService {
    static let shared = KeyboardShortcutService()

    private var eventHandler: EventHandlerRef?

    func register() {
        // Play/Pause: Cmd+Shift+P
        registerHotKey(keyCode: kVK_ANSI_P, modifiers: cmdKey | shiftKey) {
            AppState.shared.togglePlayPause()
        }

        // Read selection: Cmd+Shift+R
        registerHotKey(keyCode: kVK_ANSI_R, modifiers: cmdKey | shiftKey) {
            self.readSystemSelection()
        }

        // Speed up: Cmd+Shift+=
        registerHotKey(keyCode: kVK_ANSI_Equal, modifiers: cmdKey | shiftKey) {
            AppState.shared.increaseSpeed()
        }

        // Speed down: Cmd+Shift+-
        registerHotKey(keyCode: kVK_ANSI_Minus, modifiers: cmdKey | shiftKey) {
            AppState.shared.decreaseSpeed()
        }
    }

    private func registerHotKey(keyCode: Int, modifiers: Int, handler: @escaping () -> Void) {
        var hotKeyRef: EventHotKeyRef?
        var hotKeyID = EventHotKeyID(signature: OSType("RDFG".fourCharCodeValue), id: UInt32(keyCode))

        var eventType = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: OSType(kEventHotKeyPressed))

        let callback: EventHandlerUPP = { _, event, _ in
            handler()
            return noErr
        }

        InstallEventHandler(GetEventDispatcherTarget(), callback, 1, &eventType, nil, &eventHandler)
        RegisterEventHotKey(UInt32(keyCode), UInt32(modifiers), hotKeyID, GetEventDispatcherTarget(), 0, &hotKeyRef)
    }

    private func readSystemSelection() {
        // Get selection from frontmost app
        let script = """
        tell application "System Events"
            keystroke "c" using command down
        end tell
        """

        if let appleScript = NSAppleScript(source: script) {
            var error: NSDictionary?
            appleScript.executeAndReturnError(&error)

            // Wait a bit for clipboard to update
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                if let text = NSPasteboard.general.string(forType: .string) {
                    AppState.shared.readText(text)
                }
            }
        }
    }
}

extension String {
    var fourCharCodeValue: FourCharCode {
        var result: FourCharCode = 0
        for char in utf8.prefix(4) {
            result = (result << 8) + FourCharCode(char)
        }
        return result
    }
}
```

## Acceptance Criteria

### Functional
- [ ] Menu bar app appears in system menu bar
- [ ] PDF files open and display correctly
- [ ] EPUB files open and display correctly
- [ ] TTS playback works with all voices
- [ ] Text highlighting syncs with audio
- [ ] Speed control works (0.5x - 4x)
- [ ] Reading position persists across app restarts
- [ ] Global keyboard shortcuts work

### Performance
- [ ] App launches in < 2 seconds
- [ ] TTS latency < 500ms (first audio)
- [ ] Memory usage < 500MB
- [ ] CPU usage < 30% during playback

### Reliability
- [ ] TTS server auto-restarts on crash
- [ ] Graceful handling of corrupt PDFs/EPUBs
- [ ] Clean shutdown without orphan processes

## Dependencies

- macOS 13.0+ (Ventura)
- Python 3.11+
- onnxruntime-coreml
- fastapi
- uvicorn
- PDFKit (system framework)
- WebKit (system framework)

---

**Author:** ReadForge Team
**Created:** January 25, 2026
**Last Updated:** January 25, 2026
