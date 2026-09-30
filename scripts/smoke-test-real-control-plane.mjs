import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
const password = 'CI-Offline-Test-2026!';
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: String(PORT),
  SPLUNK_HOME: '/tmp/dr-splunk-ci-no-splunk',
  SPLUNK_DOCTOR_BOOTSTRAP_PASSWORD: password,
  HOME: '/tmp/dr-splunk-ci-home'
};

fs.rmSync(env.HOME, { recursive: true, force: true });
fs.mkdirSync(env.HOME, { recursive: true });
fs.rmSync(env.SPLUNK_HOME, { recursive: true, force: true });

function request(pathname, options = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, BASE);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      timeout: 15000
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch {}
        resolve({ status: res.statusCode || 0, headers: res.headers, text: data, json: parsed });
      });
    });
    req.on('timeout', () => req.destroy(new Error('request timeout')));
    req.on('error', reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

async function waitForServer(child) {
  let lastError = '';
  for (let i = 0; i < 40; i++) {
    if (child.exitCode !== null) throw new Error(`server exited early: ${lastError}`);
    try {
      const r = await request('/');
      if (r.status === 200) return;
      lastError = `HTTP ${r.status}`;
    } catch (e) {
      lastError = e.message;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`server did not become ready: ${lastError}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const child = spawn(process.execPath, ['dist/server.cjs'], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let stdout = '';
let stderr = '';
child.stdout.on('data', b => { stdout += b.toString(); });
child.stderr.on('data', b => { stderr += b.toString(); });

try {
  await waitForServer(child);

  let r = await request('/api/real/system');
  assert(r.status === 401, `unauthenticated API should be 401, got ${r.status}`);

  r = await request('/api/auth/login', { method: 'POST' }, { username: 'admin', password });
  assert(r.status === 200 && r.json?.success && r.json?.token, `login failed: HTTP ${r.status} ${r.text}`);
  const token = r.json.token;
  const auth = { authorization: `Bearer ${token}` };

  const checks = [
    ['GET', '/api/auth/me', undefined],
    ['GET', '/api/real/system', undefined],
    ['POST', '/api/real/network/scan', {}],
    ['POST', '/api/real/node/probe', { host: '127.0.0.1', ports: [PORT] }],
    ['POST', '/api/real/hardening/plan', {}],
    ['POST', '/api/real/design', { dailyGb: 10, retentionDays: 30, users: 20, searchConcurrency: 5, replicationFactor: 3, searchFactor: 2 }],
    ['GET', '/api/real/splunk/preflight', undefined],
    ['GET', '/api/real/artifacts', undefined],
    ['POST', '/api/real/overseer/step', { step: 'environment' }],
    ['POST', '/api/real/overseer/step', { step: 'security' }],
    ['POST', '/api/real/validate/cluster', { nodes: [{ ip: '127.0.0.1', ports: [PORT] }] }],
    ['POST', '/api/tools/validate', { toolId: 'health_audit' }],
    ['POST', '/api/tools/validate-all', {}]
  ];


  const allToolIds = [
    'architect_overseer','autonomous_agent','ai_diagnostics','bento_overview',
    'cluster_deployer','architecture_auditor','topology','management_nodes',
    'commercial_license','docker_k8s','health_audit','live_logs','config_editor',
    'doc_reference','heartbeat_radar','alert_manager','network_sources',
    'component_agents','remote_gateway','package_center','backup_archive',
    'network_toolbox','admin_security'
  ];

  for (const toolId of allToolIds) {
    r = await request('/api/tools/validate', { method: 'POST', headers: auth }, { toolId });
    assert(r.status === 200, `tool validation failed for ${toolId}: HTTP ${r.status} ${r.text}`);
    assert(r.json?.toolId === toolId, `tool validation returned wrong toolId for ${toolId}`);
    assert(r.json?.status === 'healthy' || r.json?.status === 'warning',
      `tool validation returned invalid status for ${toolId}: ${r.text}`);
  }

  for (const [method, path, body] of checks) {
    r = await request(path, { method, headers: auth }, body);
    assert(r.status === 200, `${method} ${path} failed: HTTP ${r.status} ${r.text.slice(0, 1000)}`);
    assert(r.json?.success !== false, `${method} ${path} returned success=false`);
  }

  r = await request('/api/tools/validate-all', { method: 'POST', headers: auth }, {});
  assert((r.json?.healthyCount ?? 0) + (r.json?.warningCount ?? 0) === r.json?.totalTools,
    'validate-all counts do not add up to totalTools');

  const rejectionChecks = [
    ['POST', '/api/real/deploy/direct', {}],
    ['POST', '/api/real/deploy/container', { runtime: 'podman', image: '' }],
    ['POST', '/api/real/deploy/kubernetes', { adminPassword: password }],
    ['POST', '/api/real/hardening/apply', { controls: [] }],
    ['POST', '/api/real/deploy/remote-hardening', { host: '127.0.0.1', sshUser: 'ci-runner', sshPort: 22 }],
    ['POST', '/api/real/overseer/step', { step: 'stanza' }],
    ['POST', '/api/real/splunk/control', { action: 'start' }],
    ['GET', '/api/real/splunk/topology', undefined]
  ];

  for (const [method, path, body] of rejectionChecks) {
    r = await request(path, { method, headers: auth }, body);
    assert(r.status >= 400, `${method} ${path} should reject missing prerequisites, got HTTP ${r.status} ${r.text}`);
  }

  r = await request('/api/system/terminal/exec', { method: 'POST' }, { command: 'id' });
  assert(r.status === 401, `terminal must require auth, got ${r.status}`);

  console.log('[SMOKE] PASS: authenticated real control-plane checks and negative prerequisite checks completed.');
} catch (error) {
  console.error('[SMOKE] FAIL:', error.message);
  console.error('[SMOKE] server stdout:', stdout);
  console.error('[SMOKE] server stderr:', stderr);
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve => {
    const timer = setTimeout(resolve, 3000);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  });
}
