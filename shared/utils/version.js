/**
 * 版本管理工具
 * 用于获取和显示完整版本号
 */

const fs = require('fs');
const path = require('path');

/**
 * 获取版本信息
 * @returns {Object} 版本信息对象
 */
function getVersionInfo() {
  try {
    // 尝试从 build_version.json 文件读取版本信息
    const versionFilePath = path.join(__dirname, '../../build_version.json');
    if (fs.existsSync(versionFilePath)) {
      const versionData = fs.readFileSync(versionFilePath, 'utf-8');
      return JSON.parse(versionData);
    }
    
    // 如果文件不存在，返回默认版本信息
    return {
      version: '0.0.0.0',
      fullVersion: 'MIXMLAAL-0.0.0.0-00000000000000',
      major: 0,
      minor: 0,
      revision: 0,
      build: 0,
      timestamp: '00000000000000',
      project: 'MIXMLAAL',
      versionType: 'unknown'
    };
  } catch (error) {
    console.error('Failed to get version info:', error);
    // 出错时返回默认版本信息
    return {
      version: '0.0.0.0',
      fullVersion: 'MIXMLAAL-0.0.0.0-00000000000000',
      major: 0,
      minor: 0,
      revision: 0,
      build: 0,
      timestamp: '00000000000000',
      project: 'MIXMLAAL',
      versionType: 'unknown'
    };
  }
}

/**
 * 获取完整版本号字符串
 * @returns {string} 完整版本号
 */
function getFullVersion() {
  const versionInfo = getVersionInfo();
  return versionInfo.fullVersion;
}

/**
 * 获取标准版本号字符串
 * @returns {string} 标准版本号
 */
function getVersion() {
  const versionInfo = getVersionInfo();
  return versionInfo.version;
}

/**
 * 获取版本组件
 * @returns {Object} 版本组件对象
 */
function getVersionComponents() {
  const versionInfo = getVersionInfo();
  return {
    major: versionInfo.major,
    minor: versionInfo.minor,
    revision: versionInfo.revision,
    build: versionInfo.build,
    timestamp: versionInfo.timestamp
  };
}

// 同时支持CommonJS和ES模块系统
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getVersionInfo,
    getFullVersion,
    getVersion,
    getVersionComponents
  };
}

if (typeof exports !== 'undefined') {
  exports.getVersionInfo = getVersionInfo;
  exports.getFullVersion = getFullVersion;
  exports.getVersion = getVersion;
  exports.getVersionComponents = getVersionComponents;
}

if (typeof window !== 'undefined') {
  window.VersionUtils = {
    getVersionInfo,
    getFullVersion,
    getVersion,
    getVersionComponents
  };
}

// ES模块导出
export {
  getVersionInfo,
  getFullVersion,
  getVersion,
  getVersionComponents
};
