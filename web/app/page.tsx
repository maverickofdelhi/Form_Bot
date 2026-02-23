"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, User, Send, Settings, CheckCircle, AlertCircle, History, Terminal } from "lucide-react";

export default function Home() {
    const [url, setUrl] = useState("https://divyansh1920.github.io/MRA/");
    const [count, setCount] = useState(5);
    const [usePersona, setUsePersona] = useState(true);
    const [isSpeedMode, setIsSpeedMode] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<{ id: number; message: string; type: 'info' | 'success' | 'error' }[]>([]);
    const [history, setHistory] = useState<{ id: string; url: string; count: number; date: string }[]>([]);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ id: Date.now(), message, type }, ...prev].slice(0, 30));
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return addLog("Please enter a valid URL", "error");

        setIsRunning(true);
        addLog(`Initiating sequence for ${count} responses...`, "info");

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, count, use_persona: usePersona, is_speed: isSpeedMode }),
            });

            const data = await response.json();
            if (data.success) {
                addLog(`Success: ${data.message}`, "success");
                setHistory(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    url: url.split('/').slice(0, 3).join('/'),
                    count,
                    date: new Date().toLocaleTimeString()
                }, ...prev].slice(0, 5));
            } else {
                addLog(`Error: ${data.error}`, "error");
            }
        } catch (err) {
            addLog("System Link Failure: Could not reach API", "error");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 bg-[#020617] text-slate-200 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-6xl flex flex-col gap-8">
                {/* Navbar */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between glass p-4 rounded-2xl"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Bot className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">FormBot <span className="text-blue-500">AI</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> API ONLINE</span>
                        <span className="hidden md:inline px-3 py-1 bg-white/5 rounded-full">v1.2.0 EDGE</span>
                    </div>
                </motion.nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Controls */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-8 rounded-3xl space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">Control Deck</h2>
                                <p className="text-slate-500 text-sm">Configure your automated submission parameters</p>
                            </div>

                            <form onSubmit={handleStart} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase text-blue-400 tracking-[0.2em] font-bold">Target Data Stream</label>
                                    <div className="relative group">
                                        <input
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Paste form URL here..."
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 pl-12 outline-none focus:border-blue-500/50 transition-all group-hover:bg-slate-900/80"
                                            disabled={isRunning}
                                        />
                                        <Zap className="absolute left-4 top-4 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase text-blue-400 tracking-[0.2em] font-bold">Iteration Count</label>
                                        <input
                                            type="number"
                                            value={count}
                                            onChange={(e) => setCount(parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-500/50"
                                            disabled={isRunning}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase text-blue-400 tracking-[0.2em] font-bold">Execution Engine</label>
                                        <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl h-[58px]">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-bold">Hyper-Speed</span>
                                            </div>
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md font-bold">150MS</span>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600/20 rounded-xl">
                                            <User className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Smart Persona Engine</h4>
                                            <p className="text-xs text-slate-500">Enable non-deterministic human logic</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUsePersona(!usePersona)}
                                        className={`w-14 h-7 rounded-full transition-all relative ${usePersona ? 'bg-blue-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xl ${usePersona ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </motion.div>

                                <button
                                    type="submit"
                                    disabled={isRunning}
                                    className={`group relative w-full overflow-hidden p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isRunning ? 'bg-blue-900/50 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'}`}
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            Processing Protocol
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            Initialize Launch
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        {/* History Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-3xl space-y-4"
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <History className="w-4 h-4" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Recent Activity</h3>
                            </div>
                            <div className="space-y-3">
                                {history.length === 0 ? (
                                    <p className="text-xs text-slate-600 text-center py-4 italic">No recent submissions found</p>
                                ) : (
                                    history.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold truncate max-w-[150px]">{item.url}</p>
                                                    <p className="text-[10px] text-slate-500">{item.date}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded">x{item.count}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Logs */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-5 glass rounded-3xl p-6 flex flex-col h-[700px] border-l border-white/5 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                                <Terminal className="w-4 h-4" />
                                Telemetry Feed
                            </h3>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-slate-800" />
                                <div className="w-2 h-2 rounded-full bg-slate-800" />
                                <div className="w-2 h-2 rounded-full bg-slate-800" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar font-mono">
                            <AnimatePresence initial={false}>
                                {logs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                                            <Bot className="w-8 h-8 text-slate-800" />
                                        </div>
                                        <p className="text-xs text-slate-700">Awaiting system input...</p>
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-2xl border transition-all ${log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10' :
                                                    log.type === 'error' ? 'bg-red-500/5 border-red-500/10' :
                                                        'bg-slate-900/50 border-white/5'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {log.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                                {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                                {log.type === 'info' && <Zap className="w-4 h-4 text-blue-500 shrink-0" />}
                                                <p className={`text-[11px] leading-relaxed ${log.type === 'error' ? 'text-red-400' :
                                                        log.type === 'success' ? 'text-emerald-400' :
                                                            'text-slate-400'
                                                    }`}>
                                                    <span className="text-slate-600 mr-2">[{new Date(log.id).toLocaleTimeString([], { hour12: false })}]</span>
                                                    {log.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
              .glass {
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
              }
            `}</style>
        </main>
    );
}
