# Settings Page: Profile & Security Combined Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine Profile and Security tabs into a single unified view with a 30:70 grid layout (preview card on left, forms stacked on right)

**Architecture:** Create new ProfilePreviewCard and ProfileSecurityCombined components, refactor ProfileForm to remove inline avatar uploader, update main settings page and tab navigation.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4, Supabase Auth

## Global Constraints

- Use existing CSS variables from `app/globals.css` (`bg-surface-card`, `text-text-primary`, `border-border`, etc.)
- Use IBM Plex Sans for body text (`font-sans`), IBM Plex Sans Mono for data (`font-mono`)
- Follow existing card pattern: `bg-surface-card border border-border rounded-2xl p-6`
- Use existing date utilities from `lib/utils/date.ts`
- Maintain all existing functionality and validation
- Keep responsive breakpoint at `lg` (1024px) for 30:70 split

---

## Task 1: Create ProfilePreviewCard Component

**Files:**
- Create: `app/(app)/settings/components/profile/ProfilePreviewCard.tsx`

**Interfaces:**
- Consumes: User data from Supabase auth (avatar, name, email, created_at)
- Produces: Read-only preview card component

**Implementation:**

- [ ] **Step 1: Create the ProfilePreviewCard component file**

```tsx
"use client";

import { User } from "lucide-react";
import { formatDateIndo } from "@/lib/utils/date";

interface ProfilePreviewCardProps {
  avatarUrl: string | null;
  name: string;
  email: string | null;
  createdAt: string | null;
}

export function ProfilePreviewCard({
  avatarUrl,
  name,
  email,
  createdAt,
}: ProfilePreviewCardProps) {
  const memberSince = createdAt
    ? formatDateIndo(new Date(createdAt), { month: "long", year: "numeric" })
    : null;

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4">
      {/* Avatar */}
      <div className="flex justify-center">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-surface"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center border-4 border-surface">
              <User className="w-12 h-12 text-text-muted" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary font-display">
          {name || "Pengguna"}
        </h3>
      </div>

      {/* Email */}
      <div className="text-center">
        <p className="text-sm text-text-secondary font-mono">
          {email || "email@contoh.com"}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Member Since */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Member sejak</span>
        <span className="text-text-secondary">{memberSince || "-"}</span>
      </div>

      {/* Account Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Status</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-text-success font-medium">Aktif</span>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/settings/components/profile/ProfilePreviewCard.tsx
git commit -m "feat: add ProfilePreviewCard component with user stats"
```

---

## Task 2: Check formatDateIndo Utility Exists

**Files:**
- Check: `lib/utils/date.ts`

**Interfaces:**
- Consumes: Nothing (verification task)
- Produces: Confirmation that date utility exists or needs to be added

- [ ] **Step 1: Read the date utility file**

Check if `formatDateIndo` function exists in `lib/utils/date.ts`. Expected signature:

```ts
export function formatDateIndo(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string
```

- [ ] **Step 2: If missing, add the utility**

If the function doesn't exist, add it to `lib/utils/date.ts`:

```ts
export function formatDateIndo(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return date.toLocaleDateString("id-ID", options);
}
```

- [ ] **Step 3: Commit if modified**

```bash
git add lib/utils/date.ts
git commit -m "fix: add formatDateIndo utility for Indonesian date formatting"
```

---

## Task 3: Refactor ProfileForm for New Layout

**Files:**
- Modify: `app/(app)/settings/components/profile/ProfileForm.tsx`
- Check: `app/(app)/settings/components/profile/useProfileActions.ts`

**Interfaces:**
- Consumes: `useProfileActions` hook
- Produces: ProfileForm component without inline avatar uploader

- [ ] **Step 1: Read the current ProfileForm component**

Read `app/(app)/settings/components/profile/ProfileForm.tsx` to understand current structure and what needs to be removed.

- [ ] **Step 2: Refactor ProfileForm to remove avatar uploader area**

