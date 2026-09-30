      companyName: 'Splunk Enterprise Customer',
      licenseKey: initialKey,
      tier: 'ENTERPRISE_COMMERCIAL',
      expiresAt: trialExp.toISOString(),
      maxNodes: 100,
      activatedAt: now.toISOString()
    },
    auditLogs: initialLogs
  };
}

// Load and Save Database
export function getSecurityStore(): SecurityStore {
  if (memoryStore) return memoryStore;

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      memoryStore = JSON.parse(data);
      if (memoryStore && Array.isArray(memoryStore.users)) {
        let changed = false;
        for (const u of memoryStore.users) {
          if (!u.permissions) {
            u.permissions = getDefaultPermissionsForRole(u.role);
            changed = true;
          }
        }
        if (changed) saveSecurityStore();
        return memoryStore;
      }
    } catch (_) {}
  }

  memoryStore = seedInitialStore();
  saveSecurityStore();
  return memoryStore;
}

export function saveSecurityStore(): void {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (_) {}
}

// Audit Logging