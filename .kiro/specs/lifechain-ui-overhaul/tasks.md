# Implementation Plan: LifeChain UI Overhaul

## Overview

This implementation plan transforms the LifeChain blood supply management platform from a broken Tailwind-dependent interface into a premium CSS-only design system. The overhaul follows a 9-phase execution order, systematically replacing all Tailwind classes with custom `lc-*` utility classes while implementing the "Crimson Chain Dark" theme with 3D effects, glassmorphism, and smooth animations across 7 pages.

**Implementation Approach**: Each phase builds incrementally, starting with the foundation CSS system, then progressively enhancing shared components and individual pages. The order ensures that foundational styles are in place before page-specific implementations, minimizing rework and enabling early visual validation.

**Tech Stack**: React (JSX), CSS (custom design system), Vite

## Tasks

### Phase 1: Foundation - Establish CSS Design System

- [x] 1. Create comprehensive CSS design system in index.css
  - Replace all existing Tailwind imports with custom CSS foundation
  - Define CSS custom properties (variables) for Crimson Chain Dark theme colors
  - Implement color palette: backgrounds (--bg, --bg2), surfaces (--surface, --surface2, --surface3), borders (--border, --border2), text (--text, --muted, --faint), semantic colors (--red, --red-dark, --red-light, --green, --yellow, --blue, --purple)
  - Define spacing and sizing variables: border radius (--r-sm through --r-full), shadows (--shadow-card, --shadow-glow)
  - Set up typography variables: font family (--font with Inter and system fallbacks)
  - Add CSS reset and base styles: box model reset, body styles, custom scrollbar styling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [x] 2. Implement animation keyframes and classes
  - Define keyframes: fadeIn, slideUp, slideDown, scaleIn, pulseGlow, pulseDot, spin, float, bloodDrop, shimmer
  - Create animation utility classes: animate-fade-in, animate-slide-up, animate-slide-down, animate-scale-in, animate-pulse-glow, animate-spin, animate-float, animate-blood-drip
  - Add animation delay classes: delay-100, delay-200, delay-300, delay-400
  - Implement prefers-reduced-motion media query for accessibility
  - _Requirements: 1.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 12.10_

- [ ] 3. Build core component styles
  - [x] 3.1 Implement card components
    - Create base card class (lc-card) with gradient background, border, shadows, and hover states
    - Create 3D card variant (lc-card-3d) with transform, enhanced shadows, and red glow
    - Create glass card variant (lc-glass) with backdrop-filter blur and semi-transparent background
    - Create stat card variants (lc-stat-card, lc-stat-card-red, lc-stat-card-green, lc-stat-card-blue, lc-stat-card-purple, lc-stat-card-yellow, lc-stat-card-teal)
    - _Requirements: 1.3, 1.4_

  - [x] 3.2 Implement button components
    - Create primary button (lc-btn-primary) with gradient background and glow effects
    - Create secondary button (lc-btn-secondary) with solid background
    - Create ghost button (lc-btn-ghost) with transparent background
    - Create semantic variants: lc-btn-danger, lc-btn-success, lc-btn-warning
    - Create size variants: lc-btn-sm, lc-btn-lg
    - Add disabled states and smooth transitions
    - _Requirements: 1.8_

  - [x] 3.3 Implement form components
    - Create input field styles (lc-input) with focus states and red glow
    - Create select dropdown styles (lc-select) with custom arrow
    - Create input group (lc-input-group) for icon positioning
    - Create label styles (lc-label) with uppercase and letter spacing
    - Create form layout utilities: lc-form-field, lc-form-grid-2, lc-form-grid-3
    - _Requirements: 1.8_

  - [x] 3.4 Implement table components
    - Create table wrapper (lc-table-wrap) with horizontal scroll
    - Create table styles (lc-table) with header and row styling
    - Add hover states for table rows (lc-hover-row)
    - Implement expiry color coding classes: expiry-ok, expiry-warn, expiry-danger
    - _Requirements: 1.9_

  - [x] 3.5 Implement badge components
    - Create standard badge variants: lc-badge-red, lc-badge-green, lc-badge-yellow, lc-badge-blue, lc-badge-purple, lc-badge-gray
    - Create blood badge components: blood-badge, blood-badge-sm, blood-badge-lg with circular design and glow effects
    - _Requirements: 1.6, 1.9_

  - [x] 3.6 Implement alert and icon box components
    - Create alert variants: lc-alert-error, lc-alert-success, lc-alert-warning, lc-alert-info
    - Create icon box variants: lc-icon-box, lc-icon-box-red, lc-icon-box-green, lc-icon-box-blue, lc-icon-box-purple, lc-icon-box-yellow, lc-icon-box-teal
    - Create icon box size variants: lc-icon-box-sm, lc-icon-box-lg
    - _Requirements: 1.7, 1.9_

