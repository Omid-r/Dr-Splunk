import { LiveLogAnalysis } from '../types';

/**
 * Intelligent Splunk Log Analysis & Auto-Remediation Engine
 * Grounded 100% in official Splunk Documentation (docs.splunk.com, SVA & Troubleshooting Guide).
 * Translates raw daemon signatures into accurate root causes, SVA best practice remediations, and direct configuration patches.
 */

interface LogRule {
  keywords: string[];
  component: string;
  logLevel: 'FATAL' | 'ERROR' | 'WARN' | 'INFO';
  meaningFa: string;
  meaningEn: string;
  rootCauseFa: string;
  rootCauseEn: string;
  recommendedFixFa: string;
  recommendedFixEn: string;
  affectedConfig: string;
  targetStanza: string;
  patchCode: string;
  docReference: string;
  canAutoApply: boolean;
}

const SPLUNK_LOG_RULES: LogRule[] = [
  // 1. SSL / TLS / Certificates
  {
    keywords: ['sslcommon', 'self-signed', 'certificate detected', 'sslkeysfile', 'sslrootcapath', 'ca cert', 'expired certificate'],
    component: 'SSLCommon',
    logLevel: 'WARN',
    meaningFa: 'پورت مدیریتی ۸۰۸۹ یا ارتباطات وب از گواهی خودامضا (Self-Signed) یا منقضی استفاده می‌کند که می‌تواند در ارتباطات کلاستر آسیب‌پذیر باشد.',
    meaningEn: 'Management port 8089 or Web tier is using default self-signed or expired SSL certs, which risks MITM exposure in enterprise communication.',
    rootCauseFa: 'عدم تنظیم گواهی تجاری سازمانی در استنزای [sslConfig] فایل server.conf یا web.conf.',
    rootCauseEn: 'server.conf [sslConfig] is relying on default cert instead of enterprise CA signed bundle.',
    recommendedFixFa: 'تنظیم گواهی معتبر سازمانی (server.pem) و کلید خصوصی در استنزای [sslConfig] و الزام پروتکل‌های امن TLS 1.2 و 1.3.',
    recommendedFixEn: 'Configure enterprise server.pem and enforce TLS 1.2/1.3 in server.conf [sslConfig].',
    affectedConfig: 'server.conf',
    targetStanza: '[sslConfig]',
    patchCode: 'enableSplunkdSSL = true\nsslVersionsToSupport = tls1.2, tls1.3\nserverCert = $SPLUNK_HOME/etc/auth/server.pem\nsslPassword = password',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Security/AboutsecuringSplunk',
    canAutoApply: true
  },
  // 2. ConfMerge / Precedence
  {
    keywords: ['confmerge', 'precedence warning', 'overwritten by', 'conf precedence', 'duplicate stanza'],
    component: 'ConfMerge',
    logLevel: 'WARN',
    meaningFa: 'هشدار اولویت کانفیگ‌ها (Precedence): تنظیمی در شاخه system/local تنظیمی در اپلیکیشن یا system/default را بازنویسی کرده است.',
    meaningEn: 'Configuration precedence conflict: system/local stanza setting is overriding app or default layer properties.',
    rootCauseFa: 'وجود تنظیمات موازی در سطوح مختلف ساختار دایرکتوری‌های /etc/system و /etc/apps.',
    rootCauseEn: 'Duplicate parameter specified across multiple layered configuration files.',
    recommendedFixFa: 'اجرای بررسی یکپارچگی کانفیگ با دستور btool (splunk btool check) و پاکسازی تنظیمات زائد یا تثبیت در system/local.',
    recommendedFixEn: 'Audit with splunk btool check --debug to unify settings in local layer.',
    affectedConfig: 'server.conf',
    targetStanza: '[sslConfig]',
    patchCode: '# ConfMerge aligned: precedence resolved in local layer\nsslVersionsToSupport = tls1.2, tls1.3',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Aboutconfigurationfiles',
    canAutoApply: true
  },
  // 3. ClusterMaster / Pass4SymmKey Auth
  {
    keywords: ['clustermaster', 'unable to authenticate', 'default token', 'pass4symmkey', 'cluster peer auth', 'replication_factor'],
    component: 'ClusterMaster',
    logLevel: 'ERROR',
    meaningFa: 'نود کلاستر مستر قادر به اعتبارسنجی ایندکسر همتا (Peer) نیست. کلید امنیتی مشترک (pass4SymmKey) در کلاستر ناهمگام است.',
    meaningEn: 'Cluster Master failed to authenticate cluster peer. The shared cluster secret (pass4SymmKey) is mismatched or factory default.',
    rootCauseFa: 'عدم تطابق pass4SymmKey در استنزای [clustering] فایل server.conf بین Master و ایندکسرها.',
    rootCauseEn: 'pass4SymmKey mismatch in server.conf [clustering] across cluster tier.',
    recommendedFixFa: 'تنظیم pass4SymmKey یکسان و امن در استنزای [clustering] کلیه نودهای کلاستر و ری‌استارت سرویس.',
    recommendedFixEn: 'Synchronize hardened pass4SymmKey in server.conf [clustering] on all indexers and master.',
    affectedConfig: 'server.conf',
    targetStanza: '[clustering]',
    patchCode: 'mode = master\npass4SymmKey = EnterpriseSecretKey2026!\nreplication_factor = 2\nsearch_factor = 2',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutclusters',
    canAutoApply: true
  },
  // 4. Forwarding Connection / TcpOutputProc Timeout
  {
    keywords: ['tcpoutputproc', 'connection to indexer', 'timeout occurred', 'connection refused', 'cannot connect', 'failed to connect', '9997'],
    component: 'TcpOutputProc',
    logLevel: 'ERROR',
    meaningFa: 'فورواردر در برقراری ارتباط با پورت ۹۹۹۷ ایندکسر مقصد با تایم‌اوت یا رد اتصال مواجه شده و ارسال لاگ‌ها متوقف است.',
    meaningEn: 'Forwarder timed out or failed to connect to downstream receiver port 9997. Log transmission pipeline is paused.',
    rootCauseFa: 'نادرست بودن آدرس ایندکسرها در outputs.conf یا بسته بودن پورت ۹۹۹۷ در فایروال ایندکسر مقصد.',
    rootCauseEn: 'Missing port :9997 in outputs.conf or target indexer receiver port is offline/firewall blocked.',
    recommendedFixFa: 'بررسی و اصلاح استنزای [tcpout:primary_indexers] در outputs.conf و اطمینان از باز بودن پورت ۹۹۹۷.',
    recommendedFixEn: 'Set correct server = host:9997 list in outputs.conf and verify firewall reachability.',
    affectedConfig: 'outputs.conf',
    targetStanza: '[tcpout:primary_indexers]',
    patchCode: 'server = 10.20.30.50:9997, 10.20.30.51:9997\nautoLBFrequency = 30\nuseACK = true',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Outputsconf',
    canAutoApply: true
  },
  // 5. Plaintext Forwarding (Cleartext)
  {
    keywords: ['usessl=false', 'plaintext', 'cleartext', 'unencrypted socket', 'unencrypted cleartext'],
    component: 'TcpOutputProc',
    logLevel: 'WARN',
    meaningFa: 'ترافیک و بسته‌های رویدادها بین فورواردر و ایندکسرها به صورت متن خام و بدون رمزنگاری لایه انتقال TLS انتقال می‌یابند.',
    meaningEn: 'Forwarder is streaming telemetry data over unencrypted cleartext sockets, exposing sensitive security payload.',
    rootCauseFa: 'پارامتر useSSL در فایل outputs.conf روی مقدار پیش‌فرض ناامن false قرار دارد.',
    rootCauseEn: 'outputs.conf has useSSL = false in [tcpout] stanza.',
    recommendedFixFa: 'تغییر useSSL به true و فعال‌سازی اعتبارسنجی گواهی سرور (sslVerifyServerCert = true) در outputs.conf.',
    recommendedFixEn: 'Enable useSSL = true and sslVerifyServerCert = true in outputs.conf.',
    affectedConfig: 'outputs.conf',
    targetStanza: '[tcpout]',
    patchCode: 'useSSL = true\nsslVerifyServerCert = true\nsslRootCAPath = $SPLUNK_HOME/etc/auth/cacert.pem',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Security/AboutsecuringSplunk',
    canAutoApply: true
  },
  // 6. Disk Space & Storage Threshold (DiskMon)
  {
    keywords: ['diskmon', 'minfreespacemb', 'disk space', 'disk usage', 'approaching warning threshold', 'partition space'],
    component: 'DiskMon',
    logLevel: 'WARN',
    meaningFa: 'فضای آزاد پارتیشن دیسک به آستانه بحرانی رسیده است. در صورت تکمیل فضا، دیمن اسپلانک عملیات ایندکس را متوقف می‌کند.',
    meaningEn: 'Available disk space is approaching safety threshold. If exceeded, Splunk pauses indexing to prevent database corruption.',
    rootCauseFa: 'حجم بالای لاگ‌ها یا کم بودن مقدار minFreeSpaceMB در فایل server.conf استنزای [diskUsage].',
    rootCauseEn: 'Disk partition utilization high or minFreeSpaceMB parameter requires adjustment.',
    recommendedFixFa: 'تنظیم minFreeSpaceMB = 5000 در server.conf، پاکسازی باکت‌های قدیمی و فشرده‌سازی دیتابیس.',
    recommendedFixEn: 'Set minFreeSpaceMB = 5000 in server.conf [diskUsage] and archive cold data.',
    affectedConfig: 'server.conf',
    targetStanza: '[diskUsage]',
    patchCode: 'minFreeSpaceMB = 5000\npollingFrequency = 100000',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Serverconf',
    canAutoApply: true
  },
  // 7. Bucket & Database Directory Failure (HotDBLoader)
  {
    keywords: ['hotdbloader', 'databasedirectorymanager', 'failed to initialize bucket', 'volume /var/lib/splunk', 'permission denied bucket', 'cannot create bucket'],
    component: 'HotDBLoader',
    logLevel: 'FATAL',
    meaningFa: 'موتور ایجاد باکت‌های ایندکس (Hot Buckets) به دلیل نامعتبر بودن مسیر دیسک یا عدم دسترسی متوقف شده و ذخیره لاگ غیرممکن است.',
    meaningEn: 'Hot bucket loader failed because the configured filesystem directory path does not exist or lacks write permissions.',
    rootCauseFa: 'مسیرهای homePath یا coldPath در indexes.conf به دایرکتوری ناموجود یا بدون مجوز رایت اشاره دارند.',
    rootCauseEn: 'Invalid homePath/coldPath directory configured in indexes.conf or missing splunk user permissions.',
    recommendedFixFa: 'اصلاح مسیرها به متغیر استاندارد $SPLUNK_DB و اجرای chown -R splunk:splunk روی دایرکتوری‌ها.',
    recommendedFixEn: 'Correct paths to $SPLUNK_DB/<index_name>/db and verify write permissions.',
    affectedConfig: 'indexes.conf',
    targetStanza: '[default]',
    patchCode: 'homePath = $SPLUNK_DB/$_index_name/db\ncoldPath = $SPLUNK_DB/$_index_name/colddb\nthawedPath = $SPLUNK_DB/$_index_name/thaweddb',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/indexesconf',
    canAutoApply: true
  },
  // 8. HEC / HTTP Event Collector (HttpListener)
  {
    keywords: ['httplistener', 'httpinputdatahandler', 'http event collector', 'operating without ssl', '8088', 'hec token'],
    component: 'HttpListener',
    logLevel: 'WARN',
    meaningFa: 'درگاه HTTP Event Collector (HEC) روی پورت ۸۰۸۸ وضعیت توکن‌ها یا لایه امنیتی بدون رمزنگاری را گزارش می‌دهد.',
    meaningEn: 'HTTP Event Collector (HEC) reported connection state or unencrypted traffic warning on port 8088.',
    rootCauseFa: 'غیرفعال بودن SSL (enableSSL = 0) در استنزای [http] یا ارسال توکن نامعتبر در هدر درخواست‌ها.',
    rootCauseEn: 'enableSSL = 0 in inputs.conf [http] stanza or unauthorized bearer token.',
    recommendedFixFa: 'فعال‌سازی enableSSL = 1 و الزام نسخه‌های TLS 1.2 و 1.3 در inputs.conf مطابق مستندات رسمی HEC.',
    recommendedFixEn: 'Set enableSSL = 1 and require TLS 1.2/1.3 in inputs.conf [http].',
    affectedConfig: 'inputs.conf',
    targetStanza: '[http]',
    patchCode: 'enableSSL = 1\nport = 8088\ndisabled = 0\nsslVersions = tls1.2,tls1.3',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector',
    canAutoApply: true
  },
  // 9. File Monitoring & Input Routing (TailingProcessor)
  {
    keywords: ['tailingprocessor', 'file monitor stanza', 'invalid _tcp_routing', 'tailreader', 'batchreader', 'monitor://'],
    component: 'TailingProcessor',
    logLevel: 'WARN',
    meaningFa: 'سرویس مانیتورینگ فایل‌ها در پایش لاگ‌ها با گروه خروجی نامعتبر یا ایندکس نامشخص مواجه شده است.',
    meaningEn: 'File monitoring tailing processor encountered routing group alignment issue or invalid input parameters.',
    rootCauseFa: 'مقدار نامعتبر _TCP_ROUTING یا عدم تعریف صریح ایندکس مقصد در استنزای [monitor://...].',
    rootCauseEn: '_TCP_ROUTING group not defined in outputs.conf or missing index declaration in inputs.conf.',
    recommendedFixFa: 'تنظیم _TCP_ROUTING = primary_indexers و تعیین صریح index در استنزای inputs.conf.',
    recommendedFixEn: 'Set _TCP_ROUTING = primary_indexers and specify index = main in inputs.conf.',
    affectedConfig: 'inputs.conf',
    targetStanza: '[monitor:///var/log/syslog]',
    patchCode: 'disabled = 0\n_TCP_ROUTING = primary_indexers\nindex = os_linux\nsourcetype = syslog',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf',
    canAutoApply: true
  },
  // 10. License & Indexing Quota (LicenseManager)
  {
    keywords: ['licensemanager', 'license pool', 'indexing volume reaching', 'daily indexing volume', 'quota exceeded', 'slave-to-master heartbeat'],
    component: 'LicenseManager',
    logLevel: 'WARN',
    meaningFa: 'پایش مصرف لایسنس اسپلانک: هشدار حجم ایندکس روزانه یا مصرف بیش از ۸۰٪ ظرفیت استخر لایسنس.',
    meaningEn: 'License Manager quota tracking event or slave-to-master heartbeat checkpoint approaching allocation limit.',
    rootCauseFa: 'نزدیک شدن حجم داده‌های ایندکس شده در ۲۴ ساعت به سقف ظرفیت لایسنس.',
    rootCauseEn: 'Daily indexing volume approaching allocation pool limit.',
    recommendedFixFa: 'بررسی استخر لایسنس، اعمال فیلترهای Regex در props/transforms و همگام‌سازی آدرس License Master در server.conf.',
    recommendedFixEn: 'Verify [license] master_uri in server.conf and filter unnecessary noise events in transforms.conf.',
    affectedConfig: 'server.conf',
    targetStanza: '[license]',
    patchCode: 'master_uri = https://10.20.30.20:8089',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Aboutlicenses',
    canAutoApply: true
  },
  // 11. Event Truncation & Line Breaker (LineBreakingProcessor)
  {
    keywords: ['linebreakingprocessor', 'aggregatorminingprocessor', 'truncate limit', 'linemerge', 'event size exceeded', 'line_breaker'],
    component: 'LineBreakingProcessor',
    logLevel: 'WARN',
    meaningFa: 'موتور پارسینگ با رویدادهای بزرگتر از سقف ۱۰ کیلوبایت مواجه شده و خطوط را کوتاه یا ناقص کرده است.',
    meaningEn: 'LineBreakingProcessor encountered events exceeding TRUNCATE size or complex multiline events.',
    rootCauseFa: 'تنظیم نامناسب SHOULD_LINEMERGE یا کوچک بودن حد پیش‌فرض TRUNCATE در فایل props.conf.',
    rootCauseEn: 'Inefficient multiline parsing or default 10KB truncation limit in props.conf.',
    recommendedFixFa: 'تنظیم SHOULD_LINEMERGE = false و افزایش TRUNCATE به ۲۰۰۰۰ بایت در props.conf جهت بهبود پردازش.',
    recommendedFixEn: 'Set SHOULD_LINEMERGE = false and TRUNCATE = 20000 in props.conf.',
    affectedConfig: 'props.conf',
    targetStanza: '[syslog]',
    patchCode: 'SHOULD_LINEMERGE = false\nLINE_BREAKER = ([\\r\\n]+)\nTRUNCATE = 20000',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf',
    canAutoApply: true
  },
  // 12. KVStore / WiredTiger / Port 8191
  {
    keywords: ['kvstore', 'wiredtiger', '8191', 'mongod', 'kvstore synchronization'],
    component: 'KVStore',
    logLevel: 'WARN',
    meaningFa: 'پایگاه داده KVStore روی پورت ۸۱۹۱ وضعیت سینک دیتابیس لوکاپ و سوکت ارتباطی را پایش می‌کند.',
    meaningEn: 'KVStore storage engine status and port 8191 socket replication checkpoint.',
    rootCauseFa: 'همگام‌سازی جداول لوکاپ بزرگ یا تاخیر I/O دیسک در پاسخ‌دهی موتور KVStore.',
    rootCauseEn: 'Lookup collection sync or storage I/O latency.',
    recommendedFixFa: 'بررسی وضعیت با دستور splunk show kvstore-status و فعال‌سازی صریح پورت ۸۱۹۱ در server.conf.',
    recommendedFixEn: 'Inspect kvstore status via CLI and verify port 8191 readiness.',
    affectedConfig: 'server.conf',
    targetStanza: '[kvstore]',
    patchCode: 'port = 8191\ndisabled = false',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/AboutKVstore',
    canAutoApply: true
  },
  // 13. Search Concurrency & Resource Limits (SavedSplunker)
  {
    keywords: ['savedsplunker', 'searchparser', 'concurrency limit', 'max_searches_per_cpu', 'scheduled search concurrency'],
    component: 'SavedSplunker',
    logLevel: 'WARN',
    meaningFa: 'سقف تعداد جستجوهای زمان‌بندی شده همزمان روی هسته‌های پردازنده (CPU) تکمیل شده است.',
    meaningEn: 'Search scheduler concurrency threshold reached across available CPU cores.',
    rootCauseFa: 'همزمانی بیش از حد هشدارهای SOC با سقف پردازش سرچ‌هد.',
    rootCauseEn: 'Concurrent searches approaching max_searches_per_cpu baseline in limits.conf.',
    recommendedFixFa: 'تنظیم max_searches_per_cpu = 2 در limits.conf و توزیع پنجره زمانی اجرای جستجوها.',
    recommendedFixEn: 'Adjust max_searches_per_cpu in limits.conf and define schedule windows.',
    affectedConfig: 'limits.conf',
    targetStanza: '[search]',
    patchCode: 'max_searches_per_cpu = 2\nbase_max_searches = 6',
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Admin/Limitsconf',
    canAutoApply: true
  }
];