The component should now only contain the form fields (name input, email display) and save button. The avatar upload will be triggered via a button instead of an inline uploader area.

Key changes:
- Remove any inline avatar display/upload area within the form
- Keep the name input field
- Keep the email display (read-only)
- Keep the save button
- Update card header for consistency

The refactored component should follow this pattern:

```tsx
"use client";

import { Mail, User } from "lucide-react";

interface ProfileFormProps {
  userEmail?: string | null;
  profileName: string;
  onProfileNameChange: (value: string) => void;
  onAvatarUpload: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isUploading: boolean;
}

export function ProfileForm({
  userEmail,
  profileName,
  onProfileNameChange,
  onAvatarUpload,
  onSubmit,
  isSaving,
  isUploading,
}: ProfileFormProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Informasi Profil
      </h2>

      {/* Avatar Upload Button */}
      <div>
        <button
          type="button"
          onClick={onAvatarUpload}
          disabled={isUploading || isSaving}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isUploading ? "Mengunggah..." : "Ubah Foto Profil"}
        </button>
      </div>

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => onProfileNameChange(e.target.value)}
          placeholder="Masukkan nama lengkap"
          className="w-full px-4 py-2.5 bg-surface-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving || isUploading}
        />
      </div>

      {/* Email Display (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </label>
        <div className="w-full px-4 py-2.5 bg-surface-hover border border-border rounded-lg text-text-muted font-mono">
          {userEmail || "email@contoh.com"}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSaving || isUploading || !profileName.trim()}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/settings/components/profile/ProfileForm.tsx
git commit -m "refactor: ProfileForm - remove inline avatar uploader, add upload button"
```

---

## Task 4: Update SecurityTab Card Styling

**Files:**
- Modify: `app/(app)/settings/components/SecurityTab.tsx`

**Interfaces:**
- Consumes: `usePasswordValidation` hook
- Produces: Security card with consistent styling

- [ ] **Step 1: Update SecurityTab header for consistency**

The security card header should match the profile form card styling with an icon. Update the header section:

```tsx
<h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
  <Lock className="w-5 h-5 text-primary" />
  Keamanan & Password
</h2>
```

(Note: The current SecurityTab may already have this styling; verify and ensure consistency with ProfileForm)

- [ ] **Step 2: Commit if modified**

```bash
git add app/\(app\)/settings/components/SecurityTab.tsx
git commit -m "refactor: SecurityTab - ensure card header styling consistency"
```

---

## Task 5: Create ProfileSecurityCombined Container

**Files:**
- Create: `app/(app)/settings/components/ProfileSecurityCombined.tsx`

**Interfaces:**
- Consumes: `useApp` for user data, `useProfileActions`, `usePasswordValidation`, ProfilePreviewCard, ProfileForm, SecurityTab components
- Produces: Combined container with 30:70 grid layout

- [ ] **Step 1: Create the ProfileSecurityCombined component**

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { ProfilePreviewCard } from "./profile/ProfilePreviewCard";
import { ProfileForm } from "./profile/ProfileForm";
import { SecurityTab } from "./SecurityTab";
import { useProfileActions } from "./profile/useProfileActions";

export function ProfileSecurityCombined() {
  const supabase = createClient();
  const { user, refreshUser } = useApp();

  const profileActions = useProfileActions({ user, supabase, refreshUser });

  // For SecurityTab, we need to render it inline to access its internal state
  // We'll create a wrapper component that combines both

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
      {/* Left Column: Profile Preview (30%) */}
      <div className="lg:sticky lg:top-6 h-fit">
        <ProfilePreviewCard
          avatarUrl={profileActions.avatarUrl}
          name={profileActions.profileName}
          email={user?.email || null}
          createdAt={user?.created_at || null}
        />
      </div>

      {/* Right Column: Forms (70%) */}
      <div className="space-y-6">
        {/* Profile Form Card */}
        <ProfileForm
          userEmail={user?.email}
          profileName={profileActions.profileName}
          onProfileNameChange={profileActions.setProfileName}
          onAvatarUpload={() => profileActions.fileInputRef.current?.click()}
          onSubmit={profileActions.handleProfileSave}
          isSaving={profileActions.profileSaving}
          isUploading={profileActions.uploading}
        />

        {/* Hidden file input for avatar upload */}
        <input
          ref={profileActions.fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={profileActions.handleAvatarUpload}
        />

        {/* Security Card */}
        <SecurityTabWrapper />
      </div>
    </div>
  );
}