- [x] 4. Create layout and composition utilities
  - Implement page containers: lc-page, lc-main
  - Create page hero components: lc-page-hero, lc-page-hero-title, lc-page-hero-sub
  - Create grid utilities: lc-grid-2, lc-grid-3, lc-grid-4, lc-stats-grid, lc-profile-grid
  - Create profile cell components: lc-profile-cell, lc-profile-cell-label, lc-profile-cell-value
  - Add spacing utilities and responsive breakpoints
  - _Requirements: 1.2, 1.10, 11.1, 11.2, 11.3_

- [x] 5. Implement responsive design system
  - Add media queries for breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)
  - Implement grid collapse strategy for all grid utilities
  - Add responsive padding and spacing adjustments
  - Ensure touch targets meet 44x44px minimum on mobile
  - Make tables horizontally scrollable on small screens
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

- [x] 6. Add accessibility features to CSS
  - Implement visible focus indicators with red outline on all interactive elements
  - Add prefers-reduced-motion support to disable animations
  - Ensure all color combinations meet WCAG AA contrast ratios
  - Add focus-visible styles for keyboard navigation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 7. Checkpoint - Verify foundation CSS
  - Test that all CSS variables are defined and accessible
  - Verify all component classes render correctly in isolation
  - Check responsive behavior at all breakpoints
  - Validate color contrast ratios with accessibility tools
  - Ensure animations work smoothly and respect prefers-reduced-motion
  - Ask the user if questions arise

### Phase 2: Navbar Component

- [ ] 8. Refactor Navbar component to use design system
  - [x] 8.1 Replace all Tailwind classes with lc-* classes
    - Remove Tailwind utility classes from Navbar.jsx
    - Apply glassmorphism background (lc-glass) with backdrop blur
    - Implement sticky positioning with proper z-index
    - _Requirements: 2.1, 2.7_

  - [x] 8.2 Implement logo with blood-drop animation
    - Add LifeChain logo with animate-blood-drip class
    - Ensure logo is properly sized and positioned
    - _Requirements: 2.2_

  - [x] 8.3 Add user role badge with color coding
    - Display current user role using appropriate badge variant
    - Use lc-badge-red for admin, lc-badge-blue for hospital, lc-badge-green for donor
    - _Requirements: 2.3_

  - [x] 8.4 Style navigation links with hover effects
    - Apply smooth color transitions on hover
    - Ensure proper spacing and alignment
    - Add active state styling
    - _Requirements: 2.4, 2.5_

  - [x] 8.5 Implement logout button with icon
    - Style logout button with lc-btn-ghost
    - Add logout icon with proper spacing
    - Implement hover state
    - _Requirements: 2.6_

- [x] 9. Checkpoint - Test Navbar across all pages
  - Verify Navbar renders correctly on all 7 pages
  - Test responsive behavior on mobile, tablet, and desktop
  - Validate keyboard navigation and focus indicators
  - Ensure glassmorphism effect works across browsers
  - Ask the user if questions arise

### Phase 3: Login Page

