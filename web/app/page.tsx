"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Cpu,
    ExternalLink,
    History,
    LayoutDashboard,
    RefreshCcw,
    Send,
    Settings,
    ShieldCheck,
    Sparkles,
    Terminal,
    Zap,
    ChevronRight,
    Search,
    UserCircle,
} from "lucide-react";

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
            id: Math.random().toString(36).slice(2, 11),
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
            if (data.status === "success" || data.success) {
                addLog(`Successfully completed ${responseCount} submissions`, "SUCCESS");
                setHistory((prev) => [
                    {
                        id: Date.now().toString(),
                        url: formUrl,
                        date: new Date().toLocaleDateString(),
                        status: "Success",
                    },
                    ...prev,
                ]);
            } else {
                addLog(`Error: ${data.message || data.error}`, "ERROR");
            }
        } catch {
            addLog("Critical system failure during submission", "ERROR");
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="flex min-h-screen bg-transparent">
            {/* Sidebar */}
            <aside className="hidden w-72 lg:flex flex-col glass-card border-l-0 border-y-0 relative z-30">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <Cpu className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">FormBot</h1>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Studio v2.6</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                        <NavItem icon={<History size={20} />} label="Analytics" />
                        <NavItem icon={<ShieldCheck size={20} />} label="Persona Bank" />
                        <NavItem icon={<Settings size={20} />} label="System Config" />
                    </nav>
                </div>

                <div className="mt-auto p-8 pt-0">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-3 text-xs text-slate-400 uppercase font-bold tracking-tighter">
                            <span>Engine Power</span>
                            <span className="text-sky-400">86%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "86%" }}
                                className="h-full bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500 leading-relaxed font-medium">
                            System status optimal. Latency stable at 42ms.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-transparent backdrop-blur-sm z-20">
                    <div className="flex items-center gap-3 lg:hidden">
                        <Cpu className="text-sky-400" size={24} />
                        <h1 className="text-lg font-bold">FormBot</h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-2 w-96 group premium-border">
                        <Search size={16} className="text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                        <input type="text" placeholder="Search operations..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Global Mainnet</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-sky-500/50 transition-colors">
                                <UserCircle size={20} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Operations Console</h2>
                            <p className="text-slate-400">Manage and orchestrate automated form submissions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 rounded-xl glass-card hover:border-slate-400 transition-colors">
                                <RefreshCcw size={18} className="text-slate-400" />
                            </button>
                            <button className="flex items-center gap-2 px-5 py-3 rounded-xl btn-premium text-white font-semibold">
                                <Sparkles size={18} />
                                <span>Optimization Center</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Control Deck (Left Column) */}
                        <div className="xl:col-span-8 space-y-8">
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[32px] p-8 md:p-10"
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Task Orchestrator</h3>
                                            <p className="text-sm text-slate-500">Configure your autonomous execution parameters.</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
                                        Layer 2 Execution
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-xs uppercase font-bold tracking-[0.15em] text-slate-500 ml-1">Target Endpoint</label>
                                        <div className="group relative premium-border rounded-2xl bg-black/20">
                                            <input
                                                type="url"
                                                placeholder="https://forms.google.com/..."
                                                value={formUrl}
                                                onChange={(e) => setFormUrl(e.target.value)}
                                                className="w-full h-16 bg-transparent px-6 border-none outline-none text-white transition placeholder:text-slate-700"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 transition group-focus-within:text-sky-400">
                                                <ExternalLink size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs uppercase font-bold tracking-[0.15em] text-slate-500 ml-1">Cycles</label>
                                            <div className="premium-border rounded-2xl bg-black/20 h-16 flex items-center px-6">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={responseCount}
                                                    onChange={(e) => setResponseCount(parseInt(e.target.value, 10) || 1)}
                                                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs uppercase font-bold tracking-[0.15em] text-slate-500 ml-1">Engine Core</label>
                                            <button
                                                type="button"
                                                onClick={() => setUseAi(!useAi)}
                                                className={`w-full h-16 rounded-2xl flex items-center px-6 justify-between transition-all duration-300 ${useAi
                                                        ? "bg-sky-500/10 border border-sky-500/40 text-sky-400 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]"
                                                        : "bg-black/20 premium-border text-slate-500"
                                                    }`}
                                            >
                                                <span className="text-sm font-bold uppercase tracking-widest">{useAi ? "Neural Engine" : "Legacy Core"}</span>
                                                <div className={`w-3 h-3 rounded-full ${useAi ? "bg-sky-400 glow-active" : "bg-slate-700"}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isRunning}
                                        className="w-full h-20 rounded-2xl btn-premium text-white text-lg font-bold flex items-center justify-center gap-4 shadow-xl shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isRunning ? (
                                            <>
                                                <RefreshCcw className="animate-spin" size={24} />
                                                <span className="tracking-widest uppercase italic">Executing Protocol...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="tracking-[0.2em] uppercase">Initialize Deployment</span>
                                                <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.section>

                            {/* Stat Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <QuickStat icon={<Send size={20} />} value="4.8k" label="Total Uplinks" color="sky" />
                                <QuickStat icon={<Activity size={20} />} value="99.9%" label="Engine Health" color="emerald" />
                                <QuickStat icon={<Zap size={20} />} value="42ms" label="Avg Latency" color="indigo" />
                            </div>
                        </div>

                        {/* Logs & History (Right Column) */}
                        <div className="xl:col-span-4 space-y-8">
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card rounded-[32px] h-[520px] flex flex-col overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <Terminal size={18} className="text-sky-400" />
                                        <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-slate-300">Telemetry</h3>
                                    </div>
                                    <button onClick={() => setLogs([])} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors">Wipe History</button>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto mono text-[11px] leading-relaxed space-y-4">
                                    <AnimatePresence initial={false}>
                                        {logs.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20">
                                                <Activity size={48} className="mb-4" />
                                                <p className="uppercase tracking-[0.3em] font-bold">Waiting for stream...</p>
                                            </div>
                                        ) : (
                                            logs.map((log) => (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex gap-4 group"
                                                >
                                                    <span className="text-slate-600 whitespace-nowrap">{log.timestamp}</span>
                                                    <span
                                                        className={`font-bold uppercase tracking-tighter ${log.level === "ERROR" ? "text-rose-500" :
                                                                log.level === "SUCCESS" ? "text-emerald-500" :
                                                                    log.level === "DEBUG" ? "text-amber-500" : "text-sky-500"
                                                            }`}
                                                    >
                                                        {log.level}
                                                    </span>
                                                    <span className="text-slate-300 flex-1">{log.message}</span>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                    <div ref={logEndRef} />
                                </div>
                            </motion.section>

                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card rounded-[32px] p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400">Registry</h3>
                                    <History size={16} className="text-slate-600" />
                                </div>
                                <div className="space-y-3">
                                    {history.length > 0 ? (
                                        history.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-slate-200 font-medium truncate max-w-[140px]">{item.url}</span>
                                                    <span className="text-[9px] text-slate-600 uppercase font-bold">{item.date}</span>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-[10px] uppercase font-bold text-slate-600 tracking-widest">No entries found</div>
                                    )}
                                </div>
                            </motion.section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <div
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${active
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
        >
            <span className={`${active ? "text-white" : "group-hover:text-sky-400"} transition-colors`}>{icon}</span>
            <span className="text-sm font-bold tracking-tight">{label}</span>
            {active && <motion.div layoutId="activeNav" className="ml-auto"><ChevronRight size={16} /></motion.div>}
        </div>
    );
}

function QuickStat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
    const colorMap: any = {
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-sky-500/5",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-card p-6 rounded-[28px] text-center border-b-2 ${colorMap[color].split(' ').slice(2).join(' ')}`}
        >
            <div className={`mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color].split(' ').slice(0, 2).join(' ')} border border-white/5`}>
                {icon}
            </div>
            <h4 className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</h4>
            <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-[0.2em]">{label}</p>
        </motion.div>
    );
}
