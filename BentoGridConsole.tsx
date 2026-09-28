import React, { useState, useEffect } from 'react';
import {
  DesktopTower,
  Terminal,
  WindowTerminal,
  Data,
  WifiHigh,
  WifiProblem,
  WifiOff,
  ShieldCheck,
  ShieldWarning,
  CircleCheck,
  CircleWarning,
  FileCode,
  FileDocument,
  Archive,
  Cloud,
  Layers,
  Globe,
  Compass,
  Users,
  Clock,
  Timer,
  ChevronRight,
  ArrowsReload01,
  Check,
  CloseMd,
  Download,
  ExternalLink,
  Settings,
  Slider01,
  Copy,
  Tag
} from './Coolicons';
import { 
  Activity, 
  Server, 
  Cpu, 
  HardDrive, 
  Box, 
  Zap, 
  Building2, 
  Radio, 
  FileText,
  AlertTriangle,
  Play,
  RotateCw,
  SlidersHorizontal,
  Search,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  Lock,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface BentoGridConsoleProps {
  lang: 'fa' | 'en';
  onNavigateTab: (tabId: string) => void;
  onOpenSettings: () => void;
  onOpenServiceModal: () => void;
  probeCluster: () => void;
  isProbingCluster: boolean;
  clusterProbeResults: Array<{ port: number; name: string; open: boolean; latency: number }>;
}

export const BentoGridConsole: React.FC<BentoGridConsoleProps> = ({
  lang,
  onNavigateTab,
  onOpenSettings,
  onOpenServiceModal,
  probeCluster,
  isProbingCluster,
  clusterProbeResults
}) => {
  const isFa = lang === 'fa';
  const [pulseCount, setPulseCount] = useState(16480);
  const [radarAngle, setRadarAngle] = useState(0);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLogLine, setSelectedLogLine] = useState<string | null>(null);

  // Rotate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Jitter EPS slightly to simulate live ingestion
  useEffect(() => {
    const epsInterval = setInterval(() => {
      setPulseCount(16400 + Math.floor(Math.random() * 180));
    }, 2000);
    return () => clearInterval(epsInterval);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const recentLogs = [
    {
      time: '06:44:12',
      level: 'INFO',
      source: 'TcpInputProc',
      message: 'Connection from 192.168.10.22:49812 to port 9997 established with TLS 1.3.'
    },
    {
      time: '06:44:05',
      level: 'INFO',
      source: 'CMMetaDataMaster',
      message: 'Bucket hot_v1_89 replicated to IDX-02 and IDX-03 (RepFactor: 3 satisfied).'
    },
    {
      time: '06:43:51',
      level: 'WARN',
      source: 'SHCClusterMgr',
      message: 'Search concurrency reached 82% threshold (18 concurrent ad-hoc jobs).'
    }
  ];

  // Sirene-style Workflow Tabs
  const workflows = [
    {
      id: 'deployer',
      titleFa: 'استقرار خودکار و Zero-Touch کلاستر',
      titleEn: 'Automated Zero-Touch Cluster Deployer',
      descFa: 'ارکستراسیون از پایه: کشف پورت‌های LOM/IPMI، نصب پکیج‌های RPM/DEB، امن‌سازی کرنل و پیکربندی خودکار کلاستر.',
      descEn: 'End-to-end bare-metal orchestration, IPMI discovery, RPM packages, kernel tuning and automatic cluster pairing.',
      badge: 'Bare-Metal & OS',
      targetTab: 'cluster_deployer',
      icon: Zap,
      metrics: [
        { label: isFa ? 'نودهای آماده استقرار' : 'Target Hosts', value: '10 Hosts' },
        { label: isFa ? 'زمان تخمینی نصب' : 'Deploy Time', value: '4m 30s' },
        { label: isFa ? 'پروتکل مدیریت' : 'Management', value: 'mTLS & SSH' }
      ]
    },
    {
      id: 'radar',
      titleFa: 'رادار پایش ورود داده و آشکارساز قطعی',
      titleEn: 'Live Ingestion Radar & Silent Drop Detector',
      descFa: 'پایش ۳۰ ثانیه‌ای هارت‌بیت فورواردرها، کشف دراپ نامحسوس لاگ‌ها و بازیابی فوری سورس‌های قطع‌شده.',
      descEn: '30-second heartbeat sweep across universal forwarders, silent disconnect detection and automated recovery.',
      badge: 'Real-time EPS',
      targetTab: 'heartbeat_radar',
      icon: Radio,
      metrics: [
        { label: isFa ? 'نرخ ورود لحظه‌ای' : 'Throughput', value: `${pulseCount.toLocaleString()} EPS` },
        { label: isFa ? 'سورس‌های فعال' : 'Active Sources', value: '12 Forwarders' },
        { label: isFa ? 'قطعی شناسایی شده' : 'Silent Drops', value: '0 Outages' }
      ]
    },
    {
      id: 'ports',
      titleFa: 'ماتریس پورت‌های بحرانی و امنیت TLS',
      titleEn: 'Critical Port Channels & TLS 1.3 Matrix',
      descFa: 'کانال‌های ۹۹۹۷، ۸۰۸۹، ۸۰۰۰، ۸۰۸۸ و ۵۱۴ با اعتبارسنجی سرتیفیکت دیجیتال تجاری و پایش تاخیر میلی‌ثانیه‌ای.',
      descEn: 'Port channels 9997, 8089, 8000, 8088, and 514 with commercial certificate validation and sub-2ms latency.',
      badge: 'TLS 1.3 / mTLS',
      targetTab: 'topology',
      icon: WifiHigh,
      metrics: [
        { label: isFa ? 'پورت‌های حیاتی' : 'Core Sockets', value: '5 Open' },
        { label: isFa ? 'میانگین تاخیر' : 'Avg Latency', value: '1.4 ms' },
        { label: isFa ? 'رمزنگاری پایپ‌لاین' : 'Encryption', value: 'TLS 1.3 Valid' }
      ]
    },
    {
      id: 'auditor',
      titleFa: 'ممیزی معماری SVA C11 و سایزینگ سخت‌افزار',
      titleEn: 'SVA C11 Architecture Auditor & Sizing',
      descFa: 'تطبیق خط‌به‌خط ساختار کلاستر با استاندارد Splunk Validated Architectures و استعلام تعداد بهینه ایندکسرها.',
      descEn: 'SVA C11 compliance auditor, To-Be comparison, IOPS benchmarks, and hardware sizing calculation engine.',
      badge: 'SVA Level-3',
      targetTab: 'architecture_auditor',
      icon: Building2,
      metrics: [
        { label: isFa ? 'امتیاز انطباق SVA' : 'SVA Score', value: '88/100' },
        { label: isFa ? 'ایندکسر پیشنهادی' : 'To-Be Indexers', value: '6 Nodes' },
        { label: isFa ? 'حجم مصرف لایسنس' : 'License Usage', value: '82% (1.64 TB)' }
      ]
    },
    {
      id: 'docker_k8s',
      titleFa: 'داکر، کوبرنتیز و اپراتور اسپلانک (SOK)',
      titleEn: 'Docker, Kubernetes & Splunk Operator (SOK)',
      descFa: 'استقرار کانتینری مدرن با CRDهای رسمی، پشتیبانی از StatefulSetهای ایندکسر و سرچ‌هد در محیط‌های ابری.',
      descEn: 'Cloud-native Splunk deployment with official Operator CRDs, StatefulSet indexers and containerized SHC.',
      badge: 'K8s CRD v2.6',
      targetTab: 'docker_k8s',
      icon: Box,
      metrics: [
        { label: isFa ? 'وضعیت اپراتور' : 'Operator Status', value: 'Running' },
        { label: isFa ? 'رپلیکاهای ایندکسر' : 'IDX Replicas', value: '3/3 Ready' },
        { label: isFa ? 'سرچ‌هد کانتینری' : 'SH Pods', value: '2/2 Ready' }
      ]
    }
  ];

  const currentWorkflow = workflows[selectedWorkflow];
  const WorkflowIcon = currentWorkflow.icon;

  return (
    <div className="space-y-8" dir={isFa ? 'rtl' : 'ltr'}>
      {/* ========================================================================= */}
      {/* 1. SIRENE HERO SECTION: Pitch-black, Ambient Radial Glow, Editorial Type */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#000104] p-6 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Sirene Ambient Glow Accents */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-amber-500/5 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Top Sirene Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-4 py-1.5 text-xs text-slate-300 font-mono backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">SVA C11 Level-3 Reference</span>
            <span className="text-white/30">|</span>
            <span className="text-slate-400">{isFa ? 'سامانه جامع ارکستراسیون کلاستر اسپلانک' : 'Splunk Architecture & SOC Operations'}</span>
          </div>

          {/* Sirene Headline with subtle gradient typography */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {isFa ? (
              <>
                معماری یکپارچه، استقرار خودکار و{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                  ممیزی ارشد کلاستر اسپلانک
                </span>
              </>
            ) : (
              <>
                Enterprise Splunk Architecture,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                  Automated Deployment &amp; SVA Audit
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#afafaf] max-w-2xl leading-relaxed">
            {isFa
              ? 'پلتفرم جامع مهندسی برای استقرار Zero-Touch سرورهای فیزیکی و مجازی، پایش هارت‌بیت سورس‌ها، تحلیل زنده لاگ‌های splunkd، مدیریت متمرکز لایسنس و ممیزی رسمی بنچمارک SVA.'
              : 'Unified SaaS platform for bare-metal Zero-Touch orchestration, ingestion heartbeat telemetry, splunkd live log analysis, master license pools, and SVA C11 benchmark compliance.'}
          </p>

          {/* Sirene Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('cluster_deployer')}
              className="rounded-full px-6 py-3 bg-white hover:bg-slate-200 text-black font-bold text-xs transition duration-200 shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-black" />
              <span>{isFa ? 'شروع استقرار خودکار کلاستر' : 'Launch Cluster Deployer'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('topology')}
              className="rounded-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'مشاهده دایاگرام توپولوژی و پورت‌ها' : 'Explore Architecture Map'}</span>
            </button>

            <button
              onClick={probeCluster}
              disabled={isProbingCluster}
              className="rounded-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-mono text-xs transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isProbingCluster ? 'animate-spin' : ''}`} />
              <span>{isProbingCluster ? (isFa ? 'پروب سوکت‌ها...' : 'Probing...') : (isFa ? 'تست زنده سوکت‌ها' : 'Probe Sockets')}</span>
            </button>
          </div>

          {/* Sirene Live Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 w-full text-xs">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{isFa ? 'نودهای فعال کلاستر' : 'Managed Nodes'}</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5">10 Online</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">HF · IDX · SH · CM</span>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{isFa ? 'نرخ ورود لاگ لحظه‌ای' : 'Throughput (EPS)'}</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">{pulseCount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">1.42 TB / 2.0 TB Day</span>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{isFa ? 'پورت‌های ارتباطی TLS' : 'Core Channels'}</span>
              <span className="text-lg font-bold text-amber-400 font-mono mt-0.5">5 / 5 Active</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">9997, 8089, 8000</span>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{isFa ? 'امتیاز ممیزی SVA' : 'SVA Health Score'}</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5">88 / 100</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">C11 Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SIRENE AUTOMATION & ARCHITECTURE WORKFLOWS TABBED SHOWCASE              */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-white/10 bg-[#000104] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-amber-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? 'گردش‌کار و قابلیت‌های خودکار' : 'Automated Enterprise Workflows'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-2">
              {isFa ? 'معماری و لایه‌های عملیاتی کلاستر سازمانی' : 'Interactive Architecture & Operational Tiers'}
            </h2>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {isFa ? 'برای جابجایی میان لایه‌ها روی هر ردیف کلیک کنید' : 'Click any workflow to switch live telemetry view'}
          </div>
        </div>

        {/* Sirene 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Interactive Workflow Tabs */}
          <div className="lg:col-span-5 space-y-2.5 flex flex-col justify-between">
            {workflows.map((wf, idx) => {
              const Icon = wf.icon;
              const isSelected = selectedWorkflow === idx;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(idx)}
                  className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-white/10 border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-400 text-black' : 'bg-white/5 text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {isFa ? wf.titleFa : wf.titleEn}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {wf.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? (isFa ? '-rotate-180 text-amber-400' : 'rotate-90 text-amber-400') : ''}`} />
                  </div>

                  {isSelected && (
                    <p className="text-[11px] text-slate-300 mt-3 pt-3 border-t border-white/10 leading-relaxed">
                      {isFa ? wf.descFa : wf.descEn}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Live Viewport */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#050810] p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
            {/* Subtle glow in viewport */}
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

            <div className="space-y-5 relative z-10">
              {/* Header inside viewport */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-amber-400">
                    <WorkflowIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isFa ? currentWorkflow.titleFa : currentWorkflow.titleEn}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tier Status: Online &amp; Operational
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab(currentWorkflow.targetTab)}
                  className="rounded-full px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>{isFa ? 'ورود به ماژول تخصصی' : 'Open Dedicated Module'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Viewport Description & Architecture Highlights */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {isFa ? currentWorkflow.descFa : currentWorkflow.descEn}
              </p>

              {/* Real-time Metric Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentWorkflow.metrics.map((m, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                    <span className="text-[10px] text-slate-400 font-mono block">{m.label}</span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block tabular-nums">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Simulation Panel */}
              <div className="rounded-xl bg-black/60 border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{isFa ? 'لاگ تلمتری لحظه‌ای ماژول:' : 'Live Telemetry Output:'}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    STREAM OK
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1 bg-[#020408] p-3 rounded-lg border border-white/5">
                  <p className="text-slate-400">[06:45:01] SVA Engine initialized on host CL-PROD-SPLUNK-01 (x86_64 Linux)</p>
                  <p className="text-emerald-400">[06:45:02] Socket probe: TCP 9997 (S2S), TCP 8089 (mTLS), TCP 8000 (UI) healthy</p>
                  <p className="text-amber-300">[06:45:03] Cluster replication factor: 3, Search factor: 2 verified across 4 indexer peers</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside viewport */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-slate-400 font-mono mt-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'تنظیمات با مستندات رسمی اسپلانک تطبیق دارد' : 'Compliant with docs.splunk.com specification'}</span>
              </div>
              <button
                onClick={() => onNavigateTab(currentWorkflow.targetTab)}
                className="text-amber-400 hover:text-white underline cursor-pointer"
              >
                {isFa ? 'مشاهده جزئیات بیشتر' : 'View full details →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SIRENE FEATURE BENTO GRID (Dark Glass, Hairline White Borders, Spotlight) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              {isFa ? 'کنسول ماژولار بنتو (Splunk Bento Grid Suite)' : 'Splunk Bento Operations Grid'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">8 Core Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Bento Card 1: Critical Ports Matrix (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <WifiHigh className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'ماتریس پورت‌های بحرانی' : 'Critical Ports Matrix'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  TLS 1.3
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                {[
                  { port: 9997, name: 'S2S Ingestion', protocol: 'TCP/TLS', latency: '1.8ms', state: 'Open' },
                  { port: 8089, name: 'Splunkd REST API', protocol: 'mTLS', latency: '1.2ms', state: 'Open' },
                  { port: 8000, name: 'Splunk Web UI', protocol: 'HTTPS', latency: '2.4ms', state: 'Open' },
                  { port: 8088, name: 'HTTP Event Collector', protocol: 'HTTPS Token', latency: '1.5ms', state: 'Open' },
                  { port: 514, name: 'Syslog Ingestion', protocol: 'UDP/TCP', latency: '0.9ms', state: 'Open' }
                ].map((p) => (
                  <div key={p.port} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs w-11">{p.port}</span>
                      <span className="text-slate-300 font-medium text-[11px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{p.latency}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold">
                        {p.state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('topology')}
              className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isFa ? 'بررسی معماری و جریان بسته‌ها' : 'Explore Port Channels'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Bento Card 2: Live Ingestion Radar (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'رادار هارت‌بیت و سورس‌ها' : 'Live Ingestion Radar'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  30s Sweep
                </span>
              </div>

              {/* Radar Animation Box */}
              <div className="my-3 flex items-center justify-center relative py-2">
                <div className="w-32 h-32 rounded-full border border-emerald-500/20 bg-black/80 relative flex items-center justify-center overflow-hidden">
                  <div className="w-20 h-20 rounded-full border border-emerald-500/20" />
                  <div className="w-10 h-10 rounded-full border border-emerald-500/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-emerald-500/20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-emerald-500/20" />
                  </div>

                  <div
                    className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-emerald-400 origin-left left-1/2"
                    style={{
                      transform: `rotate(${radarAngle}deg)`,
                      boxShadow: '0 0 8px #10b981'
                    }}
                  />

                  <div className="w-2 h-2 rounded-full bg-emerald-400 absolute top-6 left-8 animate-ping" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 absolute top-6 left-8" />
                  <div className="w-2 h-2 rounded-full bg-amber-400 absolute bottom-7 right-7" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isFa ? 'نرخ ورود لاگ (EPS):' : 'Ingestion Rate:'}</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{pulseCount.toLocaleString()} EPS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isFa ? 'حجم روزانه لایسنس:' : 'Daily Volume:'}</span>
                  <span className="font-mono font-bold text-white tabular-nums">1.42 TB / 2.0 TB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isFa ? 'قطعی بی‌صدا:' : 'Silent Drops:'}</span>
                  <span className="font-mono font-bold text-emerald-400">0 {isFa ? 'مورد' : 'Detected'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('heartbeat_radar')}
              className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isFa ? 'مشاهده کامل رادار و هشدارها' : 'Open Heartbeat Radar'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Bento Card 3: Server Fleet & Chassis (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'ناوگان سرورها و شاسی‌ها' : 'Server Fleet & Chassis'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  10 Hosts
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                {[
                  { name: 'HF-01 (Heavy Forwarder)', ip: '192.168.10.41', cpu: 28, ram: 42 },
                  { name: 'IDX-01 (Indexer Peer)', ip: '192.168.10.11', cpu: 64, ram: 78 },
                  { name: 'SH-01 (Search Head)', ip: '192.168.10.21', cpu: 45, ram: 60 },
                  { name: 'CM-01 (Cluster Master)', ip: '192.168.10.31', cpu: 18, ram: 34 }
                ].map((srv) => (
                  <div key={srv.name} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{srv.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{srv.ip}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <span>CPU:</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${srv.cpu}%` }} />
                        </div>
                        <span className="text-slate-200">{srv.cpu}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>RAM:</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                          <div className="bg-sky-400 h-full rounded-full" style={{ width: `${srv.ram}%` }} />
                        </div>
                        <span className="text-slate-200">{srv.ram}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('cluster_deployer')}
              className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isFa ? 'مدیریت کل نودها و کشف خودکار' : 'Fleet Discovery & Provisioning'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Bento Card 4: Live splunkd.log Stream (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'استریم زنده لاگ‌ها (splunkd)' : 'splunkd.log Live Stream'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>

              <div className="space-y-2 mt-3">
                {recentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedLogLine(log.message)}
                    className="p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-400/40 cursor-pointer transition text-[11px] font-mono space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{log.time} · {log.source}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${log.level === 'WARN' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'}`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="text-slate-300 truncate">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('live_logs')}
              className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isFa ? 'کنسول لاگ زنده و عیب‌یابی' : 'Open Full Log Stream'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Bento Card 5: SVA C11 Benchmark & Sizing (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'تطبیق بنچمارک SVA و سایزینگ' : 'SVA C11 Benchmark Sizing'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  To-Be
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isFa ? 'تعداد ایندکسرها (As-Is vs To-Be):' : 'Indexers (As-Is vs To-Be):'}</span>
                    <span className="font-bold text-white mt-0.5 block">{isFa ? '۴ فعال → ۶ پیشنهادی' : '4 Active → 6 Recommended'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                    +2 Nodes
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isFa ? 'کارایی دیسک داغ (Hot/Warm):' : 'Hot IOPS Throughput:'}</span>
                    <span className="font-bold text-white mt-0.5 block">1,200 IOPS (NVMe OK)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    Passed
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isFa ? 'لایسنس مصرفی استخر:' : 'License Consumption:'}</span>
                    <span className="font-bold text-white mt-0.5 block">82% (1.64 TB / 2.0 TB)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    Healthy
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('architecture_auditor')}
              className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isFa ? 'مشاهده ممیزی کامل معماری ارشد' : 'Open SVA Architecture Auditor'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Bento Card 6: Configs & Emergency Controller (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#000104] hover:border-white/20 p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isFa ? 'دستورات فوری و ابزارهای ممیزی' : 'Operations & Audit Exports'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  CLI & REST
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <button
                  onClick={onOpenServiceModal}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-slate-200 flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-[11px]">{isFa ? 'کنترل سرویس' : 'Service Control'}</span>
                </button>

                <button
                  onClick={() => onNavigateTab('health_audit')}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-slate-200 flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-[11px]">{isFa ? 'گزارش عیب‌یابی' : 'Health Audit'}</span>
                </button>

                <button
                  onClick={() => onNavigateTab('backup_archive')}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-slate-200 flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer"
                >
                  <Archive className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-[11px]">{isFa ? 'آرشیو اسنپ‌شات' : 'Snapshots'}</span>
                </button>

                <button
                  onClick={() => onNavigateTab('admin_security')}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-slate-200 flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-[11px]">{isFa ? 'امنیت و RBAC' : 'RBAC & Audit'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>{isFa ? 'نسخه سرور: Splunk 9.3.2' : 'Splunk v9.3.2 Enterprise'}</span>
              <span className="text-emerald-400 font-bold">SHA-256 OK</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
