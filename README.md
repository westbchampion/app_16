# Hex Binary Visualizer

一款将文件以二进制点阵形式可视化的 Web 应用 —— 每个比特用一个彩色圆点表示（红色为 1，白色为 0）。

## 环境部署

### 前置要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0（随 Node.js 一起安装）

### 安装依赖

```bash
npm install
```

## 开发

启动带热重载的开发服务器：

```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行。

## 生产构建

编译 TypeScript 并使用 Vite 打包：

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 预览生产构建

在部署前本地预览：

```bash
npm run preview
```

## 打包为手机 App

### 方案一：使用 Capacitor（推荐）

Capacitor 将 Web 应用打包成原生 iOS 和 Android 应用，一次开发多平台部署。

#### 1. 安装 Capacitor CLI

```bash
npm install @capacitor/core @capacitor/cli
```

#### 2. 初始化 Capacitor

```bash
npx cap init HexVisualizer com.example.hexvisualizer
```

- App name: `HexVisualizer`
- Package ID: `com.example.hexvisualizer`（反向域名格式）

#### 3. 安装平台支持

```bash
npm install @capacitor/ios @capacitor/android
```

#### 4. 添加 iOS 平台

```bash
npx cap add ios
```

#### 5. 添加 Android 平台

```bash
npx cap add android
```

#### 6. 构建 Web 应用并同步到原生项目

```bash
npm run build
npx cap sync ios
npx cap sync android
```

#### 7. 在设备上运行

**iOS（需要 Mac 和 Xcode）：**

```bash
npx cap open ios
```

这会在 Xcode 中打开项目，连接真机或使用模拟器运行。

**Android：**

```bash
npx cap open android
```

这会在 Android Studio 中打开项目，连接真机或使用模拟器运行。

#### 8. 生成安装包

**iOS（App Store）：**

- 在 Xcode 中选择 "Product > Archive"
- 使用 Xcode Organizer 上传至 App Store Connect

**Android（APK）：**

- 在 Android Studio 中选择 "Build > Generate Signed Bundle / APK"
- 选择 APK，配置签名密钥
- 输出文件位于 `android/app/build/outputs/apk/debug/app-debug.apk`

---

### 方案二：使用 React Native（仅 Webview 模式）

如果希望完全集成到 React Native 项目中：

#### 1. 创建 React Native 项目

```bash
npx create-expo-app HexVisualizerApp
cd HexVisualizerApp
```

#### 2. 将现有代码复制到项目中

将 `src/` 目录下的组件复制到 React Native 项目。

#### 3. 启动开发服务器

```bash
npx expo start
```

#### 4. 使用 Expo Go 测试

在手机安装 Expo Go 应用，扫描二维码即可预览。

#### 5. 生成分布式包（iOS / Android）

```bash
npx expo build:ios        # 需要 Apple 开发者账号
npx expo build:android    # 生成 APK
```

#### 6. 打包原生 App

使用 `expo run:ios` 或 `expo run:android` 编译原生项目。

---

### 方案三：使用 PWA（渐进式 Web 应用）

无需应用商店，直接通过浏览器安装到手机桌面。

#### 1. 安装 PWA 插件

```bash
npm install vite-plugin-pwa
```

#### 2. 配置 Vite

在 `vite.config.ts` 中添加：

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Hex Binary Visualizer',
        short_name: 'HexVisualizer',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

#### 3. 构建并部署

```bash
npm run build
```

将 `dist/` 目录部署到任意静态托管服务（Netlify、Vercel、GitHub Pages 等）。

用户只需用手机浏览器打开网站，点击"添加到主屏幕"即可像原生应用一样使用。

---

## 项目结构

```
hex-visualizer/
├── src/
│   ├── App.tsx        # React 主组件
│   ├── App.css        # 组件样式
│   └── index.css      # 全局样式
├── dist/              # 生产构建产物
├── android/          # Android 原生项目（Capacitor）
├── ios/              # iOS 原生项目（Capacitor）
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 使用方法

1. 在浏览器或手机 App 中打开应用
2. 将任意文件拖拽到上传区域（或点击选择）
3. 以二进制点阵网格查看文件内容
4. 使用滑块调整缩放级别
5. 点击"导出 PNG"保存图片
6. 点击"新文件"可视化其他文件

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具和开发服务器
- **Canvas API** - 二进制可视化渲染
- **Capacitor** - 跨平台原生应用打包