- [ ] 10. Rebuild Login page with split-screen layout
  - [x] 10.1 Create split-screen layout structure
    - Implement lc-grid-2 layout for left hero and right form panels
    - Add responsive collapse to single column on mobile
    - Apply animate-fade-in to page container
    - _Requirements: 3.1, 10.1_

  - [x] 10.2 Build left hero panel
    - Add LifeChain logo with animate-blood-drip animation
    - Create 3D stat cards showing "10K+ Lives Saved" and "250+ Hospitals Linked"
    - Apply lc-stat-card-red and lc-stat-card-blue variants
    - Add animate-slide-up with staggered delays (delay-100, delay-200)
    - _Requirements: 3.2, 3.3, 10.2, 10.10_

  - [x] 10.3 Build right form panel with glassmorphic card
    - Create lc-glass card container for login form
    - Apply animate-scale-in with delay-300
    - _Requirements: 3.4, 10.3_

  - [x] 10.4 Implement login form inputs
    - Create email input with lc-input-group and icon prefix
    - Create password input with lc-input-group and icon prefix
    - Add password visibility toggle button
    - Apply focus states with red glow
    - _Requirements: 3.6, 3.7_

  - [x] 10.5 Add submit button and emergency link
    - Style submit button with lc-btn-primary and loading state
    - Add emergency service link with lc-dot-red pulsing indicator
    - Implement animate-pulse-glow on emergency indicator
    - _Requirements: 3.9, 10.4_

  - [x] 10.6 Implement error message display
    - Add error alert using lc-alert-error component
    - Position alert above form fields
    - Implement slide-down animation for alert appearance
    - _Requirements: 3.8, 14.1, 14.6, 14.7_

- [x] 11. Checkpoint - Test Login page
  - Verify split-screen layout works on all screen sizes
  - Test form submission and error display
  - Validate animations and timing
  - Check keyboard navigation and accessibility
  - Ask the user if questions arise

### Phase 4: Register Page

- [ ] 12. Rebuild Register page with role selection
  - [x] 12.1 Create centered glassmorphic card layout
    - Add LifeChain logo at top with pulse animation
    - Create lc-glass card container with animate-scale-in
    - _Requirements: 4.7, 4.9, 4.10_

  - [x] 12.2 Implement role selection buttons
    - Create Donor and Hospital role buttons using lc-card-3d
    - Add selection state with red border glow
    - Implement click handlers to toggle selection
    - _Requirements: 4.1, 4.2_

  - [x] 12.3 Build blood group selector (conditional for Donor role)
    - Create 8 blood group buttons (A+, A-, B+, B-, AB+, AB-, O+, O-) in lc-grid-4
    - Use blood-badge styling with selection states
    - Show/hide based on selected role
    - _Requirements: 4.3, 4.4_

  - [x] 12.4 Implement registration form fields
    - Use lc-form-grid-2 for responsive field layout
    - Add all required fields with lc-input styling
    - Implement conditional fields for Hospital role (license, address)
    - Add password visibility toggles for both password fields
    - _Requirements: 4.5, 4.6_

  - [x] 12.5 Add submit button and validation
    - Style submit button with lc-btn-primary
    - Implement disabled state during submission
    - Add validation error display using lc-alert-error
    - _Requirements: 4.8, 14.1_

- [x] 13. Checkpoint - Test Register page
  - Verify role selection toggles correctly
  - Test blood group selector visibility for Donor role
  - Validate form submission and error handling
  - Check responsive layout on all screen sizes
  - Ask the user if questions arise

### Phase 5: PublicBloodSearch Page

- [ ] 14. Rebuild PublicBloodSearch with hero and hospital cards
  - [x] 14.1 Create hero banner with LIVE indicator
    - Implement lc-page-hero with title and subtitle
    - Add pulsing red dot (lc-dot-red) with "LIVE" text
    - Apply animate-pulse-glow to indicator
    - _Requirements: 5.1, 10.4_

  - [x] 14.2 Build search filters section
    - Create filter inputs for city, pincode, and blood group using lc-form-grid-3
    - Style inputs with lc-select and lc-input classes
    - Add quick-select blood group buttons using blood-badge-sm in flex row
    - _Requirements: 5.2, 5.3_

  - [x] 14.3 Implement summary stats display
    - Create lc-stats-grid with 3 stat cards
    - Show total units, hospitals with stock, and total hospitals
    - Use lc-stat-card variants with appropriate colors
    - _Requirements: 5.7_

  - [x] 14.4 Build hospital result cards
    - Create hospital cards using lc-card-3d with hover effects
    - Display hospital name, location, and contact info
    - Add blood group breakdown grid with 8 lc-badge components showing counts
    - Apply animate-slide-up with staggered delays
    - _Requirements: 5.4, 5.5, 5.6, 10.2_

  - [x] 14.5 Add action buttons to hospital cards
    - Implement call button with lc-btn-success and phone icon
    - Implement email button with lc-btn-primary and email icon
    - _Requirements: 5.8_

  - [x] 14.6 Create "How to Use" section
    - Add instructional section with numbered steps
    - Style with appropriate spacing and typography
    - _Requirements: 5.9_