// Wrapper component to render SecurityTab with its hooks
function SecurityTabWrapper() {
  const supabase = createClient();
  const { user } = useApp();

  // We need to use SecurityTab's internal logic
  // For now, we'll render SecurityTab as-is and extract its form
  // This is a temporary solution - ideally we'd refactor SecurityTab to separate form from card

  return <SecurityTab />;
}
```

Wait - I need to reconsider. The SecurityTab is a complete component with its own hooks. Let me check how to better integrate this.

Actually, looking at the current structure, SecurityTab is a self-contained card. Let me simplify:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { ProfilePreviewCard } from "./profile/ProfilePreviewCard";
import { ProfileForm } from "./profile/ProfileForm";
import { SecurityTab } from "./SecurityTab";
import { useProfileActions } from "./profile/useProfileActions";

export function ProfileSecurityCombined() {
  const supabase = createClient();
  const { user, refreshUser } = useApp();

  const profileActions = useProfileActions({ user, supabase, refreshUser });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
      {/* Left Column: Profile Preview (30%) */}
      <div className="lg:sticky lg:top-6 h-fit">
        <ProfilePreviewCard
          avatarUrl={profileActions.avatarUrl}
          name={profileActions.profileName}
          email={user?.email || null}
          createdAt={user?.created_at || null}
        />
      </div>

      {/* Right Column: Forms (70%) */}
      <div className="space-y-6">
        {/* Profile Form Card */}
        <ProfileForm
          userEmail={user?.email}
          profileName={profileActions.profileName}
          onProfileNameChange={profileActions.setProfileName}
          onAvatarUpload={() => profileActions.fileInputRef.current?.click()}
          onSubmit={profileActions.handleProfileSave}
          isSaving={profileActions.profileSaving}
          isUploading={profileActions.uploading}
        />

        {/* Hidden file input for avatar upload */}
        <input
          ref={profileActions.fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={profileActions.handleAvatarUpload}
        />

        {/* Security Card - rendered as-is, it's a complete card component */}
        <SecurityTab />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/settings/components/ProfileSecurityCombined.tsx
git commit -m "feat: add ProfileSecurityCombined container with 30:70 grid layout"
```

---

## Task 6: Update Main Settings Page

**Files:**
- Modify: `app/(app)/settings/page.tsx`
- Modify: `app/(app)/settings/components/SettingsTabs.tsx`

**Interfaces:**
- Consumes: ProfileSecurityCombined component
- Produces: Updated settings page with combined profile/security view

- [ ] **Step 1: Update SettingsTabs to remove profile/security options**

Read `app/(app)/settings/components/SettingsTabs.tsx` and modify the tab options to only include "categories" and "templates". The active tab type should be:

```ts
type TabType = "profile-security" | "categories" | "templates";
```

Update the tab labels array:

```ts
const tabs: Array<{ value: TabType; label: string }> = [
  { value: "profile-security", label: "Profil & Keamanan" },
  { value: "categories", label: "Kategori" },
  { value: "templates", label: "Template" },
];
```

- [ ] **Step 2: Update the main settings page**

