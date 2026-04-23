import { Hyperlit } from '@umijs/max';

const versionInfo = {
  version: '1.0.0',
  fullVersion: 'MIXMLAAL-1.0.0-20260423',
  major: 1,
  minor: 0,
  revision: 0,
  build: 0,
  timestamp: '20260423',
  project: 'MIXMLAAL',
  versionType: 'admin'
};

console.log('MIXMLAAL React Admin Version:', versionInfo.fullVersion);

export const request: Hyperlit.RequestConfig = {
  timeout: 10000,
  errorHandler: (error: any) => {
    console.error('Request error:', error);
  },
};

export const version = versionInfo;