- [x] 15. Checkpoint - Test PublicBloodSearch page
  - Verify search filters work correctly
  - Test hospital card display and hover effects
  - Validate responsive grid layout
  - Check action button functionality
  - Ask the user if questions arise

### Phase 6: DonorDashboard (4 Tabs)

- [ ] 16. Rebuild DonorDashboard shared elements
  - [x] 16.1 Create page hero with donor info
    - Implement lc-page-hero with donor name as title
    - Add subtitle with last donation date
    - Display blood group using blood-badge component
    - _Requirements: 6.11_

  - [x] 16.2 Implement tab navigation
    - Create tab buttons for Profile, Find Campaigns, My Campaigns, History
    - Style tabs with lc-btn-ghost and active state
    - Implement tab switching logic
    - _Requirements: 6.10_

  - [x] 16.3 Add eligibility status alert
    - Display eligibility alert using lc-alert-success or lc-alert-error
    - Show eligibility message and next eligible date
    - _Requirements: 6.3_

- [x] 17. Build DonorDashboard Profile tab
  - Create lc-profile-grid with donor information cells
  - Display each field using lc-profile-cell with label and value
  - Add eligibility badge (lc-badge-green or lc-badge-red)
  - Include icon box with user icon
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 18. Build DonorDashboard Find Campaigns tab
  - [x] 18.1 Implement campaign search filters
    - Create filter inputs using lc-form-grid-2
    - Add city, blood group, and date filters
    - _Requirements: 6.5_

  - [x] 18.2 Display campaign cards
    - Create campaign cards using lc-card-3d in lc-stats-grid
    - Show campaign name, hospital, date, location, and blood groups needed
    - Add register button (lc-btn-primary) on each card
    - _Requirements: 6.4_

- [x] 19. Build DonorDashboard My Campaigns tab
  - Display registered campaigns using lc-card components
  - Show status badges: lc-badge-yellow (pending), lc-badge-green (attended)
  - Add action buttons: lc-btn-success (mark attended), lc-btn-danger (cancel)
  - _Requirements: 6.6, 6.7_

- [ ] 20. Build DonorDashboard History tab
  - [x] 20.1 Create donation history table
    - Implement lc-table with donation records
    - Display date, hospital, blood group, units, and certificate columns
    - Add empty state (lc-empty) if no donations
    - _Requirements: 6.8, 6.9_

  - [x] 20.2 Add certificate download functionality
    - Implement download button using lc-btn-primary
    - Add loading spinner during download
    - _Requirements: 6.8_

- [x] 21. Checkpoint - Test DonorDashboard
  - Verify all four tabs render correctly
  - Test tab navigation and state persistence
  - Validate form submissions and button actions
  - Check responsive layout on all screen sizes
  - Ask the user if questions arise

### Phase 7: AdminPanel (5 Tabs)

- [ ] 22. Rebuild AdminPanel shared elements
  - [x] 22.1 Create page hero with admin badge
    - Implement lc-page-hero with "Admin Panel" title
    - Add subtitle describing admin capabilities
    - Display admin badge using lc-badge-red
    - _Requirements: 7.11_

  - [x] 22.2 Implement tab navigation
    - Create tab buttons for Overview, Analytics, Inventory, Blood Units, Pending Hospitals
    - Style tabs with lc-btn-ghost and active state
    - Implement tab switching logic
    - _Requirements: 7.10_

  - [x] 22.3 Add pending hospitals alert
    - Display alert with pending count using lc-alert-warning
    - Add "Review Now" button to navigate to Pending Hospitals tab
    - _Requirements: 7.12_

- [ ] 23. Build AdminPanel Overview tab
  - [x] 23.1 Create system statistics grid
    - Implement lc-stats-grid with 6 stat cards
    - Show total hospitals, donors, blood units, campaigns, donations, and pending verifications
    - Use appropriate lc-stat-card color variants
    - _Requirements: 7.2_

  - [x] 23.2 Display blood group distribution
    - Create lc-grid-4 with blood-badge-lg for each blood group
    - Show unit counts for each blood group
    - _Requirements: 7.3_

  - [x] 23.3 Show blood units by status
    - Create lc-grid-3 with color-coded cards
    - Display available, expired, and used counts
    - _Requirements: 7.4_

