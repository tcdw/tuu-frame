import type { LocaleKeys } from "@/locales";

const zhTW: LocaleKeys = {
    // 通用
    error: "錯誤",
    success: "成功",
    loading: "載入中……",

    // 登入頁
    "login.title": "登入",
    "login.description": "請輸入使用者名稱及密碼以登入帳號。",
    "login.username": "使用者名稱",
    "login.password": "密碼",
    "login.username_placeholder": "請輸入使用者名稱",
    "login.password_placeholder": "請輸入密碼",
    "login.username_required": "使用者名稱為必填欄位",
    "login.password_required": "密碼為必填欄位",
    "login.failed": "登入失敗，請檢查您的資料。",
    "login.logging_in": "正在登入……",
    "login.button": "登入",

    // 儀表板
    "dashboard.title": "預設資料夾",
    "dashboard.description": "管理你儲存的預設資料夾。點擊播放可設為目前目錄。",
    "dashboard.error": "錯誤",
    "dashboard.loading": "正在載入預設……",
    "dashboard.empty": "尚無預設，請在下方新增。",
    "dashboard.play": "播放",
    "dashboard.delete": "刪除",
    "dashboard.set_active_dir": "設定目前目錄",
    "dashboard.set_active_dir_desc": "手動輸入路徑或選擇預設開始播放。",
    "dashboard.input_placeholder": "輸入絕對路徑或點擊預設的「播放」按鈕",
    "dashboard.set_and_play": "設定並播放",
    "dashboard.preset_path_empty": "預設路徑不能為空。",
    "dashboard.preset_update_failed": "操作已完成，但未能從回應中更新列表。",
    "dashboard.fetch_error": "取得預設時發生未知錯誤。",
    "dashboard.add_error": "新增預設時發生未知錯誤。",
    "dashboard.delete_error": "刪除預設時發生未知錯誤。",
    "dashboard.active_dir_empty": "目前目錄路徑不能為空。",
    "dashboard.set_active_dir_error": "設定目前目錄時發生未知錯誤。",
    "dashboard.add": "新增預設",
    "dashboard.open_monitor": "開啟監控頁面",
    "dashboard.input_name_placeholder": "預設名稱（可選）",
    "dashboard.input_path_placeholder": "預設路徑（如 /Users/name/videos）",
    "dashboard.delete_confirm_title": "確認刪除",
    "dashboard.delete_confirm_desc": "確定要刪除此預設嗎？此操作無法還原。",
    "dashboard.delete_confirm_cancel": "取消",
    "dashboard.delete_confirm_ok": "刪除",

    // 修改密碼
    "change_password.back": "返回儀表板",
    "change_password.title": "變更密碼",
    "change_password.description": "在下方更新您的密碼，建議使用強密碼！",
    "change_password.old": "舊密碼",
    "change_password.new": "新密碼",
    "change_password.confirm": "確認新密碼",
    "change_password.all_required": "所有欄位皆為必填。",
    "change_password.not_match": "兩次輸入的新密碼不一致。",
    "change_password.success": "密碼變更成功！",
    "change_password.relogin": "請重新登入",
    "change_password.failed": "變更密碼失敗，請檢查資料。",
    "change_password.error": "錯誤",
    "change_password.success_title": "成功",
    "change_password.changing": "正在變更……",
    "change_password.button": "變更密碼",

    // 監控
    "monitor.back": "返回儀表板",
    "monitor.title": "遠端播放器監控",
    "monitor.description": "即時檢視遠端播放器畫面，並定時刷新。",
    "monitor.play": "播放",
    "monitor.pause": "暫停",
    "monitor.next": "下一首",

    // 側邊欄/通用
    "nav.dashboard": "儀表板",
    "nav.monitor": "監控",
    "nav.change_password": "變更密碼",
    "nav.group_navigation": "導航",
    "nav.group_settings": "設定",
    "nav.logout": "登出",
    "nav.menu": "選單",
    "nav.close": "關閉",
    "nav.mv_player": "MV Player",
    "nav.user": "使用者",

    // __root.tsx
    "root.loading_auth": "正在載入認證資訊……",

    // 目錄瀏覽器
    "dir_browser.title": "選擇資料夾",
    "dir_browser.desc": "選擇一個資料夾作為預設路徑。",
    "dir_browser.current_path": "目前路徑：",
    "dir_browser.loading": "載入中……",
    "dir_browser.error": "錯誤",
    "dir_browser.error_failed": "載入目錄內容失敗。",
    "dir_browser.error_os": "獲取作業系統資訊失敗。",
    "dir_browser.empty": "此目錄為空。",
    "dir_browser.cancel": "取消",
    "dir_browser.select": "選擇目前路徑",
    "dir_browser.drives": "磁碟機",
    "dir_browser.back_to_drives": "返回磁碟機列表",
    "dir_browser.no_drives": "找不到磁碟機。",
    "dir_browser.refresh": "重新整理",
};

export default zhTW;
