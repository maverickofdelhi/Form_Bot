"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Terminal,
    Activity,
    Settings,
    History,
    Send,
    Zap,
    ShieldCheck,
    LayoutDashboard,
    ExternalLink,
    Cpu,
    RefreshCcw,
    Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    level: "INFO" | "SUCCESS" | "ERROR" | "DEBUG";
}

interface HistoryItem {
    id: string;
    url: string;
    date: string;
    status: string;
}

export default function Dashboard() {
    const [formUrl, setFormUrl] = useState("");
    const [responseCount, setResponseCount] = useState(1);
    const [useAi, setUseAi] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, level: LogEntry["level"] = "INFO") => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message,
            level,
        };
        setLogs((prev) => [...prev.slice(-49), newLog]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formUrl) return;

        setIsRunning(true);
        addLog(`Initiating system for: ${formUrl}`, "INFO");
        addLog(`Mode: ${useAi ? "Smart Persona" : "Standard"}`, "DEBUG");

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: formUrl, count: responseCount, use_ai: useAi }),
            });

            const data = await response.json();
            if (data.status === "success") {
                addLog(`Successfully completed ${responseCount} submissions`, "SUCCESS");
                setHistory(prev => [{
                    id: Date.now().toString(),
                    url: formUrl,
                    date: new Date().toLocaleDateString(),
                    status: "Success"
                }, ...prev]);
            } else {
                addLog(`Error: ${data.message}`, "ERROR");
            }
        } catch (err) {
            addLog("Critical system failure during submission", "ERROR");
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="flex h-screen bg-cyber-grid overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950/50 border-r border-white/5 flex flex-col glass-morphism z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center glow-indigo animate-pulse-slow">
                            <Cpu className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">FormBot <span className="text-indigo-400">Pro</span></h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Alpha v2.5</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
                        <SidebarItem icon={<History size={18} />} label="Analytics" />
                        <SidebarItem icon={<ShieldCheck size={18} />} label="Persona Bank" />
                        <SidebarItem icon={<Settings size={18} />} label="System Settings" />
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Zap size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 w-[85%] h-full"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Engine Optimized • Latency 42ms</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col min-w-0">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Main Network
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <RefreshCcw size={18} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 border border-white/10" />
                    </div>
                </header>

                <div className="flex-1 p-8 flex gap-8 min-h-0 overflow-y-auto custom-scrollbar">
                    {/* Left: Control Deck */}
                    <div className="flex-[1.2] space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-morphism rounded-3xl p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gradient">Control Deck</h2>
                                    <p className="text-slate-400 text-sm mt-1">Configure your automated submission parameters</p>
                                </div>
                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Live Terminal
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Endpoint URL</label>
                                    <div className="relative group">
                                        <input
                                            type="url"
                                            placeholder="https://forms.google.com/..."
                                            value={formUrl}
                                            onChange={(e) => setFormUrl(e.target.value)}
                                            className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all group-hover:border-white/20"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                                            <ExternalLink size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Total Repetitions</label>
                                        <input
                                            type="number"
                                            value={responseCount}
                                            onChange={(e) => setResponseCount(parseInt(e.target.value) || 1)}
                                            className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Processing Unit</label>
                                        <div
                                            onClick={() => setUseAi(!useAi)}
                                            className={`flex items-center gap-3 h-14 px-5 rounded-2xl border cursor-pointer transition-all ${useAi ? "bg-indigo-500/10 border-indigo-500" : "bg-slate-900/50 border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${useAi ? "bg-indigo-500" : "bg-slate-600"}`} />
                                            <span className={`text-sm font-semibold ${useAi ? "text-indigo-400" : "text-slate-500"}`}>
                                                Smart Persona
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isRunning}
                                    className="w-full h-16 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 shadow-xl shadow-indigo-500/20"
                                >
                                    {isRunning ? (
                                        <RefreshCcw className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            <span>Execute Submission Protocol</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-3 gap-6"
                        >
                            <StatCard icon={<Send size={16} />} value="1.2k" label="Total Responses" />
                            <StatCard icon={<Activity size={16} />} value="99.9%" label="Reliability" />
                            <StatCard icon={<Zap size={16} />} value="150ms" label="Avg. Latency" />
                        </motion.div>
                    </div>

                    {/* Right: Telemetry Feed */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 glass-morphism rounded-3xl flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Terminal size={18} className="text-indigo-400" />
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Telemetry Feed</h3>
                                </div>
                                <button
                                    onClick={() => setLogs([])}
                                    className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hover:text-white transition-colors"
                                >
                                    Clear Buffer
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-3 custom-scrollbar">
                                <AnimatePresence initial={false}>
                                    {logs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Activity size={32} className="mb-4 opacity-20" />
                                            <p className="uppercase tracking-widest font-bold text-[10px]">Awaiting Uplink...</p>
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex gap-4 group"
                                            >
                                                <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                                                <span className={`font-bold w-12 shrink-0 ${log.level === "ERROR" ? "text-rose-500" :
                                                        log.level === "SUCCESS" ? "text-emerald-500" :
                                                            log.level === "DEBUG" ? "text-amber-500" : "text-indigo-400"
                                                    }`}>
                                                    {log.level}
                                                </span>
                                                <span className="text-slate-300 break-all select-all">{log.message}</span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                                <div ref={logEndRef} />
                            </div>
                        </motion.div>

                        {/* History Brief */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-48 mt-8 glass-morphism rounded-3xl p-6 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Recent Ops</h3>
                                <History size={14} className="text-slate-600" />
                            </div>
                            <div className="space-y-3">
                                {history.length > 0 ? (
                                    history.slice(0, 3).map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/5 border border-white/5">
                                            <span className="text-slate-300 truncate w-32">{item.url}</span>
                                            <span className="text-emerald-500 font-bold uppercase">{item.status}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest text-center mt-8">No records found</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}>
            {icon}
            <span className="text-sm font-semibold">{label}</span>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="glass-morphism rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                {icon}
            </div>
            <h4 className="text-lg font-bold">{value}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}
