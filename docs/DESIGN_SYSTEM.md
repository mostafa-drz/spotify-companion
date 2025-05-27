# 🎵 Playlist Companion Design System

## 🎨 Color Palette

### Primary Colors
- **Spotify Green** `#1DB954` - Primary brand color, used for main actions and highlights
- **Dark Mode** `#121212` - Main background for dark mode
- **Light Mode** `#FFFFFF` - Main background for light mode

### Secondary Colors
- **Accent Purple** `#8B5CF6` - Used for secondary actions and highlights
- **Neutral Gray** `#4B5563` - Used for text and borders
- **Light Gray** `#F3F4F6` - Used for subtle backgrounds and dividers

### Semantic Colors
- **Success** `#10B981` - For success states and confirmations
- **Error** `#EF4444` - For error states and warnings
- **Info** `#3B82F6` - For information and notifications

## 📝 Typography

### Font Family
- **Primary**: Inter (Sans-serif)
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Sizes
```css
text-xs: 0.75rem    /* 12px */
text-sm: 0.875rem   /* 14px */
text-base: 1rem     /* 16px */
text-lg: 1.125rem   /* 18px */
text-xl: 1.25rem    /* 20px */
text-2xl: 1.5rem    /* 24px */
text-3xl: 1.875rem  /* 30px */
text-4xl: 2.25rem   /* 36px */
```

### Font Weights
```css
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

## 🎯 Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-[#1DB954] text-white px-4 py-2 rounded-lg 
         hover:bg-opacity-90 transition-all duration-200
         focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-[#8B5CF6] text-white px-4 py-2 rounded-lg
         hover:bg-opacity-90 transition-all duration-200
         focus:ring-2 focus:ring-[#8B5CF6] focus:ring-opacity-50;
}

/* Ghost Button */
.btn-ghost {
  @apply bg-transparent text-[#4B5563] px-4 py-2 rounded-lg
         hover:bg-gray-100 transition-all duration-200
         focus:ring-2 focus:ring-gray-200;
}
```

### Cards
```css
/* Music Card */
.music-card {
  @apply bg-white dark:bg-[#121212] rounded-xl p-4
         shadow-sm hover:shadow-md transition-all duration-200
         border border-gray-100 dark:border-gray-800;
}

/* Playlist Card */
.playlist-card {
  @apply bg-white dark:bg-[#121212] rounded-xl p-6
         shadow-sm hover:shadow-md transition-all duration-200
         border border-gray-100 dark:border-gray-800;
}
```

### Inputs
```css
/* Text Input */
.input-primary {
  @apply w-full px-4 py-2 rounded-lg border border-gray-200
         focus:ring-2 focus:ring-[#1DB954] focus:border-transparent
         dark:bg-gray-800 dark:border-gray-700;
}

/* Search Input */
.search-input {
  @apply w-full px-4 py-2 rounded-lg border border-gray-200
         focus:ring-2 focus:ring-[#1DB954] focus:border-transparent
         dark:bg-gray-800 dark:border-gray-700
         pl-10; /* For search icon */
}
```

## 🎨 Spacing System
```css
space-1: 0.25rem  /* 4px */
space-2: 0.5rem   /* 8px */
space-3: 0.75rem  /* 12px */
space-4: 1rem     /* 16px */
space-5: 1.25rem  /* 20px */
space-6: 1.5rem   /* 24px */
space-8: 2rem     /* 32px */
space-10: 2.5rem  /* 40px */
space-12: 3rem    /* 48px */
```

## 🎯 Layout

### Container
```css
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### Grid System
```css
.grid {
  @apply grid gap-4;
}

.grid-cols-2 {
  @apply grid-cols-1 sm:grid-cols-2;
}

.grid-cols-3 {
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3;
}

.grid-cols-4 {
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-4;
}
```

## 🎨 Animations

### Transitions
```css
.transition-all {
  @apply transition-all duration-200 ease-in-out;
}

.transition-transform {
  @apply transition-transform duration-200 ease-in-out;
}
```

### Hover Effects
```css
.hover-scale {
  @apply hover:scale-105 transition-transform duration-200;
}

.hover-lift {
  @apply hover:-translate-y-1 transition-transform duration-200;
}
```

## 🎯 Icons
- Using Heroicons for consistent iconography
- Size variants: sm (16px), md (20px), lg (24px)
- Color follows text color by default

## 🎨 Dark Mode
```css
/* Dark mode base styles */
.dark {
  @apply bg-[#121212] text-white;
}

/* Dark mode component overrides */
.dark .music-card {
  @apply bg-gray-900 border-gray-800;
}

.dark .input-primary {
  @apply bg-gray-800 border-gray-700;
}
```

## 🎯 Accessibility
- Minimum contrast ratio: 4.5:1
- Focus states visible on all interactive elements
- Keyboard navigation support
- ARIA labels where necessary
- Screen reader friendly markup
- All feedback (loading, errors, success) is handled via minimal inline messages—no toast notifications or popups, in line with the product's minimalism and accessibility philosophy.

## 🎨 Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px 