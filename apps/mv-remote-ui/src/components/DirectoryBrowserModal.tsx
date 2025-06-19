import { useState, useEffect, useCallback } from "react";
import * as ApiTypes from "../../../mv-player/src/shared-api-types";
import { browseDirectories, listDrives } from "../services/api";
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
            if (initialPath) {
                fetchPathContents(initialPath); // Load initial path when modal opens
                setShowDrives(false);
            } else {
                fetchDrives(); // Load drives when no initial path
            }
        } else {
            // Reset state when modal is closed
            setCurrentPath("");
            setDirectories([]);
            setDrives([]);
            setError(null);
            setIsLoading(false);
            setShowDrives(false);
        }
    }, [isOpen, initialPath, fetchPathContents, fetchDrives]);

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
                        {t("dir_browser.desc")} <span>{t("dir_browser.current_path")}</span>
                        <code className="font-mono bg-muted px-1 py-0.5 rounded text-sm break-all">
                            {currentPath || t("dir_browser.loading")}
                        </code>
                    </DialogDescription>
                </DialogHeader>

                {/* Drive/Path Navigation */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={showDrives ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setShowDrives(true);
                            setCurrentPath("");
                            setDirectories([]);
                        }}
                    >
                        <HardDrive className="mr-2 h-4 w-4" />
                        {t("dir_browser.drives")}
                    </Button>
                    {!showDrives && currentPath && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowDrives(true);
                                setCurrentPath("");
                                setDirectories([]);
                            }}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            {t("dir_browser.back_to_drives")}
                        </Button>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("dir_browser.error")}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="h-[300px] w-full min-w-0 rounded-md border p-3 my-4 overflow-y-scroll">
                    {isLoading && ((showDrives && drives.length === 0) || (!showDrives && directories.length === 0)) && !loadingItemPath ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2">{t("dir_browser.loading")}</p>
                        </div>
                    ) : showDrives ? (
                        // Show drives
                        drives.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">{t("dir_browser.no_drives")}</p>
                            </div>
                        ) : (
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
                                            {loadingItemPath === drive.path ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                                            ) : (
                                                <HardDrive className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium">{drive.name}</p>
                                                {drive.label && (
                                                    <p className="truncate text-xs text-muted-foreground">{drive.label}</p>
                                                )}
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : (
                        // Show directories
                        directories.length === 0 && !isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">{t("dir_browser.empty")}</p>
                            </div>
                        ) : (
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
                                            {loadingItemPath === dir.path ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                                            ) : dir.name === ".. (Up)" ? (
                                                <ArrowUpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            ) : (
                                                <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                            )}
                                            {/* Text wrapper that grows and shrinks */}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm">{dir.name}</p>
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
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
