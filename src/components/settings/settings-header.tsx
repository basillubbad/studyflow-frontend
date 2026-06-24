import React from "react";

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your account settings and set your preferences.
      </p>
    </div>
  );
}
