"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { GraduationCap, Mic, MicOff, Loader2, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { Activity as Waveform } from "lucide-react";
import Link from "next/link";
import { GoogleGenAI, Modality } from "@google/genai";
import { toast } from "sonner";

export default function AITutor() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    const sessionRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const sourceNodeRef = useRef(null);

    // Auto-scroll logic for text fallback
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

    // Audio Playback Logic
    const playNextAudio = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) {
            return;
        }

        isPlayingRef.current = true;
        const audioData = audioQueueRef.current.shift();

        try {
            if (audioContextRef.current.state === "suspended") {
                await audioContextRef.current.resume();
            }

            // Base64 to ArrayBuffer -> PCM to AudioBuffer
            const byteCharacters = atob(audioData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const audioBufferResult = await audioContextRef.current.decodeAudioData(byteArray.buffer);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferResult;
            source.connect(audioContextRef.current.destination);
            sourceNodeRef.current = source;

            source.onended = () => {
                isPlayingRef.current = false;
                sourceNodeRef.current = null;
                playNextAudio();
            };

            source.start();
        } catch (e) {
            console.error("Audio playback error:", e);
            isPlayingRef.current = false;
            playNextAudio();
        }
    };

    // Microphone Capture logic (Simplified for demonstration as PCM encoding is complex)
    // In a robust app, you would use AudioWorklet to convert float32 to PCM16
    const startRecording = async (session) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const source = audioCtx.createMediaStreamSource(stream);

            // using ScriptProcessorNode for simplicity over worklets in this specific file
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!isSessionActive) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 to PCM Int16
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert to Base64
                const uint8 = new Uint8Array(pcmData.buffer);
                let binary = '';
                for (let i = 0; i < uint8.byteLength; i++) {
                    binary += String.fromCharCode(uint8[i]);
                }
                const b64Data = btoa(binary);

                try {
                    session.send({
                        realtimeInput: { mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: b64Data }] }
                    });
                } catch (e) {
                    // Ignore send errors if closing
                }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
        } catch (e) {
            console.error("Microphone access failed", e);
            setError("Microphone access is required for the AI Tutor.");
            stopSession();
        }
    };

    const startSession = async () => {
        setError(null);
        setIsConnecting(true);
        setMessages([]);

        if (!API_KEY) {
            setError("API Key is missing.");
            setIsConnecting(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const config = {
                responseModalities: [Modality.AUDIO],
                systemInstruction: "You are Voyager AI Tutor. You help the user understand concepts by talking. Always be concise, helpful, and use an encouraging voice. Do not use markdown since you are speaking.",
            };

            const session = await ai.live.connect({
                model: 'gemini-2.0-flash-exp', // the current model supporting live API well
                config: config,
                onopen: () => {
                    setIsConnecting(false);
                    setIsSessionActive(true);
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                    startRecording(session);

                    // Say hello
                    session.send({
                        clientContent: { turns: [{ role: "user", parts: [{ text: "Hello AI Tutor, let's begin." }] }] }
                    });
                },
                onmessage: (message) => {
                    // If text response comes
                    if (message?.serverContent?.modelTurn?.parts) {
                        message.serverContent.modelTurn.parts.forEach(part => {
                            if (part.text) {
                                setMessages(prev => [...prev, { role: "bot", content: part.text }]);
                            }
                            if (part.inlineData && part.inlineData.mimeType.startsWith("audio")) {
                                audioQueueRef.current.push(part.inlineData.data);
                                playNextAudio();
                            }
                        });
                    }
                },
                onerror: (e) => {
                    console.error("Gemini Error:", e);
                    setError("Connection error: " + (e.message || "Unknown issue"));
                    stopSession();
                },
                onclose: () => {
                    console.log("Gemini session closed");
                    stopSession();
                }
            });

            sessionRef.current = session;

        } catch (e) {
            console.error("Failed to start session:", e);
            setError("Failed to initialize the Gemini Live API. Please check your API key and permissions.");
            setIsConnecting(false);
        }
    };

    const stopSession = () => {
        if (sessionRef.current) {
            try {
                sessionRef.current.close();
            } catch (e) { }
            sessionRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }

        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsSessionActive(false);
        setIsConnecting(false);
    };

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] w-full font-sans text-ev-on-surface bg-ev-surface container mx-auto px-4 md:px-8 pt-8 pb-16">
            {/* Header */}
            <div className="mb-8 flex flex-col max-w-4xl mx-auto w-full">
                <Link href="/workspace/ai-tools" className="text-sm font-bold text-ev-on-surface-variant hover:text-ev-primary mb-4 flex items-center gap-1 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Hub
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#191c1a] dark:text-[#f8faf6] flex items-center gap-3">
                        <GraduationCap className="w-10 h-10 text-ev-tertiary" /> AI Tutor
                    </h1>
                    <div className="bg-[#bcf540]/20 text-[#4e6354] dark:text-[#bcf540] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[#bcf540]/30 hidden md:block">
                        Live Voice Audio Powered
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col">

                {error && (
                    <div className="bg-red-500/10 border-l-4 border-l-red-500 p-4 rounded-xl mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-500 text-sm">Connection Issue</h3>
                            <p className="text-sm font-medium text-ev-on-surface-variant max-w-2xl">{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-white dark:bg-[#1a231d] rounded-[3rem] border border-[#e1e3df] dark:border-white/5 shadow-lg p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">

                    {/* Dynamic Background Pulse if Active */}
                    {isSessionActive && (
                        <>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bcf540]/5 rounded-full blur-[100px] animate-pulse"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-ev-primary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </>
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center">

                        {/* Central Avatar / Visualization */}
                        <div className={`w-40 h-40 rounded-full mb-8 flex items-center justify-center relative transition-all duration-700 ${isSessionActive ? 'scale-110 shadow-[0_0_60px_rgba(188,245,64,0.3)]' : 'bg-[#e7eee8] dark:bg-[#1f2b23] shadow-inner'}`}>
                            {isSessionActive && (
                                <div className="absolute inset-0 rounded-full border-4 border-[#bcf540] border-t-transparent animate-spin opacity-50"></div>
                            )}

                            {isSessionActive ? (
                                <div className="w-36 h-36 bg-[#212121] rounded-full flex items-center justify-center overflow-hidden">
                                    {/* Abstract Visualization */}
                                    <Waveform className="w-16 h-16 text-[#bcf540] animate-pulse" />
                                </div>
                            ) : (
                                <GraduationCap className="text-ev-primary dark:text-[#bcf540] w-16 h-16 opacity-80" />
                            )}
                        </div>

                        <h2 className="text-3xl font-extrabold text-ev-on-surface mb-3">
                            {isConnecting ? "Connecting to Voyager..." : isSessionActive ? "Voyager is Listening" : "Start your tutoring session"}
                        </h2>
                        <p className="font-medium text-ev-on-surface-variant mb-12 max-w-md">
                            {isSessionActive
                                ? "Speak into your microphone. Voyager will process your audio in real-time and respond naturally."
                                : "Have a real-time voice conversation with our advanced AI Tutor models to accelerate your learning."}
                        </p>

                        {/* Actions */}
                        {isSessionActive ? (
                            <Button
                                onClick={stopSession}
                                className="rounded-full bg-red-500 hover:bg-red-600 text-white h-16 px-10 font-bold text-lg shadow-lg flex items-center gap-3 transition-transform hover:scale-105"
                            >
                                <MicOff className="w-6 h-6" /> End Session
                            </Button>
                        ) : (
                            <Button
                                onClick={startSession}
                                disabled={isConnecting}
                                className="rounded-full bg-ev-primary hover:bg-[#bcf540] hover:text-[#191c1a] text-white h-16 px-10 font-extrabold text-lg shadow-[0_10px_30px_rgba(78,99,84,0.3)] disabled:opacity-50 flex items-center gap-3 transition-all duration-300 hover:scale-105"
                            >
                                {isConnecting ? (
                                    <><Loader2 className="w-6 h-6 animate-spin" /> Connecting...</>
                                ) : (
                                    <><Mic className="w-6 h-6" /> Start Voice Session</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Transcript (Optional/Hidden for minimal UI but useful for debugging) */}
                {messages.length > 0 && isSessionActive && (
                    <div className="mt-8 bg-white dark:bg-[#1a231d] border border-[#e1e3df] dark:border-white/5 rounded-3xl p-6 min-h-[100px] shadow-sm max-h-40 overflow-y-auto">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-ev-on-surface-variant mb-4">Live Transcript</h3>
                        <div className="space-y-2">
                            {messages.map((m, i) => (
                                <div key={i} className={`text-sm font-medium ${m.role === 'bot' ? 'text-ev-primary dark:text-[#bcf540]' : 'text-ev-on-surface'}`}>
                                    {m.role === 'bot' ? 'Voyager: ' : 'You: '} {m.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
