const fs = require('fs');
const path = require('path');

// 버전 정보를 저장할 파일 경로들
const PATHS = {
  ANDROID_GRADLE: 'apps/MediDealer/android/app/build.gradle',
  APP_CONSTANTS: 'apps/MediDealer/constants/app.ts',
  IOS_INFO_PLIST: 'apps/MediDealer/ios/MediDealer/Info.plist',
};

// 버전 형식: major.minor.patch
function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

// build.gradle 파일에서 버전 정보 추출
function getGradleVersion() {
  const content = fs.readFileSync(PATHS.ANDROID_GRADLE, 'utf8');
  const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
  const versionNameMatch = content.match(/versionName\s+"([^"]+)"/);
  
  return {
    versionCode: parseInt(versionCodeMatch[1]),
    versionName: versionNameMatch[1]
  };
}

// app.ts 파일에서 버전 정보 추출
function getAppVersion() {
  const content = fs.readFileSync(PATHS.APP_CONSTANTS, 'utf8');
  const versionMatch = content.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  return versionMatch[1];
}

// iOS Info.plist 파일에서 버전 정보 추출
function getIOSVersion() {
  const content = fs.readFileSync(PATHS.IOS_INFO_PLIST, 'utf8');
  const versionMatch = content.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
  const buildMatch = content.match(/<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/);
  
  // 빌드 번호가 NaN이거나 유효하지 않은 경우 Android의 versionCode를 사용
  const build = buildMatch[1];
  const buildNumber = parseInt(build);
  const validBuild = isNaN(buildNumber) ? getGradleVersion().versionCode : buildNumber;
  
  return {
    version: versionMatch[1],
    build: validBuild.toString()
  };
}

// build.gradle 파일 업데이트
function updateGradleVersion(versionCode, versionName) {
  let content = fs.readFileSync(PATHS.ANDROID_GRADLE, 'utf8');
  
  content = content.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`
  );
  
  content = content.replace(
    /versionName\s+"[^"]+"/,
    `versionName "${versionName}"`
  );
  
  fs.writeFileSync(PATHS.ANDROID_GRADLE, content);
}

// app.ts 파일 업데이트
function updateAppVersion(version) {
  let content = fs.readFileSync(PATHS.APP_CONSTANTS, 'utf8');
  
  content = content.replace(
    /APP_VERSION\s*=\s*['"][^'"]+['"]/,
    `APP_VERSION = '${version}'`
  );
  
  fs.writeFileSync(PATHS.APP_CONSTANTS, content);
}

// iOS Info.plist 파일 업데이트
function updateIOSVersion(version, build) {
  let content = fs.readFileSync(PATHS.IOS_INFO_PLIST, 'utf8');
  
  content = content.replace(
    /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]+<\/string>/,
    `<key>CFBundleShortVersionString</key>\n\t<string>${version}</string>`
  );
  
  content = content.replace(
    /<key>CFBundleVersion<\/key>\s*<string>[^<]+<\/string>/,
    `<key>CFBundleVersion</key>\n\t<string>${build}</string>`
  );
  
  fs.writeFileSync(PATHS.IOS_INFO_PLIST, content);
}

// 버전 증가 함수
function bumpVersion(type = 'patch') {
  const gradleVersion = getGradleVersion();
  const appVersion = getAppVersion();
  const iosVersion = getIOSVersion();
  
  // 버전 파싱
  const version = parseVersion(appVersion);
  
  // 버전 증가
  switch (type) {
    case 'major':
      version.major += 1;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor += 1;
      version.patch = 0;
      break;
    case 'patch':
      version.patch += 1;
      break;
  }
  
  // 새로운 버전 문자열 생성
  const newVersion = formatVersion(version);
  
  // versionCode/build 번호 증가
  const newVersionCode = gradleVersion.versionCode + 1;
  const newBuildNumber = parseInt(iosVersion.build) + 1;
  
  // 파일 업데이트
  updateGradleVersion(newVersionCode, newVersion);
  updateAppVersion(newVersion);
  updateIOSVersion(newVersion, newBuildNumber.toString());
  
  console.log('버전 업데이트 완료:');
  console.log(`- versionCode (Android): ${newVersionCode}`);
  console.log(`- versionName (Android): ${newVersion}`);
  console.log(`- APP_VERSION: ${newVersion}`);
  console.log(`- CFBundleShortVersionString (iOS): ${newVersion}`);
  console.log(`- CFBundleVersion (iOS): ${newBuildNumber}`);
}

// 커맨드 라인 인자 처리
const type = process.argv[2] || 'patch';
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('유효하지 않은 버전 타입입니다. major, minor, patch 중 하나를 선택해주세요.');
  process.exit(1);
}

bumpVersion(type); 