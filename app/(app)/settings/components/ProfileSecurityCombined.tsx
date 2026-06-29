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

  // Prioritize user_metadata avatar, fallback to database value
  const displayAvatarUrl = user?.user_metadata?.avatar_url || profileActions.avatarUrl || null;

  // Create a wrapper that passes an empty event to handleProfileSave
  const handleProfileSave = () => {
    const event = new Event("submit", { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
    profileActions.handleProfileSave(event);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
      {/* Left Column: Profile Preview (30%) */}
      <div className="lg:sticky lg:top-6 h-fit">
        <ProfilePreviewCard
          avatarUrl={displayAvatarUrl}
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
          avatarUrl={displayAvatarUrl}
          onProfileNameChange={profileActions.setProfileName}
          onAvatarUpload={() => profileActions.fileInputRef.current?.click()}
          onSubmit={handleProfileSave}
          isSaving={profileActions.profileSaving}
          isUploading={profileActions.uploading}
          isDragOver={profileActions.isDragOver}
          onDragOver={profileActions.handleDragOver}
          onDragLeave={profileActions.handleDragLeave}
          onDrop={profileActions.handleDrop}
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
