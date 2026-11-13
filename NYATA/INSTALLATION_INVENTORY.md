# NYATA Installation Inventory

Prepared for QA review: 2026-11-11

## Executive summary

The largest installation in this setup is the JavaScript dependency tree under `node_modules`. The lockfile currently describes 882 package entries, including direct dependencies and transitive dependencies. These packages support the Expo/React Native app, TypeScript checks, and Jest tests.

The Android emulator and Android SDK were already available on the machine when troubleshooting reached the project. The project used the installed Android Debug Bridge at:

```text
C:\Users\stock\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

The native build also downloaded Gradle 8.14.3 into Gradle’s user cache. Android Studio’s bundled JDK 25 was found, but it is too new for this project’s Gradle build. A Temurin JDK 17 download was started, but the MSI installation was cancelled and should be treated as **not installed**.

## Installation status legend

- **Installed by project setup:** installed or regenerated while repairing this repository.
- **Already present / discovered:** used by the project, but not installed by this troubleshooting session.
- **Generated:** created by Expo from project configuration.
- **Attempted but not installed:** download or install did not complete.

## 1. Machine-level tools

| Tool | Status | Relevance |
|---|---|---|
| Node.js | Already present / discovered | Runs npm, Expo CLI, Metro, TypeScript, and Jest. The observed Node executable is under `C:\Program Files\nodejs`. |
| npm 11.20.0 | Already present / discovered | Installs the JavaScript dependency tree and runs project scripts. PowerShell’s `npm.ps1` wrapper is blocked, so use `npm.cmd`. |
| Android Studio | Already present / discovered | Provides the Android SDK manager, emulator/device manager, bundled JDK, and Android development tools. |
| Android SDK | Already present / discovered | Provides the Android platform needed by the emulator and native build. |
| Android SDK Platform-Tools / ADB | Already present / discovered | Lets Expo and Gradle communicate with the emulator. Verified ADB version `1.0.41`, emulator status `device`. |
| Android Emulator | Already present / discovered | The active emulator was identified as `emulator-5554`, model `sdk_gphone64_x86_64`. |
| Git | Not verified during this session | Useful for source control, but not required to launch the current app. |
| JDK 25 bundled with Android Studio | Already present / discovered | Can run `java`, but is too new for this Gradle/Groovy build; it caused `Unsupported class file major version 69`. |
| Temurin JDK 17 | Attempted but not installed | Required for the native Gradle build. The 160 MB MSI downloaded and passed hash verification, but Windows cancelled the installation before completion. |

## 2. Project-level JavaScript dependencies

`npm.cmd install`, `npm.cmd ci`, and Expo’s package installer populated `node_modules` according to `package.json` and `package-lock.json`. The lockfile contains 882 resolved package entries. Most of those are transitive packages required by the direct packages below; they are not separate app features.

### Runtime dependencies

| Package | Relevance |
|---|---|
| `expo@~54.0.0` | Expo runtime and CLI integration for the React Native app. |
| `expo-router@~6.0.0` | File-based navigation and route entry point. |
| `react@19.1.0` | React runtime. |
| `react-native@0.81.5` | Native Android UI/runtime implementation. |
| `react-dom@19.1.0` | Peer dependency required by Expo Router/web tooling; not used as the Android UI renderer. |
| `react-native-web@~0.21.0` | Expo Router/web peer support; not needed for the Android target itself, but required by the installed Router package’s peer graph. |
| `@expo/vector-icons` | Icon components for React Native/Expo UI. |
| `@react-navigation/native` | Navigation primitives used by Expo Router. |
| `expo-constants` | Required Expo Router peer package for app/runtime constants. |
| `expo-font` | Required by Expo Router and vector/icon support; also added as an Expo config plugin. |
| `expo-linking` | Required Expo Router peer package for deep links and route URLs. |
| `expo-status-bar` | Controls the Android status-bar appearance. |
| `react-native-safe-area-context` | Handles screen cutouts, status bars, and safe content insets. |
| `react-native-screens` | Native screen primitives used by navigation. |

### Development dependencies

| Package | Relevance |
|---|---|
| `typescript~5.9.2` | TypeScript compiler used by `npm.cmd run typecheck`. |
| `@types/react` | TypeScript declarations for React. |
| `jest~29.7.0` | Test runner. |
| `jest-expo~54.0.0` | Jest preset/configuration for Expo projects. |
| `@types/jest^29.5.14` | TypeScript declarations for Jest tests. |

### Why the package versions were changed

Expo reported that the initial manifest used incompatible versions. The following versions were aligned with the installed Expo SDK:

- `react-native`: `0.81.4` → `0.81.5`
- `jest`: `30.x` → `~29.7.0`
- `@types/jest`: `30.x` → `^29.5.14`
- Added `react-dom@19.1.0` and `react-native-web@~0.21.0` to satisfy Expo Router peers without npm selecting an incompatible React DOM version.
- Added `expo-constants`, `expo-font`, and `expo-linking` after Expo Doctor identified them as required peer dependencies.

No `--force` or `--legacy-peer-deps` installation was used to bypass these conflicts.

## 3. Generated and cached native build files

| Item | Status | Relevance |
|---|---|---|
| `android/` | Generated by `expo run:android` | Native Android project generated from `app.json` and Expo configuration. It is ignored by the current `.gitignore`, so it is local build output rather than committed source at this stage. |
| Gradle 8.14.3 distribution | Downloaded by the native build | Builds the generated Android project. It is stored in the user Gradle cache, not in the repository. |
| Android Gradle build cache | Generated/used | Speeds up subsequent native builds. It is outside the app source and can be regenerated. |
| `.expo/` | Generated by Expo | Local Expo project metadata/cache used by the development server. It is not app data. |
| `expo-doctor@1.21.8` | Temporary `npx` package download | Used once to run 18 Expo health checks. It is a diagnostic tool, not an app runtime dependency. |

The native prebuild also added the `expo-font` plugin to `app.json` and added the standard `ios` script to `package.json`. Those changes are configuration changes, not large external installations.

## 4. Repeated cleanup/reinstall actions

The first dependency installation attempts left a partial `node_modules` tree because a stale Node/Expo process and Windows file locks caused `EPERM`/`ENOTEMPTY` errors. The project’s `node_modules` folder was removed and rebuilt. This did not remove source code, documents, the package manifest, or the lockfile.

The final verification after the clean install was:

```text
TypeScript: passed
Jest: 4 suites passed, 6 tests passed
Expo Doctor: 18/18 checks passed
ADB: emulator-5554 listed with status device
```

## 5. QA verification commands

Run these from the repository root:

```powershell
Set-Location 'C:\Users\stock\Documents\CSE310\NYATA'