Modify `app/(app)/settings/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/molecules/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";
import { CategoriesTab } from "./components/CategoriesTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { SettingsTabs } from "./components/SettingsTabs";
import { ProfileSecurityCombined } from "./components/ProfileSecurityCombined";

type TabType = "profile-security" | "categories" | "templates";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile-security");

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        icon={SettingsIcon}
        title="Pengaturan Aplikasi"
        description="Kelola profil pengguna, kategori transaksi, template transaksi, dan keamanan akun Anda."
      />

      {/* Tabs Selector */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      {activeTab === "profile-security" && <ProfileSecurityCombined />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "templates" && <TemplatesTab />}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/settings/page.tsx app/\(app\)/settings/components/SettingsTabs.tsx
git commit -m "feat: update settings page to use combined profile-security view"
```

---

## Task 7: Clean Up Deprecated Components

**Files:**
- Optionally delete: `app/(app)/settings/components/ProfileTab.tsx`
- Optionally delete: `app/(app)/settings/components/profile/ProfileAvatarUploader.tsx`

- [ ] **Step 1: Delete deprecated ProfileTab component**

Since ProfileTab is no longer used (replaced by ProfileSecurityCombined), delete it:

```bash
rm app/\(app\)/settings/components/ProfileTab.tsx
```

- [ ] **Step 2: Delete ProfileAvatarUploader component**

The avatar uploader UI is no longer needed as a separate component (upload triggered via button in ProfileForm):

```bash
rm app/\(app\)/settings/components/profile/ProfileAvatarUploader.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove deprecated ProfileTab and ProfileAvatarUploader components"
```

---

## Task 8: Visual Testing and Verification

**Files:**
- Test: Browser testing on localhost:3000

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to settings page**

Open browser to `http://localhost:3000/settings`

- [ ] **Step 3: Verify desktop layout**

On desktop (≥1024px):
- Verify 30:70 split is visible
- Profile preview card on left with avatar, name, email, member since, status
- Profile form and security card stacked on right
- Check sticky positioning on preview card (stays visible while scrolling)

- [ ] **Step 4: Verify mobile layout**

Resize browser to <1024px or use mobile view:
- Verify single column layout
- Preview card at top
- Profile form below
- Security card at bottom

- [ ] **Step 5: Test functionality**

- Click "Ubah Foto Profil" button - verify file picker opens
- Change name and click "Simpan Profil" - verify save works
- Change password and click update - verify password change works
- Switch to "Kategori" tab - verify categories tab works
- Switch to "Template" tab - verify templates tab works

- [ ] **Step 6: Check console for errors**

Open browser DevTools and verify no console errors or warnings.

---

## Task 9: Update Type Definitions (if needed)

**Files:**
- Check: `app/(app)/settings/components/SettingsTabs.tsx`

- [ ] **Step 1: Verify type consistency**

Ensure all tab-related types are consistent between SettingsTabs.tsx and page.tsx. The TabType should be defined in one place and imported if shared.

If currently duplicated, extract to a shared types file:

```tsx
// app/(app)/settings/components/types.ts
export type SettingsTab = "profile-security" | "categories" | "templates";
```

Then import in both files.

- [ ] **Step 2: Commit if modified**

```bash
git add app/\(app\)/settings/components/types.ts app/\(app\)/settings/components/SettingsTabs.tsx app/\(app\)/settings/page.tsx
git commit -m "refactor: extract shared SettingsTab type"
```

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ ProfilePreviewCard with avatar, name, email, member since, status (Task 1)
- ✅ ProfileSecurityCombined container with 30:70 layout (Task 5)
- ✅ ProfileForm refactored with avatar upload button (Task 3)
- ✅ Security card styling consistency (Task 4)
- ✅ Settings page and tabs updated (Task 6)
- ✅ Responsive behavior at lg breakpoint (all tasks)
- ✅ Date utility for formatting (Task 2)

**Placeholder Scan:**
- ✅ No TBD/TODO placeholders
- ✅ All code blocks contain actual implementation
- ✅ No "add appropriate error handling" - specific steps defined

**Type Consistency:**
- ✅ TabType consistent across files (Task 6, Task 9)
- ✅ ProfilePreviewCardProps defined (Task 1)
- ✅ ProfileFormProps defined (Task 3)
