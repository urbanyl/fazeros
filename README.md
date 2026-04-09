# FazerOS

FazerOS is a comprehensive, web-based desktop environment and operating system built with React, TypeScript, Vite, and Electron. It bridges the gap between a simulated web UI and a real operating system by integrating true backend system commands and offering a fully bootable ISO generator.

## 🌟 Features

- **Interactive Desktop Environment**: A clean, professional UI with window management (drag, resize) using `react-rnd`.
- **Real System Integration**: Built-in applications interact with the underlying host OS via Electron IPC.
- **Built-in Applications**:
  - **Terminal**: Execute real system commands directly from the UI.
  - **Network Analyzer**: Real network diagnostics (Ping, Tracert, Netstat, ARP).
  - **Port Scanner**: TCP port scanning capabilities.
  - **File Explorer & Task Manager**: Manage files and monitor system resources.
  - **Other Utilities**: Calculator, Web Browser, Settings, and Security Quarantine.
- **Bootable OS Generator**: Includes scripts to generate a standalone, Debian-based Live ISO (`fazeros-bootable.iso`) running FazerOS in Kiosk mode.

## 🚀 Getting Started (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/urbanyl/FazerOs.git
   cd FazerOs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (React):
   ```bash
   npm run dev
   ```

4. Start Electron (in a separate terminal):
   ```bash
   npm run electron:dev
   ```

## 🛠️ Building the Application

To build the Electron application for your current operating system (Windows/Linux):

```bash
npm run build
npm run electron:build
```

## 💿 Generating a Bootable FazerOS ISO (Bare-Metal)

FazerOS can be built into a real, bootable operating system using the provided `os-builder` scripts. This requires a Linux environment (or WSL) with root privileges.

For detailed instructions on generating the ISO and booting it on physical or virtual machines (BIOS/UEFI), please refer to the [Boot OS Installation Guide](docs/BOOT_OS_INSTALLATION.md).

## 📄 License

This project is licensed under the MIT License. Copyright (c) 2026 Fazer.
