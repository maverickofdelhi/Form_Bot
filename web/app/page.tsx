"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, User, Send, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function Home() {
    const [url, setUrl] = useState("");
    const [count, setCount] = useState(1);
    const [usePersona, setUsePersona] = useState(true);
    const [isSpeedMode, setIsSpeedMode] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<{ id: number; message: string; type: 'info' | 'success' | 'error' }[]>([]);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ id: Date.now(), message, type }, ...prev].slice(0, 20));
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return addLog("Please enter a valid URL", "error");

        setIsRunning(true);
        addLog(`Starting batch of ${count} for ${url}...`);

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, count, use_persona: usePersona, is_speed: isSpeedMode }),
            });

            const data = await response.json();
            if (data.success) {
                addLog(`Submissions successful: ${data.message}`, "success");
            } else {
                addLog(`Error: ${data.error}`, "error");
            }
        } catch (err) {
            addLog("Failed to reach server API", "error");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black">
            <div className="z-10 w-full max-w-4xl items-center justify-between font-mono text-sm lg:flex mb-8">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Form Bot Web&nbsp;
                    <code className="font-bold text-blue-400">v1.2.0-Web</code>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-6xl">
                {/* Left Side: Control Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 glass rounded-2xl p-8 space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-blue-500" />
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Control Center
                        </h1>
                    </div>

                    <form onSubmit={handleStart} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-500 tracking-widest font-bold">Target URL</label>
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://forms.office.com/..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500/50 transition-colors"
                                disabled={isRunning}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500 tracking-widest font-bold">Submissions</label>
                                <input
                                    type="number"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500/50"
                                    disabled={isRunning}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-gray-500 tracking-widest font-bold">Speed Scale</label>
                                <div className="flex items-center h-[50px] gap-2 px-3 bg-white/5 border border-white/10 rounded-lg">
                                    <Zap className={`w-4 h-4 ${isSpeedMode ? 'text-yellow-400' : 'text-gray-600'}`} />
                                    <span className="text-sm font-semibold">150ms/req</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Smart Persona Mode</h4>
                                    <p className="text-xs text-gray-500">Human-consistent responses</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUsePersona(!usePersona)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${usePersona ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${usePersona ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isRunning}
                            className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'}`}
                        >
                            {isRunning ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Launch Sequence
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Right Side: Log Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Live Feed
                        </h3>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                            STABLE
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-2">
                                    <p className="text-xs">Waiting for events...</p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3 items-start"
                                    >
                                        {log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                                        {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                                        {log.type === 'info' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />}
                                        <p className={`text-xs ${log.type === 'error' ? 'text-red-300' : log.type === 'success' ? 'text-green-300' : 'text-gray-300'}`}>
                                            {log.message}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </main>
    );
}