export function analyzeSplunkLogLine(rawLog: string): LiveLogAnalysis {
  const timestampMatch = rawLog.match(/^\[?(\d{2,4}[-/]\d{2}[-/]\d{2,4}[\sT]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:?\d{2})?)\]?/);
  const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleTimeString();

  const levelMatch = rawLog.match(/\s(FATAL|CRITICAL|ERROR|WARN|WARNING|INFO|DEBUG)\s/i);
  const logLevel = (levelMatch ? levelMatch[1].toUpperCase() : (
    rawLog.includes('FATAL') ? 'FATAL' :
    rawLog.includes('ERROR') ? 'ERROR' :
    rawLog.includes('WARN') ? 'WARN' : 'INFO'
  )) as 'FATAL' | 'ERROR' | 'WARN' | 'INFO';

  const compMatch = rawLog.match(/\s([a-zA-Z0-9_]+)(?:\s\[|\s-|:)/);
  const component = compMatch ? compMatch[1] : 'SplunkEngine';

  const logLower = rawLog.toLowerCase();

  // 1. Search rules
  for (const rule of SPLUNK_LOG_RULES) {
    if (rule.keywords.some(k => logLower.includes(k))) {
      return {
        rawLine: rawLog,
        timestamp,
        component: rule.component,
        logLevel: rule.logLevel,
        meaningFa: rule.meaningFa,
        meaningEn: rule.meaningEn,
        rootCauseFa: rule.rootCauseFa,
        rootCauseEn: rule.rootCauseEn,
        recommendedFixFa: rule.recommendedFixFa,
        recommendedFixEn: rule.recommendedFixEn,
        affectedConfig: rule.affectedConfig,
        targetStanza: rule.targetStanza,
        patchCode: rule.patchCode,
        docReference: rule.docReference,
        canAutoApply: rule.canAutoApply
      };
    }
  }

  // 2. Intelligent Dynamic Semantic Analysis for unlisted / custom log lines
  const cleanMessage = rawLog.replace(/^\[?.*?\]?\s*(FATAL|ERROR|WARN|INFO|DEBUG)?\s*([a-zA-Z0-9_]+)?\s*[-:]?\s*/, '').trim() || rawLog;

  let identifiedIssueFa = `تحلیل و تفسیر لاگ در زیرسیستم «${component}» با سطح اهمیت ${logLevel}`;
  let rootCauseFa = `رویداد ثبت شده در دیمن اسپلانک: «${cleanMessage}». ناشی از برقراری ارتباط، تغییر وضعیت سوکت‌ها یا بارگذاری کانفیگ.`;
  let recommendedFixFa = `بررسی وضعیت سرویس دیمن ${component} و اعتبارسنجی کانفیگ با دستور \`$SPLUNK_HOME/bin/splunk btool check\`.`;
  let targetFile = 'server.conf';
  let targetStanza = `[${component.toLowerCase()}]`;
  let patchCode = `# تنظیمات پیشنهادی جهت اصلاح وضعیت ${component}\n[${component.toLowerCase()}]\ndisabled = false`;

  // Semantic keyword heuristics
  if (logLower.includes('bind') || logLower.includes('address already in use') || logLower.includes('port')) {
    identifiedIssueFa = `تداخل و قفل بودن پورت شبکه در زیرسیستم ${component}`;
    rootCauseFa = `سوکت شبکه مورد نیاز توسط پروسه موازی یا باقیمانده از قبل اشغال شده و سرویس امکان بایند شدن روی پورت را ندارد.`;
    recommendedFixFa = `یافتن پروسه اشغال‌کننده با دستور \`fuser -k -n tcp <port>\` یا تغییر شماره پورت در فایل‌های کانفیگ system/local.`;
    targetFile = 'web.conf';
    targetStanza = '[settings]';
    patchCode = `httpport = 8001\nmgmtHostPort = 127.0.0.1:8090`;
  } else if (logLower.includes('permission') || logLower.includes('denied') || logLower.includes('access')) {
    identifiedIssueFa = `خطای سطح دسترسی لینوکس (Permission Denied) در زیرسیستم ${component}`;
    rootCauseFa = `کاربر اجرای دیمن اسپلانک مجوز رایت روی دایرکتوری داده، سوکت یا فایل‌های گزارش لاگ را ندارد.`;
    recommendedFixFa = `اصلاح مالکیت فایل‌ها و دایرکتوری با دستور \`chown -R splunk:splunk $SPLUNK_HOME\` و تنظیم مجوزهای 750.`;
    targetFile = 'server.conf';
    targetStanza = '[general]';
    patchCode = `# Linux Permission Alignment\n# chown -R splunk:splunk /opt/splunk\n`;
  } else if (logLower.includes('timeout') || logLower.includes('refused') || logLower.includes('unreachable')) {
    identifiedIssueFa = `خطای عدم دسترسی و قطعی ارتباط شبکه در ماژول ${component}`;
    rootCauseFa = `نود مقصد در دسترس نیست، فایروال پورت را مسدود کرده یا دیمن مقصد متوقف است.`;
    recommendedFixFa = `بررسی وضعیت باز بودن پورت با دستور \`nc -zvw3 <ip> <port>\` و بازکردن پورت در firewalld.`;
    targetFile = 'outputs.conf';
    targetStanza = '[tcpout]';
    patchCode = `server = 127.0.0.1:9997\nautoLBFrequency = 30\nuseACK = true`;
  }

  return {
    rawLine: rawLog,
    timestamp,
    component,
    logLevel,
    meaningFa: `${identifiedIssueFa}: این رویداد وضعیت عملکردی سیستم را گزارش می‌کند. جزئیات پیام: «${cleanMessage}».`,
    meaningEn: `Subsystem ${component} runtime diagnostic (Level: ${logLevel}): '${cleanMessage}'.`,
    rootCauseFa,
    rootCauseEn: `Runtime execution trace in ${component}: ${cleanMessage}`,
    recommendedFixFa,
    recommendedFixEn: `Validate settings for ${component} and execute splunk btool check.`,
    affectedConfig: targetFile,
    targetStanza,
    patchCode,
    docReference: 'https://docs.splunk.com/Documentation/Splunk/latest/Troubleshooting/Aboutserverdebuglogging',
    canAutoApply: true
  };
}
