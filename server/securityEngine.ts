  function getInitialAdminPassword(): string {
    const envPassword = String(process.env.SPLUNK_DOCTOR_BOOTSTRAP_PASSWORD || '').trim();
    if (envPassword.length >= 12) {
      try {
        fs.mkdirSync(path.dirname(BOOTSTRAP_PASSWORD_PATH), { recursive: true });
        fs.writeFileSync(BOOTSTRAP_PASSWORD_PATH, envPassword + '\\n', { mode: 0o600 });
      } catch (_) {}
      return envPassword;
    }

    try {
      if (fs.existsSync(BOOTSTRAP_PASSWORD_PATH)) {
        const stored = fs.readFileSync(BOOTSTRAP_PASSWORD_PATH, 'utf8').trim();
        if (stored.length >= 12) return stored;
      }
    } catch (_) {}

    const generated = crypto.randomBytes(24).toString('base64url');
    try {
      fs.mkdirSync(path.dirname(BOOTSTRAP_PASSWORD_PATH), { recursive: true });
      fs.writeFileSync(BOOTSTRAP_PASSWORD_PATH, generated + '\\n', { mode: 0o600 });
    } catch (_) {}
    return generated;
  }

  const initialPassword = getInitialAdminPassword();
  const adminPass = hashPassword(initialPassword);
  const engineerPass = hashPassword(initialPassword + '-engineer');
  const operatorPass = hashPassword(initialPassword + '-operator');
  const auditorPass = hashPassword(initialPassword + '-auditor');

  const users: InternalUserAccount[] = [
    {
      id: 'usr-admin-01',
      username: 'admin',
      fullName: 'مدیر ارشد سیستم (Super Admin)',
      email: 'admin@splunk-cluster.corp',
      role: 'super_admin',
      createdAt: now.toISOString(),
      expiresAt: inOneYear.toISOString(),
      isNeverExpires: true,
      isActive: true,