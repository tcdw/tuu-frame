// 简体中文（中国大陆）翻译文件，key 必须与 locales.d.ts 完全一致

import type { LocaleKeys } from "@/locales";

const zhHansCN: LocaleKeys = {
    // 通用
    error: "错误",
    success: "成功",
    loading: "加载中……",

    // 登录页
    "login.title": "登录",
    "login.description": "请输入用户名和密码以访问您的账户。",
    "login.username": "用户名",
    "login.password": "密码",
    "login.username_placeholder": "请输入用户名",
    "login.password_placeholder": "请输入密码",
    "login.username_required": "用户名为必填项",
    "login.password_required": "密码为必填项",
    "login.failed": "登录失败，请检查您的凭据。",
    "login.logging_in": "正在登录……",
    "login.button": "登录",

    // 仪表盘
    "dashboard.title": "预设文件夹",
    "dashboard.description": "管理你保存的预设文件夹。点击播放可设为当前目录。",
    "dashboard.error": "错误",
    "dashboard.loading": "正在加载预设……",
    "dashboard.empty": "暂无预设，请在下方添加。",
    "dashboard.play": "播放",
    "dashboard.delete": "删除",
    "dashboard.set_active_dir": "设置当前目录",
    "dashboard.set_active_dir_desc": "手动输入路径或选择预设开始播放。",
    "dashboard.input_placeholder": "输入绝对路径或点击预设的「播放」按钮",
    "dashboard.set_and_play": "设置并播放",
    "dashboard.preset_path_empty": "预设路径不能为空。",
    "dashboard.preset_update_failed": "操作已完成，但未能从响应中更新列表。",
    "dashboard.fetch_error": "获取预设时发生未知错误。",
    "dashboard.add_error": "添加预设时发生未知错误。",
    "dashboard.delete_error": "删除预设时发生未知错误。",
    "dashboard.active_dir_empty": "当前目录路径不能为空。",
    "dashboard.set_active_dir_error": "设置当前目录时发生未知错误。",
    "dashboard.add": "添加预设",
    "dashboard.open_monitor": "打开监控页面",
    "dashboard.input_name_placeholder": "预设名称（可选）",
    "dashboard.input_path_placeholder": "预设路径（如 /Users/name/videos）",
    "dashboard.delete_confirm_title": "确认删除",
    "dashboard.delete_confirm_desc": "确定要删除该预设吗？此操作不可撤销。",
    "dashboard.delete_confirm_cancel": "取消",
    "dashboard.delete_confirm_ok": "删除",

    // 修改密码
    "change_password.back": "返回仪表盘",
    "change_password.title": "修改密码",
    "change_password.description": "在下方更新您的密码，建议使用强密码！",
    "change_password.old": "旧密码",
    "change_password.new": "新密码",
    "change_password.confirm": "确认新密码",
    "change_password.all_required": "所有字段均为必填项。",
    "change_password.not_match": "两次输入的新密码不一致。",
    "change_password.success": "密码修改成功！",
    "change_password.relogin": "请重新登录",
    "change_password.failed": "修改密码失败，请检查信息。",
    "change_password.error": "错误",
    "change_password.success_title": "成功",
    "change_password.changing": "正在修改……",
    "change_password.button": "修改密码",

    // 监控
    "monitor.back": "返回仪表盘",
    "monitor.title": "远程播放器监控",
    "monitor.description": "实时查看远程播放器画面，并且定时刷新。",
    "monitor.play": "播放",
    "monitor.pause": "暂停",
    "monitor.next": "下一曲",

    // DashboardLayout 侧边栏/通用
    "nav.dashboard": "仪表盘",
    "nav.monitor": "监控",
    "nav.change_password": "修改密码",
    "nav.group_navigation": "导航",
    "nav.group_settings": "设置",
    "nav.logout": "退出",
    "nav.menu": "菜单",
    "nav.close": "关闭",
    "nav.mv_player": "MV Player",
    "nav.user": "用户",

    // __root.tsx
    "root.loading_auth": "正在加载认证信息……",

    // 目录浏览器 DirectoryBrowserModal
    "dir_browser.title": "选择文件夹",
    "dir_browser.desc": "选择一个文件夹作为预设路径。",
    "dir_browser.current_path": "当前路径：",
    "dir_browser.loading": "加载中...",
    "dir_browser.error": "错误",
    "dir_browser.error_failed": "加载目录内容失败。",
    "dir_browser.error_os": "获取操作系统信息失败。",
    "dir_browser.empty": "该目录为空。",
    "dir_browser.cancel": "取消",
    "dir_browser.select": "选择当前路径",
    "dir_browser.drives": "磁盘",
    "dir_browser.back_to_drives": "返回磁盘列表",
    "dir_browser.no_drives": "未找到磁盘驱动器。",
    "dir_browser.refresh": "刷新",
};

export default zhHansCN;
