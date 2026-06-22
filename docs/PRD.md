# Product Requirements Document (PRD) — MediaDL

## 1. Project Overview
**MediaDL** is an enterprise-grade, privacy-first, SaaS-style Media Downloader application. It allows users to extract and download video and audio formats from multiple popular streaming platforms (such as YouTube, Instagram, TikTok, Facebook, and Twitter/X) as well as direct URLs. The application delivers a modern web experience utilizing Next.js 15, React 19, Tailwind CSS v4, and a stateless backend processing architecture powered by `yt-dlp`.

---

## 2. Vision Statement
To provide the cleanest, fastest, and most secure ad-free media extraction utility on the web. MediaDL aims to eliminate the dark UX patterns, malware links, intrusive advertisements, and tracking cookies typical of modern downloading websites. It champions user privacy through an entirely stateless architecture where URLs are never persisted, user profiles do not exist, and all files are streamed in-memory or dynamically deleted immediately after client processing.

---

## 3. Problem Statement
The current media downloading landscape is saturated with websites that expose users to significant security threats. Existing solutions:
1. Inject malicious advertisements, redirects, and push notification spam.
2. Track user preferences, IP addresses, and download histories to build advertising profiles.
3. Require cumbersome signup flows, logins, or paid walls for basic high-definition downloads.
4. Fail silently or deliver corrupt streams when platform algorithms change.
5. Provide poor UI/UX with slow feedback loops and confusing download buttons.

---

## 4. Goals and Objectives
* **User-Centric Design**: Deliver a premium dark-themed SaaS interface with glassmorphism styling and smooth micro-animations.
* **Format Versatility**: Auto-detect, filter, and prioritize download options (MP4, WebM, MOV, MP3, M4A).
* **Zero Data Retention**: Maintain 100% statelessness. No databases, no auth, and no tracking.
* **Security & Reliability**: Safeguard client machines by serving cleaned streams directly, neutralizing XSS, and sanitizing input URLs.
* **High Availability**: Provide robust fallback mechanisms on the server to prevent timeouts when parsing heavy playlists or high-bitrate media.

---

## 5. Success Metrics
The performance of the MediaDL product will be measured using the following quantitative and qualitative KPIs:

| Metric Category | Key Performance Indicator (KPI) | Target Threshold | Measurement Method |
|:---|:---|:---|:---|
| **Performance** | Median Response Time (Metadata Extraction) | ≤ 1.5 seconds | Server logs & synthetic monitoring |
| **Performance** | Stream initialization time | ≤ 500 milliseconds | Page Speed Insights / OpenTelemetry |
| **Reliability** | Successful download completion rate | ≥ 98% | Client-side error tracking (Sentry) |
| **UX & Quality** | Mobile compatibility & responsiveness score | 100 / 100 | Google Lighthouse audit |
| **Privacy Audit** | Retention duration of user-submitted URLs | 0 milliseconds | Automated compliance test audits |
| **User Retention**| Direct return visits | Growth of 15% MoM | Client-side serverless cookie-less telemetry |

---

## 6. Target Audience
1. **Content Creators**: Editors, social media managers, and designers who need high-quality source footage or music tracks for fair-use compilations and editing.
2. **Offline Viewers**: Commuters, students, and travelers who need to pre-download lectures, podcasts, or tutorials for offline viewing due to limited internet connectivity.
3. **Privacy Enthusiasts**: Users who strictly avoid standard downloading platforms due to malware, ad tracking, and privacy concerns.

---

## 7. User Personas

### Persona A: Sarah — Social Media Editor
* **Demographics**: 26 years old, London, freelance video editor.
* **Behaviors**: Regularly downloads snippets of B-roll footage from YouTube and clips from Instagram to assemble marketing compilations.
* **Pain Points**: Frustrated by popup ads on free download sites that slow down her work and threaten her workstation with adware.
* **Goals**: Needs a reliable tool that downloads clean MP4 files directly and names them correctly so she can drop them straight into Premiere Pro.

### Persona B: David — Offline Learner
* **Demographics**: 41 years old, remote researcher, frequently travels to areas with zero network availability.
* **Behaviors**: Extracts audio streams of technical lectures (MP3 format) to listen to on flights.
* **Pain Points**: Download sites force him to register, limit audio download speeds, or mislabel audio streams as webm rather than mp3.
* **Goals**: Wants a fast tool that extracts high-bitrate MP3s, names them systematically, and doesn't store his search queries.

---

