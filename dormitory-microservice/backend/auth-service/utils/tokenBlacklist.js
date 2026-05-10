const blacklistedTokens = new Map();

function addToken(token, expiresAt) {
  if (!token || !expiresAt) return;
  blacklistedTokens.set(token, expiresAt);
}

function isBlacklisted(token) {
  if (!token) return false;
  const expiresAt = blacklistedTokens.get(token);
  if (!expiresAt) return false;
  if (Date.now() >= expiresAt) {
    blacklistedTokens.delete(token);
    return false;
  }
  return true;
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, expiresAt] of blacklistedTokens.entries()) {
    if (now >= expiresAt) {
      blacklistedTokens.delete(token);
    }
  }
}

setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  addToken,
  isBlacklisted,
};
