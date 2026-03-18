# THEMIS AI - Frontend Documentation

## 1. Overview
THEMIS AI is an enterprise-grade legal assistance platform built with a minimalistic Black & White glassmorphism theme. The frontend is optimized for mobile-first interactions while maintaining a high-end desktop experience.

## 2. Tech Stack
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS (via CDN) + Custom CSS Variables
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Scrolling:** Lenis (Smooth Scroll)
- **Auth:** @react-oauth/google

## 3. Design System (B&W Glassmorphism)
The UI relies on a strict dual-color palette controlled via CSS variables:
- `var(--bg-color)`: Primary background (Black in Dark, White in Light)
- `var(--text-primary)`: Main headings and text
- `var(--glass-bg)`: Translucent surface for cards and dialogs
- `var(--glass-border)`: Subtle separators

### Core Visual Classes:
- `.glass`: Applies `backdrop-filter: blur(24px)` and the glass background.
- `.custom-scrollbar`: A thin, non-intrusive scrollbar that matches the theme.
- `.marquee-container`: Used for long text (filenames) to auto-scroll on overflow.

## 4. Architecture

### Layouts
- **MainLayout.tsx**: The shell of the application.
  - **Sidebar**: Hamburger menu containing Case History (ChatGPT style), Theme Toggle, and Navigation.
  - **Navbar**: Top bar with Logo, Pro/Fast mode toggle, and Dialog triggers.
  - **Legal Meter**: A sticky progress bar just below the navbar for real-time case strength visualization.
  - **Dialogs**: All modal logic (Evidence, Laws, Meter, Knowledge Base) resides here for centralized state management.

### Pages
- **Home.tsx**: The primary chat interface.
  - **Chat Area**: Uses absolute positioning within a flex-container to ensure robust scrolling behavior.
  - **Query Bar**: A complex input component with integrated Evidence Upload (Plus), Mic (Recording Animation), and Send buttons.
  - **Consent Flow**: Intercepts document uploads to show a legal disclaimer.
- **NearbyHelp.tsx**: Geospatial legal aid locator.
  - Integrated with Google Maps Embed API.
  - Themed for B&W using CSS filters on the iframe.

## 5. Key Features & Components

### Knowledge Intelligence Dialog
A data-heavy view showing RAG stats.
- **Grid Layout**: 4 equal-height sections using `auto-rows-fr`.
- **Searchable List**: Dynamic filtering of indexed statutes.

### Evidence Vault
- **Marquee Text**: Handles long enterprise filenames gracefully.
- **Visual Feedback**: Quick "Eye" icon for document preview.

### Recording UI
- A `recording-pulse` and `recording-wave` CSS animation that activates when the mic is in use, replacing the text input with a live visualizer state.

## 6. How to Extend
- **Adding Colors**: Avoid hardcoded hex codes. Always use the theme variables.
- **New Dialogs**: Add a new entry to the `activeDialog` union type in `MainLayout.tsx`.
- **Responsive Tweaks**: Use Tailwind's `xs`, `sm`, `lg` prefixes. Note that `xs` (320px) is custom-defined in some components.

## 7. Performance Considerations
- **Lenis Scroll**: Smooths out scroll physics but is disabled within `custom-scrollbar` containers to prevent conflicts.
- **Framer Motion**: Used sparingly for layout transitions and dialog entrance/exit to maintain 60fps on mobile devices.
