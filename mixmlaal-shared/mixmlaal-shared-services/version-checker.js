/**
 * 版本检查服务
 * 版本: v2.0.0
 * 用于检查应用版本更新
 */

const logger = {
  info: (msg, ...args) => console.log(`[Version Check] INFO: ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[Version Check] ERROR: ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[Version Check] WARN: ${msg}`, ...args)
};

let versionLogCallback = null;

export function setVersionLogCallback(callback) {
  versionLogCallback = callback;
}

function logVersionUpdate(action, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    message,
    data
  };

  logger.info(`${action}: ${message}`, data);

  if (versionLogCallback) {
    versionLogCallback(logEntry);
  }

  return logEntry;
}

/**
 * 检查版本更新
 * @param {string} currentVersion - 当前版本号
 * @returns {Promise<Object>} 版本检查结果
 */
export async function checkVersionUpdate(currentVersion) {
  try {
    const response = await fetch('/api/v1/version');
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }

    const data = await response.json();
    const latestVersion = data.data;

    const isUpdateAvailable = compareVersions(currentVersion, latestVersion.version);

    const updateInfo = {
      hasUpdate: isUpdateAvailable,
      currentVersion: currentVersion,
      latestVersion: latestVersion.version,
      fullVersion: latestVersion.fullVersion,
      versionInfo: latestVersion,
      releaseNotes: latestVersion.releaseNotes || '',
      releaseDate: latestVersion.releaseDate || null,
      downloadUrl: latestVersion.downloadUrl || '',
      mandatory: latestVersion.mandatory || false
    };

    logVersionUpdate('VERSION_CHECK', 'Checked for version updates', {
      hasUpdate: updateInfo.hasUpdate,
      currentVersion: updateInfo.currentVersion,
      latestVersion: updateInfo.latestVersion
    });

    return updateInfo;
  } catch (error) {
    logger.error('Error checking version update:', error);
    return {
      hasUpdate: false,
      error: error.message
    };
  }
}

/**
 * 比较版本号
 * @param {string} current - 当前版本号
 * @param {string} latest - 最新版本号
 * @returns {boolean} 是否需要更新
 */
export function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentVal = currentParts[i] || 0;
    const latestVal = latestParts[i] || 0;

    if (latestVal > currentVal) {
      return true;
    } else if (latestVal < currentVal) {
      return false;
    }
  }

  return false;
}

/**
 * 显示版本更新提示
 * @param {Object} updateInfo - 更新信息
 * @param {Function} onConfirm - 确认更新回调
 */
export function showUpdateNotification(updateInfo, onConfirm) {
  if (updateInfo.hasUpdate) {
    const message = updateInfo.mandatory
      ? `发现新版本 ${updateInfo.fullVersion} (强制更新)\n\n${updateInfo.releaseNotes}\n\n是否立即更新？`
      : `发现新版本 ${updateInfo.fullVersion}\n\n${updateInfo.releaseNotes}\n\n是否立即更新？`;

    if (window.confirm(message)) {
      logVersionUpdate('UPDATE_START', 'Starting version update', {
        currentVersion: updateInfo.currentVersion,
        targetVersion: updateInfo.latestVersion
      });

      if (onConfirm) {
        try {
          onConfirm();
          logVersionUpdate('UPDATE_COMPLETE', 'Version update completed', {
            previousVersion: updateInfo.currentVersion,
            newVersion: updateInfo.latestVersion
          });
        } catch (error) {
          logVersionUpdate('UPDATE_ERROR', 'Version update failed', {
            currentVersion: updateInfo.currentVersion,
            targetVersion: updateInfo.latestVersion,
            error: error.message
          });
        }
      } else {
        if (updateInfo.downloadUrl) {
          window.location.href = updateInfo.downloadUrl;
        } else {
          window.location.reload();
        }
      }
    }
  }
}

/**
 * 自动检查版本更新
 * @param {string} currentVersion - 当前版本号
 * @param {number} interval - 检查间隔（毫秒）
 */
export function autoCheckVersion(currentVersion, interval = 300000) {
  checkVersionUpdate(currentVersion).then(updateInfo => {
    if (updateInfo.hasUpdate) {
      showUpdateNotification(updateInfo);
    }
  });

  setInterval(() => {
    checkVersionUpdate(currentVersion).then(updateInfo => {
      if (updateInfo.hasUpdate) {
        showUpdateNotification(updateInfo);
      }
    });
  }, interval);
}

/**
 * 手动触发版本检查
 * @param {string} currentVersion - 当前版本号
 * @returns {Promise<Object>} 版本检查结果
 */
export async function manualCheckVersion(currentVersion) {
  return checkVersionUpdate(currentVersion);
}

/**
 * 获取版本历史
 * @param {number} limit - 限制返回数量
 * @returns {Promise<Array>} 版本历史列表
 */
export async function getVersionHistory(limit = 10) {
  try {
    const response = await fetch(`/api/v1/version/history?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch version history');
    }

    const data = await response.json();
    return data.versions || [];
  } catch (error) {
    logger.error('Error fetching version history:', error);
    return [];
  }
}