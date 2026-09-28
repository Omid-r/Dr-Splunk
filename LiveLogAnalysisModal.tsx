import React, { useState } from 'react';
import { LiveLogAnalysis, TargetEnvironment, ParallelClusterState } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Wrench, 
  X, 
  Terminal, 
  Check, 
  Copy,
  Info,
  ShieldAlert,
  ArrowRight,
  Archive,
  RotateCcw,
  BookOpen,
  Sparkles,
  Layers,
  Server,
  Split,
  ArrowRightLeft
} from 'lucide-react';

interface LiveLogAnalysisModalProps {
  analysis: LiveLogAnalysis | null;
  onClose: () => void;
  onApplyFix: (configName: string, patch: string, targetEnv?: TargetEnvironment) => Promise<boolean>;
  onBackupFile?: (filename: string) => void;
  onRestoreFile?: (filename: string) => void;
  hasFileBackup?: boolean;
  onJumpToDoc?: (searchQuery: string) => void;
  lang?: 'fa' | 'en';
  parallelClusterState?: ParallelClusterState;
  defaultTargetEnv?: TargetEnvironment;
}

export const LiveLogAnalysisModal: React.FC<LiveLogAnalysisModalProps> = ({
  analysis,
  onClose,
  onApplyFix,
  onBackupFile,
  onRestoreFile,
  hasFileBackup = false,
  onJumpToDoc,
  lang = 'fa',
  parallelClusterState,
  defaultTargetEnv = 'production'
}) => {
  const isFa = lang === 'fa';
  const [targetEnv, setTargetEnv] = useState<TargetEnvironment>(
    parallelClusterState?.isInstalled ? 'parallel' : defaultTargetEnv
  );
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [backupTaken, setBackupTaken] = useState(false);
  const [restoredSuccessfully, setRestoredSuccessfully] = useState(false);

  if (!analysis) return null;

  const targetConfigFile = analysis.affectedConfig || 'server.conf';

  const handleApply = async () => {
    if (!analysis.canAutoApply || !analysis.affectedConfig || !analysis.patchCode) return;
    setIsApplying(true);
    try {
      const ok = await onApplyFix(analysis.affectedConfig, analysis.patchCode, targetEnv);
      if (ok) {
        setAppliedSuccessfully(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleTakeBackup = () => {
    if (onBackupFile && targetConfigFile) {
      onBackupFile(targetConfigFile);
      setBackupTaken(true);
      setTimeout(() => setBackupTaken(false), 3000);
    }
  };

  const handleRestoreBackup = () => {
    if (onRestoreFile && targetConfigFile) {
      onRestoreFile(targetConfigFile);
      setRestoredSuccessfully(true);
      setAppliedSuccessfully(false);
      setTimeout(() => setRestoredSuccessfully(false), 3000);
    }
  };

  const handleCopyPatch = () => {
    if (analysis.patchCode) {
      navigator.clipboard.writeText(analysis.patchCode);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'FATAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ERROR':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'WARN':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0e141e] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121824]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  {isFa ? 'تفسیر هوشمند و راهکار مهندسی لاگ اسپلانک' : 'Splunk Log Diagnostic & Remediation'}
                </h3>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${getSeverityBadge(analysis.logLevel || analysis.level || 'INFO')}`}>
                  {analysis.logLevel || analysis.level || 'INFO'}
                </span>
                <span className="text-[10px] bg-sky-950/70 text-sky-300 border border-sky-700/50 px-2 py-0.5 rounded-md font-mono font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{isFa ? 'منطبق بر Splunk Docs' : 'Splunk Docs Verified'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa ? 'زیرسیستم:' : 'Subsystem:'} <span className="font-mono text-emerald-300 font-semibold">{analysis.component}</span> • {isFa ? 'زمان ثبت:' : 'Time:'} <span className="font-mono text-slate-300">{analysis.timestamp}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-xs text-slate-300 flex-1">
          {/* Raw Log Banner */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center justify-between">
              <span>{isFa ? 'خط خام لاگ ثبت شده در دیمن (splunkd.log):' : 'Raw Log Event from Daemon:'}</span>
              <span className="font-mono text-[10px] text-slate-500">component: {analysis.component}</span>
            </span>
            <div className="bg-[#070a0f] p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 break-all leading-relaxed dir-ltr select-all">
              {analysis.rawLine}
            </div>
          </div>

          {/* Meaning & Interpretation (Grounded in Docs) */}
          <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Info className="w-4 h-4" />
              <span>{isFa ? 'مفهوم، تحلیل و اثر این لاگ بر کلاستر (بر اساس مستندات رسمی اسپلانک):' : 'Official Splunk Architectural Interpretation:'}</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {analysis.meaningFa}
            </p>
            {analysis.meaningEn && (
              <p className="text-[11px] text-slate-400 font-sans dir-ltr pt-1 border-t border-slate-700/40">
                {analysis.meaningEn}
              </p>
            )}
          </div>

          {/* Root cause */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>{isFa ? 'علت ریشه‌ای وقوع مشکل (Root Cause):' : 'Root Cause Analysis:'}</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {analysis.rootCauseFa}
            </p>
          </div>

          {/* Recommended SVA Fix & Config Snippet */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Wrench className="w-4 h-4" />
                <span>{isFa ? 'بهترین راهکار مهندسی پیشنهادی (SVA Best Practice):' : 'Recommended SVA Remediation:'}</span>
              </div>
              {analysis.affectedConfig && (
                <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2.5 py-0.5 rounded-md font-mono">
                  {analysis.affectedConfig} &gt; {analysis.targetStanza}
                </span>
              )}
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {analysis.recommendedFixFa || analysis.remediationFa}
            </p>

            {analysis.patchCode && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isFa ? 'کد کانفیگ اصلاحی جهت جایگزینی یا درج:' : 'Recommended Configuration Patch:'}</span>
                  <button
                    onClick={handleCopyPatch}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                  >
                    {copiedPatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPatch ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی کد' : 'Copy Patch')}
                  </button>
                </div>
                <div className="bg-[#070a0f] border border-slate-800 p-3 rounded-lg font-mono text-xs text-emerald-400 dir-ltr whitespace-pre-wrap select-all">
                  {analysis.patchCode}
                </div>
              </div>
            )}
          </div>

          {/* Target Environment Selector Box */}
          {analysis.canAutoApply && (
            <div className="bg-[#0c121c] border border-amber-500/30 p-3.5 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    {isFa ? 'سرور مقصد جهت اعمال تغییرات لاگ را انتخاب کنید:' : 'Select Target Environment for Log Remediation:'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {targetEnv === 'parallel' ? (isFa ? 'محیط موازی' : 'Parallel') : targetEnv === 'both' ? (isFa ? 'هردو محیط' : 'Both') : (isFa ? 'سرور اصلی' : 'Production')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetEnv('production')}
                  className={`p-2.5 rounded-xl border text-start transition flex items-center justify-between ${
                    targetEnv === 'production'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-rose-400" />
                    <div>
                      <div className="text-xs font-bold">{isFa ? 'سرور اصلی' : 'Production'}</div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'اعمال روی سرور لایو' : 'Live cluster'}</div>
                    </div>
                  </div>
                  {targetEnv === 'production' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetEnv('parallel')}
                  className={`p-2.5 rounded-xl border text-start transition flex items-center justify-between ${
                    targetEnv === 'parallel'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Split className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <span>{isFa ? 'سرور موازی' : 'Parallel'}</span>
                        <span className="text-[8px] bg-emerald-500/20 px-1 rounded text-emerald-300 font-bold">{isFa ? 'امن' : 'SAFE'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'تست ایزوله بدون قطعی' : 'Isolated staging'}</div>
                    </div>
                  </div>
                  {targetEnv === 'parallel' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetEnv('both')}
                  className={`p-2.5 rounded-xl border text-start transition flex items-center justify-between ${
                    targetEnv === 'both'
                      ? 'bg-amber-950/40 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-amber-300">{isFa ? 'هر دو سرور' : 'Both Servers'}</div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'همگام‌سازی دوطرفه' : 'Dual sync'}</div>
                    </div>
                  </div>
                  {targetEnv === 'both' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            </div>
          )}

          {/* Offline & Online Doc References */}
          {analysis.docReference && (
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>{isFa ? 'مستندات رسمی مرتبط در پایگاه دانش آفلاین:' : 'Related Offline Documentation:'}</span>
              </div>
              <a
                href={analysis.docReference}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors underline"
              >
                <span>docs.splunk.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer with Backup, Apply, and Restore Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#121824] flex flex-wrap items-center justify-between gap-3">
          {/* Left Actions: Close & Restore Backup */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {isFa ? 'بستن پنجره' : 'Close'}
            </button>

            {/* Restore Backup Button */}
            {(hasFileBackup || appliedSuccessfully) && (
              <button
                onClick={handleRestoreBackup}
                className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title={isFa ? 'بازگردانی فایل کانفیگ به نسخه پشتیبان قبلی' : 'Restore config file to previous backup snapshot'}
              >
                {restoredSuccessfully ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> : <RotateCcw className="w-3.5 h-3.5 text-purple-400" />}
                <span>{restoredSuccessfully ? (isFa ? 'بازگردانده شد ✓' : 'Restored ✓') : (isFa ? 'بازگردانی پشتیبان' : 'Restore Backup')}</span>
              </button>
            )}
          </div>

          {/* Right Actions: Backup Snapshot & Apply Fix */}
          <div className="flex items-center gap-2.5">
            {/* Take Backup Button */}
            {analysis.affectedConfig && onBackupFile && (
              <button
                onClick={handleTakeBackup}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title={isFa ? 'گرفتن اسنپ‌شات بک‌آپ قبل از اعمال تغییر' : 'Capture backup snapshot before applying fix'}
              >
                {backupTaken ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> : <Archive className="w-3.5 h-3.5 text-amber-400" />}
                <span>{backupTaken ? (isFa ? 'بک‌آپ ذخیره شد ✓' : 'Backup Captured ✓') : (isFa ? 'پشتیبان‌گیری' : 'Take Backup')}</span>
              </button>
            )}

            {/* Apply Fix Button */}
            {analysis.canAutoApply ? (
              <button
                onClick={handleApply}
                disabled={isApplying || appliedSuccessfully}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  appliedSuccessfully 
                    ? 'bg-emerald-600 text-white cursor-default shadow-emerald-900/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isFa ? `در حال اعمال در ${analysis.affectedConfig}...` : `Applying to ${analysis.affectedConfig}...`}</span>
                  </>
                ) : appliedSuccessfully ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isFa 
                        ? `روی ${targetEnv === 'parallel' ? 'سرور موازی' : targetEnv === 'both' ? 'هر دو سرور' : 'سرور اصلی'} اعمال شد!` 
                        : `Applied to ${targetEnv}!`}
                    </span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    <span>
                      {isFa 
                        ? `اعمال روی ${targetEnv === 'parallel' ? 'سرور موازی (Staging)' : targetEnv === 'both' ? 'هر دو سرور' : 'سرور اصلی'}` 
                        : `Apply to ${targetEnv === 'parallel' ? 'Parallel Staging' : targetEnv === 'both' ? 'Both' : 'Production'}`}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">{isFa ? 'این لاگ یک رویداد تلمتری است و نیازی به پچ ندارد.' : 'Informational telemetry - no patch needed.'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