## 8. User Stories

| User Story ID | Role | Action (What I want) | Benefit (Why) | Priority |
|:---|:---|:---|:---|:---|
| **US-01** | Visitor | Paste a valid video URL into the downloader | So I can inspect its formats and resolutions without ads | Must Have |
| **US-02** | Visitor | Select MP4 1080p resolution | To download high-definition video with full audio tracks | Must Have |
| **US-03** | Editor | Download audio only in high-quality MP3 format | To use the voice track directly in my podcast workstation | Must Have |
| **US-04** | User | View real-time progress of my download stream | So I know how long the file will take to save on my local system | Should Have |
| **US-05** | User | Toggle between light and dark UI themes | To reduce eye strain depending on my surrounding light levels | Should Have |
| **US-06** | Creator | Download files with automatic clean names matching the platform | So I don't have to manually rename files like `blob_xxxx` | Must Have |

---

## 9. Functional Requirements

### 9.1 Core Input & Validation
* **FR-1.1**: The system must accept inputs via manual pasting or a single-click "Paste from Clipboard" button.
* **FR-1.2**: Input URLs must be parsed and validated against supported platform domains (YouTube, Instagram, Facebook, X/Twitter, TikTok, and direct MP4/MP3 endpoints).
* **FR-1.3**: The input field must strip control characters, HTML tags, and trailing URL tracking parameters (e.g., `?si=...`, `?utm_source=...`) to secure backend execution.

### 9.2 Metadata Preview System
* **FR-2.1**: Upon successful URL submission, the frontend must display the video thumbnail, title, author/channel name, duration (formatted as `HH:MM:SS`), and view count.
* **FR-2.2**: The preview card must show a skeleton loading state while metadata is being fetched from the backend `/api/info` route.

### 9.3 Format Grid and Recommended Option
* **FR-3.1**: The application must show available formats grouped into Video (MP4, WebM, MOV) and Audio (MP3, M4A) sections.
* **FR-3.2**: Recommended options must be pre-selected and highlighted:
  * **Video default**: MP4 720p HD.
  * **Audio default**: MP3 128kbps.
* **FR-3.3**: The UI must display the estimated file size for each card. If a format is not available, the card must be disabled and display "Not Available".

### 9.4 Download Stream and Saving Flow
* **FR-4.1**: Downloads must stream chunk-by-chunk through a Next.js API route (`/api/download`) to prevent memory overload on the server.
* **FR-4.2**: The frontend must calculate and display real-time progress (`0%` to `100%`) using the response's `Content-Length` header.
* **FR-4.3**: Staged blobs in memory must be triggered for client-side saving via a dynamically appended anchor element. The cleanup sequence must revoke the temporary Object URL after exactly `10,000ms` using `setTimeout` within a `requestAnimationFrame` block to prevent UUID filename errors in Chrome.

---

## 10. Non-Functional Requirements

### 10.1 Security & Privacy
* **NFR-1.1**: **Zero Data Retention**: The server must not log, database, or cache user URLs or media content.
* **NFR-1.2**: **No Credentials**: No user accounts, tokens, session cookies, or sign-ups.
* **NFR-1.3**: **Input Sanitization**: Block shell injection attempts on the backend CLI execution.

### 10.2 Performance
* **NFR-2.1**: **Extraction Speed**: The metadata extraction `/api/info` endpoint must resolve in under `2000ms` for 95% of requests.
* **NFR-2.2**: **Server Stream Throughput**: Backends must pipe binary streams instantly with minimal buffer overhead (≤64KB block chunks).

### 10.3 Accessibility (a11y)
* **NFR-3.1**: The frontend must adhere to WCAG 2.1 AA guidelines, utilizing semantic HTML elements, ARIA labels for buttons/inputs, and visible focus rings (`ring-2 ring-indigo-500`) for complete keyboard navigation.

---

## 11. Features List

### 11.1 Completed Features
* Animated hero header with background gradients.
* Input validation with active feedback state.
* Skeleton screens for info-loading stage.
* Layout configurations for dark and light UI.
* Stream parser and chunk aggregator for custom client downloads.
* Auto-naming rules producing systematic titles (e.g. `youtube_title_720p.mp4`).

### 11.2 In-Progress / Verified Fixes
* **Chrome UUID Bug Resolution**: Implemented delayed `URL.revokeObjectURL(blobUrl)` inside the frontend stream handler. Files save with platform-sanitized names rather than randomly generated UUID filenames.

---

