import { useState, useEffect, useCallback } from "react";
import * as ApiTypes from "../../../mv-player/src/shared-api-types";
import { browseDirectories, listDrives, getOsInfo } from "../services/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Folder, ArrowUpCircle, Loader2, AlertCircle, CheckCircle, HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DirectoryBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPath: (path: string) => void;
    initialPath?: string;
}

export function DirectoryBrowserModal({ isOpen, onClose, onSelectPath, initialPath }: DirectoryBrowserModalProps) {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [directories, setDirectories] = useState<ApiTypes.DirectoryEntry[]>([]);
    const [drives, setDrives] = useState<ApiTypes.DriveEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Overall loading for initial/empty states
    const [loadingItemPath, setLoadingItemPath] = useState<string | null>(null); // For item-specific loading
    const [error, setError] = useState<string | null>(null);
    const [showDrives, setShowDrives] = useState(false); // Whether to show drives or directories
    const [isWindows, setIsWindows] = useState<boolean | null>(null);
    const { t } = useTranslation();

    const fetchDrives = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await listDrives();
            setDrives(result.drives);
            setShowDrives(true);
        } catch (err: any) {
            console.error("Error fetching drives:", err);
            setError(err.message || t("dir_browser.error_failed"));
            setDrives([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const fetchPathContents = useCallback(
        async (pathToList: string | undefined) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await browseDirectories(pathToList);
                setDirectories(result.entries);
                setCurrentPath(result.path);
            } catch (err: any) {
                console.error("Error browsing directories:", err);
                setError(err.message || t("dir_browser.error_failed"));
                setDirectories([]);
            } finally {
                setIsLoading(false);
                setLoadingItemPath(null); // Clear item-specific loader regardless of outcome
            }
        },
        [t],
    );

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getOsInfo()
                .then(osInfo => {
                    setIsWindows(osInfo.isWindows);
                    if (initialPath) {
                        fetchPathContents(initialPath);
                        setShowDrives(false);
                    } else if (osInfo.isWindows) {
                        fetchDrives(); // Load drives for Windows
                    } else {
                        fetchPathContents(undefined); // Load home dir for non-Windows
                        setShowDrives(false);
                    }
                })
                .catch((err: any) => {
                    console.error("Failed to get OS info:", err);
                    setError(err.message || t("dir_browser.error_os"));
                    setIsWindows(false); // Fallback assumption
                })
                .finally(() => {
                    // This top-level loading state might be handled within each fetch function instead
                    // For now, let's keep it simple. The individual fetch functions will set it to false.
                });
        } else {
            // Reset state when modal is closed
            setCurrentPath("");
            setDirectories([]);
            setDrives([]);
            setError(null);
            setIsLoading(false);
            setShowDrives(false);
            setIsWindows(null);
        }
    }, [isOpen, initialPath, fetchPathContents, fetchDrives, t]);

    const handleDriveClick = (drive: ApiTypes.DriveEntry) => {
        if (loadingItemPath === drive.path) return; // Prevent re-click if already loading this item
        setLoadingItemPath(drive.path);
        setShowDrives(false);
        fetchPathContents(drive.path);
    };

    const handleDirectoryClick = (dir: ApiTypes.DirectoryEntry) => {
        if (loadingItemPath === dir.path) return; // Prevent re-click if already loading this item
        setLoadingItemPath(dir.path);
        fetchPathContents(dir.path);
    };

    const handleSelectCurrentPath = () => {
        onSelectPath(currentPath);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t("dir_browser.title")}</DialogTitle>
                    <DialogDescription>
                        {t("dir_browser.desc")}
                        {showDrives ? null : <>
                            <span>{t("dir_browser.current_path")}</span><code className="font-mono bg-muted px-1 py-0.5 rounded text-sm break-all">
                            {currentPath || t("dir_browser.loading")}
                        </code>
                        </>}
                    </DialogDescription>
                </DialogHeader>

                {/* Drive/Path Navigation */}
                {isWindows && !showDrives && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowDrives(true);
                                setCurrentPath("");
                                setDirectories([]);
                            }}
                        >
                            <HardDrive />
                            {t("dir_browser.back_to_drives")}
                        </Button>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("dir_browser.error")}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="h-[300px] w-full min-w-0 rounded-md border p-3 my-2 overflow-y-scroll">
                    {(() => {
                        // 显示加载状态
                        if (isLoading && ((showDrives && drives.length === 0) || (!showDrives && directories.length === 0)) && !loadingItemPath) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="ml-2">{t("dir_browser.loading")}</p>
                                </div>
                            );
                        }

                        // 显示驱动器列表
                        if (showDrives) {
                            if (drives.length === 0) {
                                return (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">{t("dir_browser.no_drives")}</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <ul className="flex flex-col gap-1 items-stretch min-w-0">
                                        {drives.map(drive => (
                                            <li key={drive.name + drive.path} className={"contents"}>
                                                <Button
                                                    variant="ghost"
                                                    className="min-w-0 w-full justify-start text-left h-auto py-2 px-3 overflow-hidden flex items-center space-x-2"
                                                    onClick={() => handleDriveClick(drive)}
                                                    title={drive.path}
                                                    disabled={loadingItemPath === drive.path}
                                                >
                                                    {(() => {
                                                        if (loadingItemPath === drive.path) {
                                                            return <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />;
                                                        } else {
                                                            return <HardDrive className="h-5 w-5 text-green-500 flex-shrink-0" />;
                                                        }
                                                    })()}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-sm font-medium">{drive.name}</p>
                                                        {(() => {
                                                            if (drive.label) {
                                                                return (
                                                                    <p className="truncate text-xs text-muted-foreground">{drive.label}</p>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }
                        } else {
                            // 显示目录列表
                            if (directories.length === 0 && !isLoading) {
                                return (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">{t("dir_browser.empty")}</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <ul className="flex flex-col gap-1 items-stretch min-w-0">
                                        {directories.map(dir => (
                                            <li key={dir.name + dir.path} className={"contents"}>
                                                <Button
                                                    variant="ghost"
                                                    className="min-w-0 w-full justify-start text-left h-auto py-2 px-3 overflow-hidden flex items-center space-x-2"
                                                    onClick={() => handleDirectoryClick(dir)}
                                                    title={dir.path}
                                                    disabled={loadingItemPath === dir.path}
                                                >
                                                    {/* Icon with flex-shrink: 0 */}
                                                    {(() => {
                                                        if (loadingItemPath === dir.path) {
                                                            return <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />;
                                                        } else if (dir.name === ".. (Up)") {
                                                            return <ArrowUpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
                                                        } else {
                                                            return <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />;
                                                        }
                                                    })()}
                                                    {/* Text wrapper that grows and shrinks */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-sm">{dir.name}</p>
                                                    </div>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }
                        }
                    })()}
                </div>

                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {t("dir_browser.cancel")}
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSelectCurrentPath} disabled={isLoading || !currentPath || showDrives}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("dir_browser.select")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
