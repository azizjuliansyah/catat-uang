# Settings Page: Profile & Security Combined Design

**Date:** 2026-06-29
**Status:** Approved

## Overview

Combine the existing Profile and Security tabs into a single unified view with a 30:70 layout. The left column displays a read-only profile preview with stats, while the right column contains the editable profile and security forms stacked vertically.

## Motivation

- Reduce tab navigation friction - users can access both profile and security settings on one page
- Provide immediate visual feedback with a profile preview card
- Maintain all existing functionality while improving the UX

## Layout

### Desktop (2-column grid)

```
┌─────────────────────────────────────────────────────────────┐
│                    Pengaturan Aplikasi                        │
│  Kelola profil pengguna, kategori, template, dan keamanan   │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────┐
│              │                                               │
│  [Tab Nav]   │                                               │
│              │                                               │
├──────────────┴──────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │          │  │  Profile Form Card                      │ │
│  │ Preview  │  │  - Name input                           │ │
│  │  Card    │  │  - Avatar upload button                 │ │
│  │ (30%)    │  │  - Save button                          │ │
│  │          │  └─────────────────────────────────────────┘ │
│  │          │                                               │
│  │          │  ┌─────────────────────────────────────────┐ │
│  │          │  │  Security Card                          │ │
│  │          │  │  - Current password                     │ │
│  │          │  │  - New password                          │ │
│  │          │  │  - Confirm password                     │ │
│  │          │  │  - Update password button              │ │
│  │          │  └─────────────────────────────────────────┘ │
│  └──────────┘                                               │
│              (70%)                                           │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (single column)

On screens < 768px:
- Layout collapses to single column
- Preview card at top
- Profile form below
- Security card at bottom

## Components

### 1. ProfilePreviewCard (New Component)

**Location:** `app/(app)/settings/components/profile/ProfilePreviewCard.tsx`

**Props:**
- `avatarUrl: string | null`
- `name: string`
- `email: string | null`
- `createdAt: string | null` (from user metadata)

**Content:**
- Avatar (80-100px, rounded-full)
- Name (larger text, font-display)
- Email (text-secondary)
- "Member since {formatted_date}" (text-muted, smaller)
- Account status badge (green "Aktif" indicator)

**Styling:**
- `bg-surface-card` with subtle border
- Sticky positioning on desktop (optional, for long forms)
- Center-aligned content

### 2. Profile & Security Combined Container

**Location:** `app/(app)/settings/components/ProfileSecurityCombined.tsx`

**Responsibilities:**
- Manages the grid layout (30:70 on desktop, single column on mobile)
- Combines ProfileTab and SecurityTab content
- Passes appropriate props to child components

**Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
  {/* Left: Profile Preview */}
  <div className="lg:sticky lg:top-6 h-fit">
    <ProfilePreviewCard {...props} />
  </div>

  {/* Right: Forms */}
  <div className="space-y-6">
    <ProfileFormCard {...props} />
    <SecurityCard {...props} />
  </div>
</div>
```

### 3. ProfileFormCard (Refactored)

**Changes from existing ProfileTab:**
- Remove the inline avatar uploader area
- Replace with a button that triggers the avatar upload modal/flow
- Keep name input and save functionality
- Update card header to be consistent with SecurityCard

### 4. SecurityCard (Largely Unchanged)

**Changes:**
- Ensure card styling matches ProfileFormCard
- No functional changes to password form

## Data Flow

### Profile Preview Data

Profile preview needs:
- `avatarUrl` - from current profile actions hook
- `name` - from current profile actions hook
- `email` - from `user.email`
- `createdAt` - from `user.created_at` or `user.metadata.created_at`

### Form State Management

- Keep existing `useProfileActions` hook for profile form
- Keep existing `usePasswordValidation` hook for security form
- Combine in new `useProfileSecurityCombined` hook (optional, or just compose in the component)

## Implementation Notes

1. **Settings Tabs:** The tab navigation still needs to exist for Categories and Templates tabs. Only Profile and Security tabs are merged.

2. **Avatar Upload Flow:** Since the avatar uploader is being moved out of the form area:
   - The ProfileFormCard should have a button that triggers the same upload flow
   - Or the ProfilePreviewCard could have a camera/edit icon button on the avatar

3. **Member Since Date:** Format using existing date utilities from `lib/utils/date.ts`

4. **Responsive Breakpoint:** Use `lg` breakpoint (1024px) for the 30:70 split

## Files to Create

- `app/(app)/settings/components/profile/ProfilePreviewCard.tsx` - New preview card component
- `app/(app)/settings/components/ProfileSecurityCombined.tsx` - Combined container component

## Files to Modify

- `app/(app)/settings/page.tsx` - Update to use ProfileSecurityCombined instead of separate tabs
- `app/(app)/settings/components/SettingsTabs.tsx` - Remove profile/security from tab options
- `app/(app)/settings/components/profile/ProfileForm.tsx` - Refactor to work in new layout (remove avatar uploader area)
- `app/(app)/settings/components/ProfileTab.tsx` - Can be deprecated or refactored
- `app/(app)/settings/components/SecurityTab.tsx` - Can be deprecated or refactored

## Design System Compliance

- Use existing CSS variables: `bg-surface-card`, `text-text-primary`, `text-text-secondary`, `border-border`
- Use IBM Plex Sans for body text, IBM Plex Sans Mono for any data displays
- Follow existing card/rounded-2xl pattern
- Maintain consistent spacing (6 = 1.5rem) per design system

## Success Criteria

1. Profile and Security settings accessible on one page
2. Preview card displays correctly with all user data
3. Forms maintain all existing functionality and validation
4. Layout collapses gracefully on mobile devices
5. No regressions in Categories or Templates tabs