- [ ] 24. Build AdminPanel Analytics tab
  - [x] 24.1 Display hospital-wise statistics
    - Create expandable lc-card components for each hospital
    - Show hospital name, total units, donations received, and transfers
    - _Requirements: 7.5_

  - [x] 24.2 Show donor distribution by city
    - Create lc-grid-3 with city cards
    - Display donor counts per city
    - _Requirements: 7.6_

- [x] 25. Build AdminPanel Inventory tab
  - Create hospital inventory display using lc-card components
  - Show hospital name and blood group breakdown
  - Use lc-grid-4 with blood-badge-lg and counts
  - _Requirements: 7.7_

- [ ] 26. Build AdminPanel Blood Units tab
  - [x] 26.1 Implement filters for blood units
    - Create filter inputs using lc-form-grid-3
    - Add filters for blood group, status, and hospital
    - _Requirements: 7.8_

  - [x] 26.2 Display blood units table
    - Implement lc-table with all blood unit records
    - Show unit ID, blood group, hospital, donor, status, and dates
    - Add status badges with color coding
    - _Requirements: 7.8_

- [x] 27. Build AdminPanel Pending Hospitals tab
  - Display pending hospital cards using lc-card components
  - Show hospital details: name, email, license, address, contact
  - Add action buttons: lc-btn-success (approve), lc-btn-danger (reject)
  - Implement empty state (lc-empty) if no pending hospitals
  - _Requirements: 7.9_

- [x] 28. Checkpoint - Test AdminPanel
  - Verify all five tabs render correctly
  - Test tab navigation and pending alert functionality
  - Validate approve/reject actions on pending hospitals
  - Check responsive layout and table scrolling
  - Ask the user if questions arise

### Phase 8: HospitalDashboard (8 Tabs)

- [ ] 29. Rebuild HospitalDashboard shared elements
  - [x] 29.1 Create page hero with hospital info
    - Implement lc-page-hero with hospital name as title
    - Add subtitle with hospital location
    - Display verification badge using lc-badge-green or lc-badge-yellow
    - _Requirements: 8.15_

  - [x] 29.2 Implement tab navigation
    - Create tab buttons for all 8 tabs: Overview, Inventory, Campaigns, Donation, Transfer, Usage, Emergency, AI Insights
    - Style tabs with lc-btn-ghost and active state
    - Implement tab switching logic
    - _Requirements: 8.13_

  - [x] 29.3 Add verification warning alert
    - Display warning alert for unverified hospitals using lc-alert-warning
    - Show message about limited functionality until verification
    - _Requirements: 8.14_

- [ ] 30. Build HospitalDashboard Overview tab
  - [x] 30.1 Create dashboard statistics
    - Implement lc-stats-grid with 4 stat cards
    - Show total inventory, donations received, transfers made, and campaigns created
    - Use appropriate lc-stat-card color variants
    - _Requirements: 8.2_

  - [x] 30.2 Display blood group distribution
    - Create lc-grid-4 with blood-badge-lg for each blood group
    - Show unit counts for each blood group
    - _Requirements: 8.3_

  - [x] 30.3 Show recent activity
    - Create lc-card with list of recent activities
    - Display activity type, description, and timestamp
    - _Requirements: 8.3_

- [ ] 31. Build HospitalDashboard Inventory tab
  - [x] 31.1 Implement inventory filters
    - Create filter inputs using lc-form-grid-3
    - Add filters for blood group, status, and expiry date
    - _Requirements: 8.5_

  - [x] 31.2 Display inventory table
    - Implement lc-table with blood unit records
    - Show unit ID, blood group, donor, collection date, expiry date, and status
    - Add expiry color coding: expiry-ok (green), expiry-warn (yellow), expiry-danger (red)
    - _Requirements: 8.4, 8.5_

- [ ] 32. Build HospitalDashboard Campaigns tab
  - [x] 32.1 Display campaign list
    - Create lc-card components for each campaign
    - Show campaign name, date, location, blood groups needed, and status
    - Add status badges using lc-badge variants
    - _Requirements: 8.6_

  - [x] 32.2 Implement create campaign form
    - Create lc-glass card with lc-form-grid-2 layout
    - Add inputs for campaign name, date, location, and description
    - Implement blood group multi-select with checkboxes and blood-badge-sm
    - Add submit button (lc-btn-primary)
    - _Requirements: 8.7_