# Confirm JavaScript dependency integrity
npm.cmd run typecheck
npm.cmd test -- --runInBand
npx.cmd expo-doctor

# Confirm the emulator connection
& 'C:\Users\stock\AppData\Local\Android\Sdk\platform-tools\adb.exe' version
& 'C:\Users\stock\AppData\Local\Android\Sdk\platform-tools\adb.exe' devices -l
```

Expected emulator result:

```text
emulator-5554    device
```

To test Metro without Expo making network requests:

```powershell
npm.cmd start -- --offline --max-workers 1
```

The `--offline` flag avoids an Expo registry fetch. The `--max-workers 1` flag avoids the Windows worker-spawn issue observed in this environment.

## 6. Native Android build requirement

The native build command is:

```powershell
npm.cmd run android -- --no-install
```

It currently stops before compilation because Java 17 is not installed. After installing JDK 17, set it for the current PowerShell session:

```powershell
$env:JAVA_HOME = '<JDK 17 installation folder>'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
npm.cmd run android -- --no-install
```

Do not point `JAVA_HOME` at Android Studio’s bundled JDK 25 for this project’s current Gradle build.

## 7. Cleanup guidance

The following are regenerable and are not application source data:

- `node_modules/`
- `.expo/`
- generated `android/`
- user Gradle caches
- npm cache entries

Do not delete `package.json`, `package-lock.json`, `app/`, `src/`, `documents/`, or `android/` until QA confirms whether native build output needs to be retained. The project’s `.gitignore` already excludes `node_modules`, `.expo`, and `android`.

