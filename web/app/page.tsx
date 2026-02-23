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
            if (data.status === "success") {
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
                addLog(`Error: ${data.message}`, "ERROR");
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
        <div className="app-grid min-h-screen lg:flex">
            <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col lg:border-r lg:border-slate-400/20 lg:bg-slate-950/20">
                <div className="p-6">
                    <div className="surface rounded-2xl p-5">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                                <Cpu className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="section-title text-lg font-bold">FormBot Studio</h1>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Release 2.6</p>
                            </div>
                        </div>
                        <nav className="space-y-2">
                            <SidebarItem icon={<LayoutDashboard size={17} />} label="Dashboard" active />
                            <SidebarItem icon={<History size={17} />} label="Analytics" />
                            <SidebarItem icon={<ShieldCheck size={17} />} label="Persona Bank" />
                            <SidebarItem icon={<Settings size={17} />} label="System Settings" />
                        </nav>
                    </div>
                </div>
                <div className="mt-auto p-6">
                    <div className="surface rounded-2xl p-4">
                        <div className="mb-2 flex items-center gap-2 text-sky-300">
                            <Zap size={14} />
                            <span className="text-xs font-semibold uppercase tracking-widest">System Status</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full w-[86%] bg-gradient-to-r from-sky-500 to-cyan-300" />
                        </div>
                        <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                            Engine optimized | Latency 42ms
                        </p>
                    </div>
                </div>
            </aside>

            <main className="min-w-0 flex-1">
                <header className="sticky top-0 z-20 border-b border-slate-400/15 bg-[#070c1acc] backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 lg:hidden">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Operations Console</p>
                                <h2 className="section-title text-sm font-semibold sm:text-base">Automated Form Engine</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Main Network
                            </div>
                            <button className="rounded-lg border border-slate-400/25 p-2 text-slate-300 transition hover:border-slate-300/60 hover:text-white">
                                <RefreshCcw size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:hidden">
                        <SidebarItem icon={<LayoutDashboard size={16} />} label="Dashboard" active compact />
                        <SidebarItem icon={<History size={16} />} label="History" compact />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                        <section className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="surface rounded-3xl p-5 sm:p-8"
                            >
                                <div className="mb-7 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="section-title text-2xl font-bold">Control Deck</h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Configure submission runs and execute safely at scale.
                                        </p>
                                    </div>
                                    <div className="rounded-full border border-slate-400/20 bg-slate-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                                        Live terminal
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
                                            Endpoint URL
                                        </label>
                                        <div className="group relative">
                                            <input
                                                type="url"
                                                placeholder="https://forms.google.com/..."
                                                value={formUrl}
                                                onChange={(e) => setFormUrl(e.target.value)}
                                                className="h-14 w-full rounded-2xl border border-slate-400/25 bg-[#0f172acc] px-5 pr-12 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/30"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-sky-300">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
                                                Total Repetitions
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={responseCount}
                                                onChange={(e) => setResponseCount(parseInt(e.target.value, 10) || 1)}
                                                className="h-14 w-full rounded-2xl border border-slate-400/25 bg-[#0f172acc] px-5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
                                                Processing Unit
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setUseAi(!useAi)}
                                                className={`flex h-14 w-full items-center gap-3 rounded-2xl border px-5 text-left transition ${
                                                    useAi
                                                        ? "border-sky-400/60 bg-sky-500/10 text-sky-300"
                                                        : "border-slate-400/25 bg-[#0f172acc] text-slate-400 hover:border-slate-300/45"
                                                }`}
                                            >
                                                <span className={`h-2.5 w-2.5 rounded-full ${useAi ? "bg-sky-300" : "bg-slate-500"}`} />
                                                <span className="text-sm font-semibold">
                                                    {useAi ? "Smart Persona Enabled" : "Standard Mode"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isRunning}
                                        className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-base font-semibold text-slate-950 shadow-lg shadow-sky-700/20 transition hover:brightness-110 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isRunning ? (
                                            <>
                                                <RefreshCcw className="animate-spin" size={18} />
                                                <span>Running protocol...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Execute Submission Protocol</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="grid gap-4 sm:grid-cols-3"
                            >
                                <StatCard icon={<Send size={16} />} value="1.2k" label="Total Responses" />
                                <StatCard icon={<Activity size={16} />} value="99.9%" label="Reliability" />
                                <StatCard icon={<Zap size={16} />} value="150ms" label="Avg. Latency" />
                            </motion.div>
                        </section>

                        <section className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 14 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="surface flex min-h-[420px] flex-col overflow-hidden rounded-3xl"
                            >
                                <div className="flex items-center justify-between border-b border-slate-400/15 p-5 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <Terminal size={18} className="text-sky-300" />
                                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                            Telemetry Feed
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setLogs([])}
                                        className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 transition hover:text-slate-200"
                                    >
                                        Clear Buffer
                                    </button>
                                </div>

                                <div className="mono flex-1 space-y-3 overflow-y-auto p-5 text-xs sm:p-6">
                                    <AnimatePresence initial={false}>
                                        {logs.length === 0 ? (
                                            <div className="flex h-full flex-col items-center justify-center text-slate-500">
                                                <Activity size={30} className="mb-4 opacity-30" />
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Awaiting uplink...</p>
                                            </div>
                                        ) : (
                                            logs.map((log) => (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[90px_58px_1fr] gap-2"
                                                >
                                                    <span className="text-slate-500">{log.timestamp}</span>
                                                    <span
                                                        className={`font-bold ${
                                                            log.level === "ERROR"
                                                                ? "text-rose-400"
                                                                : log.level === "SUCCESS"
                                                                ? "text-emerald-400"
                                                                : log.level === "DEBUG"
                                                                ? "text-amber-300"
                                                                : "text-sky-300"
                                                        }`}
                                                    >
                                                        {log.level}
                                                    </span>
                                                    <span className="break-all text-slate-200">{log.message}</span>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                    <div ref={logEndRef} />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="surface rounded-3xl p-5 sm:p-6"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Recent Ops</h3>
                                    <History size={14} className="text-slate-500" />
                                </div>
                                <div className="space-y-3">
                                    {history.length > 0 ? (
                                        history.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="surface-soft flex items-center justify-between rounded-xl px-3 py-2 text-[11px]"
                                            >
                                                <span className="max-w-[60%] truncate text-slate-200">{item.url}</span>
                                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-6 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                            No records found
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({
    icon,
    label,
    active = false,
    compact = false,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    compact?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl border transition ${
                compact ? "px-3 py-2" : "px-4 py-3"
            } ${
                active
                    ? "border-sky-400/40 bg-sky-500/10 text-sky-300"
                    : "border-transparent text-slate-300 hover:border-slate-300/25 hover:bg-slate-600/10"
            }`}
        >
            {icon}
            <span className={compact ? "text-xs font-semibold" : "text-sm font-semibold"}>{label}</span>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="surface animate-fade-up rounded-2xl p-5 text-center">
            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                {icon}
            </div>
            <h4 className="section-title text-lg font-bold">{value}</h4>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        </div>
    );
}