## 12. MVP Scope
* Single video/audio extraction from YouTube, Instagram, Facebook, X, and TikTok.
* Standard resolutions: 360p, 480p, 720p (HD), and 1080p (Full HD) in MP4.
* Standard bitrates: 64kbps, 128kbps, 192kbps, and 320kbps in MP3.
* Dynamic client progress indicator.
* Full mobile responsiveness down to 320px viewport width.

---

## 13. Future Scope
* **Batch Downloader**: Queue up to 10 URLs simultaneously and download them in a consolidated ZIP file.
* **Browser Extension**: A Chrome/Firefox companion utility that adds a "Download with MediaDL" button directly below video players on supported streaming platforms.
* **Subtitles Downloader**: Extract closed captions (SRT or VTT formats) from YouTube streams and allow separate downloads.

---

## 14. Business Rules
1. **Stateless Operations**: No data storage is allowed. Any proposal that requests database tables for storing urls or logging IP-to-url pairings must be rejected.
2. **Platform Compliance**: The software must execute as an intermediary client-side downloader; it does not host or redistribute copyrighted files.
3. **No File Mutation**: Never convert extensions without executing proper transcoding (e.g. do not rename a `.webm` to `.mp4` on the fly). If a container is downloaded as WebM, save it as `.webm`.

---

## 15. Acceptance Criteria
* The app must load the main landing layout in ≤ 500ms on a 3G network.
* Paste actions must automatically trigger the preview parser if a valid URL is present.
* The downloaded file name must match:
  * `direct` platforms: `title_resolution.extension`
  * Social platforms: `platform_title_resolution.extension`
* The console must print the debugging metadata *before* and *after* click triggers exactly as requested by the development spec.

---

## 16. Risks and Limitations
* **Binary Executable Failures**: The platform relies entirely on `yt-dlp` and `ffmpeg` binaries. If these binaries are not present on the server environment, or if their system paths are not resolved, the download system will throw a 503 Service Unavailable error.
* **IP Rate Limiting**: Streaming platforms (especially YouTube) may rate-limit or temporarily block the server's IP address when high traffic occurs. The application must handle this by notifying users to retry or utilizing rotating proxy configurations.

---

## 17. Monetization Strategy
To keep the service clean and track-free:
1. **Self-Host Donations**: Place a premium styled cryptocurrency/BuyMeACoffee button in the footer.
2. **Self-Hosted Corporate Licenses**: Package the project as a Docker container for internal marketing teams who need to scrape and store B-roll content legally.

---

## 18. SEO Requirements
* **Semantic tags**: Use a single `<h1>` on the home screen, supported by `<section>` and `<article>` structures.
* **Meta Tags**: Populate high-ranking search metadata (title, descriptions, and open graph image assets) inside Next.js layout configurations.
* **Responsive SEO**: Ensure perfect Lighthouse scores to secure higher rankings on search engine result pages.

---

## 19. Accessibility Requirements
* Contrast ratio for text elements must be at least `4.5:1` in both dark and light modes.
* Keyboard focus must not get trapped inside input fields; users should be able to tab freely to theme toggles, download grids, and external links.

---

## 20. Analytics Requirements
* **Privacy-preserving Analytics**: Use self-hosted, cookie-less solutions like Plausible Analytics or Umami to log visitor counts without harvesting IP addresses or personal information.

---

## 21. Security Requirements
* Configure strict Content Security Policies (CSP) to block malicious external scripts from injecting trackers.
* Sanitize query inputs to protect backend execution commands from shell metacharacter injections (e.g. `;`, `&&`, `|`).

---

## 22. Content Requirements
* Present clear instructions on the main landing state (empty state) about supported platforms.
* Display legal disclaimers in the footer highlighting that users must respect content copyrights and only download files for personal, offline use.

---

## 23. Release Plan
```
[v1.0.0-MVP] ───► [v1.1.0-Stabilization] ───► [v1.2.0-Batch & Expansion]
(Current Release)    (Proxy integrations)       (Queue system & plugins)
```

---

## 24. Launch Checklist
- [x] Integrate `yt-dlp` automatic binary resolver.
- [x] Verify client-side clean filename triggers.
- [x] Configure tailwind dark/light themes.
- [x] Implement error mapping for timeout/invalid URLs.
- [x] Run production build and ensure zero TypeScript compilation errors.
- [x] Push clean source repository to GitHub tracking branch.
- [ ] Connect production hosting container with Python/FFmpeg environment.
