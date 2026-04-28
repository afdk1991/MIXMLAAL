/**
 * 版本更新日志服务
 * 版本: v2.0.0
 * 用于记录版本更新的过程和状态
 */

import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(__dirname, '../../version_update.log');

const MAX_LOG_SIZE = 10 * 1024 * 1024;
const MAX_LOG_COUNT = 5;

const inMemoryLogs = [];
const MAX_IN_MEMORY_LOGS = 100;

let versionLogCallback = null;

export function setVersionLogCallback(callback) {
  versionLogCallback = callback;
}

export function logVersionUpdate(action, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    message,
    data
  };

  inMemoryLogs.push(logEntry);
  if (inMemoryLogs.length > MAX_IN_MEMORY_LOGS) {
    inMemoryLogs.shift();
  }

  const logString = JSON.stringify(logEntry) + '\n';

  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(LOG_FILE, logString);
    console.log(`[Version Log] ${action}: ${message}`);
  } catch (error) {
    console.error('Error writing version log:', error);
  }

  if (versionLogCallback) {
    versionLogCallback(logEntry);
  }

  return logEntry;
}

export function logVersionCheck(updateInfo) {
  return logVersionUpdate('VERSION_CHECK', 'Checked for version updates', {
    hasUpdate: updateInfo.hasUpdate,
    currentVersion: updateInfo.currentVersion,
    latestVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

export function logUpdateStart(updateInfo) {
  return logVersionUpdate('UPDATE_START', 'Starting version update', {
    currentVersion: updateInfo.currentVersion,
    targetVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

export function logUpdateComplete(updateInfo) {
  return logVersionUpdate('UPDATE_COMPLETE', 'Version update completed', {
    previousVersion: updateInfo.currentVersion,
    newVersion: updateInfo.latestVersion,
    fullVersion: updateInfo.fullVersion
  });
}

export function logUpdateError(updateInfo, error) {
  return logVersionUpdate('UPDATE_ERROR', 'Version update failed', {
    currentVersion: updateInfo.currentVersion,
    targetVersion: updateInfo.latestVersion,
    error: error.message
  });
}

export function getVersionLogs(limit = 50) {
  if (inMemoryLogs.length > 0) {
    return inMemoryLogs.slice(-limit);
  }

  try {
    if (fs.existsSync(LOG_FILE)) {
      const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
      const logs = logContent.split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log !== null)
        .reverse()
        .slice(0, limit);
      return logs;
    }
    return [];
  } catch (error) {
    console.error('Error reading version logs:', error);
    return [];
  }
}

export function clearOldLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > MAX_LOG_SIZE) {
        rotateLogs();
      }
    }
  } catch (error) {
    console.error('Error checking log size:', error);
  }
}

function rotateLogs() {
  try {
    for (let i = MAX_LOG_COUNT - 1; i > 0; i--) {
      const oldFile = `${LOG_FILE}.${i}`;
      const newFile = `${LOG_FILE}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        if (fs.existsSync(newFile)) {
          fs.unlinkSync(newFile);
        }
        fs.renameSync(oldFile, newFile);
      }
    }

    if (fs.existsSync(LOG_FILE)) {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.1`);
    }

    console.log('Log rotation completed');
  } catch (error) {
    console.error('Error rotating logs:', error);
  }
}

export function getLogStats() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return { count: 0, size: 0 };
    }

    const stats = fs.statSync(LOG_FILE);
    const logs = getVersionLogs(1000);

    return {
      count: logs.length,
      size: stats.size,
      lastUpdate: logs.length > 0 ? logs[logs.length - 1].timestamp : null
    };
  } catch (error) {
    console.error('Error getting log stats:', error);
    return { count: 0, size: 0 };
  }
}

export function searchLogs(keyword, limit = 50) {
  const allLogs = getVersionLogs(1000);
  return allLogs.filter(log =>
    log.message.includes(keyword) ||
    JSON.stringify(log.data).includes(keyword)
  ).slice(0, limit);
}

export function getLogsByAction(action, limit = 50) {
  const allLogs = getVersionLogs(1000);
  return allLogs.filter(log => log.action === action).slice(0, limit);
}