- [ ] 33. Build HospitalDashboard Donation tab
  - [x] 33.1 Implement donor search
    - Create search input with lc-input and search icon
    - Display search results with donor information
    - _Requirements: 8.8_

  - [x] 33.2 Create donation recording form
    - Implement lc-form-grid-2 with donor details
    - Add blood group selector using blood-badge buttons
    - Add units input and collection date picker
    - Implement submit button (lc-btn-success)
    - _Requirements: 8.8_

- [x] 34. Build HospitalDashboard Transfer tab
  - Create hospital dropdown using lc-select
  - Implement blood unit selection table (lc-table) with checkboxes
  - Add transfer button (lc-btn-primary)
  - Display transfer confirmation with selected units
  - _Requirements: 8.9_

- [x] 35. Build HospitalDashboard Usage tab
  - Create patient ID input using lc-input
  - Implement blood unit selection dropdown (lc-select)
  - Add usage reason textarea
  - Implement record button (lc-btn-danger)
  - _Requirements: 8.10_

- [ ] 36. Build HospitalDashboard Emergency tab
  - [x] 36.1 Create emergency request form
    - Implement lc-form-grid-2 with emergency details
    - Add blood group selector using blood-badge buttons
    - Add units needed input and urgency level selector
    - _Requirements: 8.11_

  - [x] 36.2 Style urgency selector
    - Create radio buttons with color coding (low, medium, high, critical)
    - Apply appropriate colors for each urgency level
    - _Requirements: 8.11_

  - [x] 36.3 Add submit button with animation
    - Style submit button with lc-btn-danger
    - Apply pulse animation to emphasize urgency
    - _Requirements: 8.11_

- [x] 37. Build HospitalDashboard AI Insights tab
  - Create blood group selector using blood-badge buttons
  - Implement prediction display using lc-stat-card-blue
  - Add chart placeholder using lc-card for future visualizations
  - Display demand prediction data and recommendations
  - _Requirements: 8.12_

- [x] 38. Checkpoint - Test HospitalDashboard
  - Verify all eight tabs render correctly
  - Test tab navigation and form submissions
  - Validate verification warning display for unverified hospitals
  - Check responsive layout and table scrolling
  - Test all CRUD operations (create campaign, record donation, transfer, usage)
  - Ask the user if questions arise

### Phase 9: Unauthorized Page

- [ ] 39. Rebuild Unauthorized page with 3D lock animation
  - [x] 39.1 Create centered glassmorphic card
    - Implement lc-glass card container centered on page
    - Add dark background with mesh gradient
    - _Requirements: 9.5, 9.7_

  - [x] 39.2 Add animated lock icon
    - Display large lock icon with animate-float effect
    - Ensure icon is properly sized and centered
    - _Requirements: 9.1, 9.6_

  - [x] 39.3 Implement heading and message
    - Add "Access Denied" heading with gradient text (lc-page-hero-title style)
    - Display explanation text about insufficient permissions
    - _Requirements: 9.2, 9.3_

  - [x] 39.4 Add navigation button
    - Implement "Go Back" button using lc-btn-primary
    - Add click handler to navigate back to previous page
    - _Requirements: 9.4_

- [x] 40. Final checkpoint - Complete system testing
  - Verify all 7 pages render correctly with new design system
  - Test navigation flow between all pages
  - Validate responsive design on mobile (375px), tablet (768px), and desktop (1280px)
  - Run accessibility audit with axe DevTools or Lighthouse
  - Test keyboard navigation through all interactive elements
  - Verify all animations respect prefers-reduced-motion
  - Check color contrast ratios meet WCAG AA standards
  - Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
  - Validate form submissions and error handling across all pages
  - Ensure all loading states and success/error messages display correctly
  - Ask the user if questions arise

## Notes

- All tasks reference specific requirements for traceability
- Each phase builds on the previous phase, ensuring incremental progress
- Checkpoints ensure validation at key milestones
- The implementation follows the 9-phase execution order specified in the requirements
- CSS-only approach ensures no JavaScript dependencies for visual effects
- Responsive design is built into the foundation and applied consistently
- Accessibility is prioritized throughout with WCAG AA compliance
- Performance optimization is achieved through hardware-accelerated CSS properties
