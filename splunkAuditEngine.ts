import { SplunkFinding, RemediationOption } from '../types';
import { INITIAL_FINDINGS } from '../data/initialConfigs';

/**
 * Applies a specific remediation option to the target raw configuration text.
 */
export function applyRemediationOption(
  rawText: string,
  option: RemediationOption
): string {
  let newText = rawText;
  const optId = option.id;

  // 1. Outputs SSL Encryption
  if (optId.startsWith('opt-ssl')) {
    newText = newText
      .replace(/useSSL\s*=\s*(false|0)/gi, 'useSSL = true')
      .replace(/sslVerifyServerCert\s*=\s*(false|0)/gi, 'sslVerifyServerCert = true\nsslRootCAPath = $SPLUNK_HOME/etc/auth/cacert.pem\nsslCertPath = $SPLUNK_HOME/etc/auth/server.pem');
    if (!/useSSL\s*=\s*(true|1)/i.test(newText)) {
      newText = newText.replace(/\[tcpout\]/i, '[tcpout]\nuseSSL = true\nsslVerifyServerCert = true');
    }
  }
  // 2. Pass4SymmKey Authentication Secret
  else if (optId.startsWith('opt-pass')) {
    newText = newText.replace(/pass4SymmKey\s*=\s*(changeme|default)/gi, 'pass4SymmKey = 9f8a3c8e7b1a2d4f5c6e8b0a1d3e5f7a');
  }
  // 3. Modernize TLS Versions
  else if (optId.startsWith('opt-tls')) {
    newText = newText
      .replace(/sslVersionsToSupport\s*=\s*[^\n]+/gi, 'sslVersionsToSupport = tls1.2, tls1.3')
      .replace(/allowSslCompression\s*=\s*true/gi, 'allowSslCompression = false')
      .replace(/allowSslRenegotiation\s*=\s*true/gi, 'allowSslRenegotiation = false');
  }
  // 4. Missing Routing Group
  else if (optId.startsWith('opt-route')) {
    if (optId === 'opt-route-default') {
      newText = newText.replace(/_TCP_ROUTING\s*=\s*tcpout:missing_group[^\n]*/gi, '# _TCP_ROUTING = (uses defaultGroup from outputs.conf)');
    } else {
      newText = newText.replace(/_TCP_ROUTING\s*=\s*tcpout:missing_group/gi, '_TCP_ROUTING = primary_indexers');
    }
  }
  // 5. Props / Transforms Errors
  else if (optId.startsWith('opt-props')) {
    newText = newText
      .replace(/TRANSFORMS-routing\s*=\s*missing_transform/gi, '# TRANSFORMS-routing = syslog_routing (Remediated)')
      .replace(/LOOKUP-threat\s*=\s*threat_intel_feed_lookup[^\n]*/gi, '# LOOKUP-threat = threat_intel_lookup (Remediated)');
  }
  // 6. Outputs Bad Port Format (Missing :9997)
  else if (optId.startsWith('opt-port')) {
    if (optId === 'opt-port-dns') {
      newText = newText.replace(/server\s*=\s*10\.20\.30\.50:9997,\s*10\.20\.30\.51[^\n]*/gi, 'server = idx01.corp.net:9997, idx02.corp.net:9997');
    } else {
      newText = newText.replace(/server\s*=\s*([^\n]*?10\.20\.30\.51)(?!\:\d+)/gi, 'server = $1:9997');
      newText = newText.replace(/10\.20\.30\.50:9997,\s*10\.20\.30\.51(?!\:\d+)/gi, '10.20.30.50:9997, 10.20.30.51:9997');
    }
  }
  // 7. Inputs Missing Index OR Delete Non-existent winevent stanza
  else if (optId === 'opt-delete-winevent-stanza') {
    // Purge the nonexistent winevent stanza completely
    newText = newText.replace(/#?\s*\[monitor:\/\/\/var\/log\/winevent\/security\.evtx\][\s\S]*?(?=\n\[|$)/gi, '');
    newText = newText.replace(/# 3\. Active Directory Windows Security Monitor\s*\n?/gi, '');
  }
  else if (optId.startsWith('opt-add-index') || optId === 'opt-index-cli') {
    const targetIdx = optId === 'opt-add-index-wineventlog' ? 'wineventlog' : 'os_win';
    const winStanzaRegex = /\[monitor:\/\/\/var\/log\/winevent\/security\.evtx\]([\s\S]*?)(?=\n\[|$)/i;
    const match = newText.match(winStanzaRegex);
    if (match) {
      let stanzaBody = match[1];
      if (!stanzaBody.includes('index =') && !stanzaBody.includes('index=')) {
        if (optId === 'opt-add-index-whitelist') {
          stanzaBody = stanzaBody + `\nindex = os_win\nwhitelist = 4624,4625,4720,4726,4738,4672,1102\nrenderXml = true`;
        } else {
          stanzaBody = stanzaBody + `\nindex = ${targetIdx}`;
        }
        newText = newText.replace(winStanzaRegex, `[monitor:///var/log/winevent/security.evtx]${stanzaBody}`);
      }
    } else {
      // Stanza does not exist in text, nothing to patch
    }
  }
  // 8. Disk Space Minimum
  else if (optId.startsWith('opt-disk')) {
    newText = newText.replace(/minFreeSpaceMB\s*=\s*\d+/gi, 'minFreeSpaceMB = 5000');
  }
  // 9. Indexes Corrupted Volume Path
  else if (optId.startsWith('opt-idx')) {
    newText = newText
      .replace(/\/mnt\/non_existent_volume/gi, '$SPLUNK_DB/corrupted_temp_idx')
      .replace(/frozenTimePeriodInSecs\s*=\s*3600/gi, 'frozenTimePeriodInSecs = 7776000');
  }
  // 10. HEC Plain HTTP / SSL
  else if (optId.startsWith('opt-hec')) {
    newText = newText.replace(/enableSSL\s*=\s*0/gi, 'enableSSL = 1\nsslVersions = tls1.2,tls1.3');
  }
  // Fallback snippet insertion
  else if (option.replacementConfigSnippet) {
    if (!newText.includes(option.replacementConfigSnippet)) {
      newText += '\n' + option.replacementConfigSnippet;
    }
  }

  return newText;
}

/**
 * Real-time Audit function that inspects the current config files content line-by-line
 * and returns active findings, resolved findings, and the resulting health score (0-100).
 */
export function auditSplunkConfigs(
  currentConfigs: Record<string, string>,
  explicitResolvedIds: Set<string> = new Set()
): {
  activeFindings: SplunkFinding[];
  resolvedFindings: SplunkFinding[];
  score: number;
} {
  const activeFindings: SplunkFinding[] = [];
  const resolvedFindings: SplunkFinding[] = [];

  const outputsConf = currentConfigs['outputs.conf'] || '';
  const serverConf = currentConfigs['server.conf'] || '';
  const inputsConf = currentConfigs['inputs.conf'] || '';
  const propsConf = currentConfigs['props.conf'] || '';
  const indexesConf = currentConfigs['indexes.conf'] || '';

  // Rule 1: outputs.conf — Cleartext Log Transmission (useSSL = false)
  const f1 = INITIAL_FINDINGS.find(f => f.id === 'crit-tcpout-cleartext');
  if (f1) {
    const hasSslIssue = /useSSL\s*=\s*(false|0)/i.test(outputsConf) || !outputsConf.includes('useSSL');
    const hasSslEnabled = /useSSL\s*=\s*(true|1)/i.test(outputsConf);
    const isFixed = hasSslEnabled && !/useSSL\s*=\s*(false|0)/i.test(outputsConf);
    if (isFixed) {
      resolvedFindings.push(f1);
    } else {
      activeFindings.push(f1);
    }
  }

  // Rule 2: server.conf — Default pass4SymmKey
  const f2 = INITIAL_FINDINGS.find(f => f.id === 'crit-server-pass4symmkey');
  if (f2) {
    const hasDefaultKey = /pass4SymmKey\s*=\s*(changeme|default)/i.test(serverConf);
    const isFixed = !hasDefaultKey && serverConf.includes('pass4SymmKey') && !serverConf.includes('pass4SymmKey = changeme');
    if (isFixed) {
      resolvedFindings.push(f2);
    } else {
      activeFindings.push(f2);
    }
  }

  // Rule 3: server.conf — Insecure TLS & Compression (ssl3, tls1.0)
  const f3 = INITIAL_FINDINGS.find(f => f.id === 'crit-server-ssl-versions');
  if (f3) {
    const hasInsecureTls = /sslVersionsToSupport\s*=\s*.*(ssl3|tls1\.0)/i.test(serverConf) ||
                           /allowSslCompression\s*=\s*true/i.test(serverConf);
    const isFixed = !hasInsecureTls && serverConf.includes('sslVersionsToSupport');
    if (isFixed) {
      resolvedFindings.push(f3);
    } else {
      activeFindings.push(f3);
    }
  }

  // Rule 4: inputs.conf — Broken TCP Routing Group (_TCP_ROUTING = tcpout:missing_group)
  const f4 = INITIAL_FINDINGS.find(f => f.id === 'crit-inputs-tcp-routing-broken');
  if (f4) {
    const hasBrokenRoute = /_TCP_ROUTING\s*=\s*.*missing_group/i.test(inputsConf);
    const isFixed = !hasBrokenRoute;
    if (isFixed) {
      resolvedFindings.push(f4);
    } else {
      activeFindings.push(f4);
    }
  }

  // Rule 5: props.conf — Missing Transform / Lookup
  const f5 = INITIAL_FINDINGS.find(f => f.id === 'crit-props-missing-transforms');
  if (f5) {
    const hasMissingTransform = /TRANSFORMS-routing\s*=\s*missing_transform/i.test(propsConf) ||
                                /LOOKUP-threat\s*=\s*threat_intel_feed_lookup/i.test(propsConf);
    const isFixed = !hasMissingTransform;
    if (isFixed) {
      resolvedFindings.push(f5);
    } else {
      activeFindings.push(f5);
    }
  }

  // Rule 6: outputs.conf — Bad Format Port Missing
  const f6 = INITIAL_FINDINGS.find(f => f.id === 'warn-outputs-bad-format');
  if (f6) {
    const hasBadPort = /10\.20\.30\.51(?!\:\d+)/i.test(outputsConf) ||
                       /server\s*=\s*[^;\n]*:\s*,/i.test(outputsConf);
    const isFixed = !hasBadPort;
    if (isFixed) {
      resolvedFindings.push(f6);
    } else {
      activeFindings.push(f6);
    }
  }

  // Rule 7: inputs.conf — Input Lacks Target Index
  const f7 = INITIAL_FINDINGS.find(f => f.id === 'warn-inputs-no-index');
  if (f7) {
    const winStanzaRegex = /^\s*\[monitor:\/\/\/var\/log\/winevent\/security\.evtx\]([\s\S]*?)(?=\n\s*\[|$)/im;
    const match = inputsConf.match(winStanzaRegex);

    if (!match) {
      resolvedFindings.push(f7);
    } else {
      const stanzaBody = match[1] || '';
      const hasExplicitIndex = /^\s*index\s*=/im.test(stanzaBody);
      const isDisabled = /^\s*disabled\s*=\s*(true|1)/im.test(stanzaBody);
      const isFixed = hasExplicitIndex || isDisabled;
      if (isFixed) {
        resolvedFindings.push(f7);
      } else {
        activeFindings.push(f7);
      }
    }
  }

  // Rule 8: server.conf — Low Disk Space MinFreeSpaceMB = 1000
  const f8 = INITIAL_FINDINGS.find(f => f.id === 'warn-server-diskusage-low');
  if (f8) {
    const hasLowDisk = /minFreeSpaceMB\s*=\s*(1000|500|100)\b/i.test(serverConf);
    const isFixed = !hasLowDisk;
    if (isFixed) {
      resolvedFindings.push(f8);
    } else {
      activeFindings.push(f8);
    }
  }

  // Rule 9: indexes.conf — Corrupted Non-existent Volume Path
  const f9 = INITIAL_FINDINGS.find(f => f.id === 'warn-indexes-corrupted-path');
  if (f9) {
    const hasCorruptedPath = indexesConf.includes('/mnt/non_existent_volume') && 
                             !/disabled\s*=\s*(true|1)/i.test(indexesConf);
    const isFixed = !hasCorruptedPath;
    if (isFixed) {
      resolvedFindings.push(f9);
    } else {
      activeFindings.push(f9);
    }
  }

  // Rule 10: inputs.conf — HEC Plain HTTP (enableSSL = 0)
  const f10 = INITIAL_FINDINGS.find(f => f.id === 'crit-hec-plain-http');
  if (f10) {
    const hasHecPlainHttp = /\[http\][\s\S]*?enableSSL\s*=\s*0/i.test(inputsConf);
    const isFixed = !hasHecPlainHttp;
    if (isFixed) {
      resolvedFindings.push(f10);
    } else {
      activeFindings.push(f10);
    }
  }

  // Calculate dynamic score: 100 max, -12 per critical, -5 per warning
  const critCount = activeFindings.filter(f => f.severity === 'critical').length;
  const warnCount = activeFindings.filter(f => f.severity === 'warning').length;
  const penalty = (critCount * 12) + (warnCount * 5);
  const score = Math.max(10, 100 - penalty);

  return {
    activeFindings,
    resolvedFindings,
    score
  };
}
