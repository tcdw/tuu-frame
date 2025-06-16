// English translation file for i18n
// Key must match LocaleKeys in locales.d.ts

import type { LocaleKeys } from "@/locales";

const en: LocaleKeys = {
    // Common
    error: "Error",
    success: "Success",
    loading: "Loading...",

    // Login page
    "login.title": "Login",
    "login.description": "Enter your username and password to access your account.",
    "login.username": "Username",
    "login.password": "Password",
    "login.username_placeholder": "Enter username",
    "login.password_placeholder": "Enter password",
    "login.username_required": "Username is required",
    "login.password_required": "Password is required",
    "login.failed": "Login failed. Please check your credentials.",
    "login.logging_in": "Logging in...",
    "login.button": "Login",

    // Dashboard
    "dashboard.title": "Preset Folders",
    "dashboard.description": "Manage your saved preset folders. Click play to set as active directory.",
    "dashboard.error": "Error",
    "dashboard.loading": "Loading presets...",
    "dashboard.empty": "No presets saved yet. Add one below.",
    "dashboard.play": "Play",
    "dashboard.delete": "Delete",
    "dashboard.set_active_dir": "Set Active Directory",
    "dashboard.set_active_dir_desc": "Manually enter a path or select a preset to start playback.",
    "dashboard.input_placeholder": "Enter absolute path or click 'Play' on a preset",
    "dashboard.set_and_play": "Set & Play",
    "dashboard.preset_path_empty": "Preset path cannot be empty.",
    "dashboard.preset_update_failed": "Preset action completed, but failed to update list from response.",
    "dashboard.fetch_error": "An unknown error occurred while fetching presets.",
    "dashboard.add_error": "An unknown error occurred while adding preset.",
    "dashboard.delete_error": "An unknown error occurred while deleting preset.",
    "dashboard.active_dir_empty": "Active directory path cannot be empty.",
    "dashboard.set_active_dir_error": "An unknown error occurred while setting active directory.",
    "dashboard.add": "Add Preset",
    "dashboard.open_monitor": "Open Monitor Page",
    "dashboard.input_name_placeholder": "Preset Name (optional)",
    "dashboard.input_path_placeholder": "Preset Path (e.g., /Users/name/videos)",

    // Change password
    "change_password.back": "Back to Dashboard",
    "change_password.title": "Change Password",
    "change_password.description": "Update your password below. Make sure it's a strong one!",
    "change_password.old": "Old Password",
    "change_password.new": "New Password",
    "change_password.confirm": "Confirm New Password",
    "change_password.all_required": "All fields are required.",
    "change_password.not_match": "New passwords do not match.",
    "change_password.success": "Password changed successfully!",
    "change_password.relogin": "Please log in again",
    "change_password.failed": "Failed to change password. Please check your details.",
    "change_password.error": "Error",
    "change_password.success_title": "Success",
    "change_password.changing": "Changing...",
    "change_password.button": "Change Password",

    // Monitor
    "monitor.back": "Back to Dashboard",
    "monitor.title": "Remote Player Monitor",
    "monitor.description": "Live view of the mv-player window. Stream updates periodically.",
    "monitor.play": "Play",
    "monitor.pause": "Pause",
    "monitor.next": "Next Track",

    // DashboardLayout sidebar / common
    "nav.dashboard": "Dashboard",
    "nav.monitor": "Monitor",
    "nav.change_password": "Change Password",
    "nav.group_navigation": "Navigation",
    "nav.group_settings": "Settings",
    "nav.logout": "Logout",
    "nav.menu": "Menu",
    "nav.close": "Close",
    "nav.mv_player": "MV Player",
    "nav.user": "User",

    // __root.tsx
    "root.loading_auth": "Loading authentication...",

    // dir_browser.*
    "dir_browser.title": "Browse for Folder",
    "dir_browser.desc": "Select a folder to use as a preset path. Current path:",
    "dir_browser.current_path": "Current path:",
    "dir_browser.loading": "Loading...",
    "dir_browser.error": "Error",
    "dir_browser.error_failed": "Failed to load directory contents.",
    "dir_browser.empty": "No sub-directories found.",
    "dir_browser.cancel": "Cancel",
    "dir_browser.select": "Select Current Path",
};

export default en;
