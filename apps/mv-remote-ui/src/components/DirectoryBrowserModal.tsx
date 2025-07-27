import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiTypes from "@mtv/shared-api-types";
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
import { Folder, ArrowUpCircle, Loader2, AlertCircle, CheckCircle, HardDrive, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DirectoryBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPath: (path: string) => void;
    initialPath?: string;
}

export function DirectoryBrowserModal({ isOpen, onClose, onSelectPath, initialPath }: DirectoryBrowserModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // `browseTarget` determines what to fetch and display.
    // `null` = closed/initializing, 'drives' = drive list, string = directory path, `undefined` = home directory.
    const [browseTarget, setBrowseTarget] = useState<string | "drives" | null | undefined>(null);
    const [loadingItemPath, setLoadingItemPath] = useState<string | null>(null);

    const osInfoQuery = useQuery({
        queryKey: ["osInfo"],
        queryFn: getOsInfo,
        enabled: isOpen,
        staleTime: Infinity, // OS info is static for the app's lifetime
        refetchOnWindowFocus: false,
    });
    const isWindows = osInfoQuery.data?.isWindows;

    // Set the initial browse target when the modal opens or OS info becomes available.
    useEffect(() => {
        if (!isOpen) {
            setBrowseTarget(null); // Reset when closed
            return;
        }

        // Once OS info is loaded, decide the initial view.
        if (osInfoQuery.isSuccess && browseTarget === null) {
            if (initialPath) {
                setBrowseTarget(initialPath);
            } else if (isWindows) {
                setBrowseTarget("drives");
            } else {
                setBrowseTarget(undefined); // `undefined` fetches the home directory.
            }
        }
    }, [isOpen, initialPath, isWindows, osInfoQuery.isSuccess, browseTarget]);

    const showDrives = browseTarget === "drives";

    const drivesQuery = useQuery({
        queryKey: ["drives"],
        queryFn: listDrives,
        enabled: isOpen && showDrives,
    });

    const directoriesQuery = useQuery({
        queryKey: ["directories", browseTarget],
        queryFn: () => browseDirectories(browseTarget === "drives" || browseTarget === null ? undefined : browseTarget),
        enabled: isOpen && !showDrives && browseTarget !== null,
    });

    // Consolidate loading and error states from all relevant queries.
    const isContentFetching = drivesQuery.isFetching || directoriesQuery.isFetching;
    const isInitiallyLoading = osInfoQuery.isLoading || (isContentFetching && !loadingItemPath);
    const overallError = osInfoQuery.error || drivesQuery.error || directoriesQuery.error;

    // Derived state from queries
    const currentPath = directoriesQuery.data?.path;
    const directories = directoriesQuery.data?.entries ?? [];
    const drives = drivesQuery.data?.drives ?? [];

    // When a fetch completes, clear the item-specific loading indicator.
    useEffect(() => {
        if (!isContentFetching) {
            setLoadingItemPath(null);
        }
    }, [isContentFetching]);

    const handleDriveClick = (drive: ApiTypes.DriveEntry) => {
        if (loadingItemPath === drive.path) return;
        setLoadingItemPath(drive.path);
        setBrowseTarget(drive.path);
    };

    const handleDirectoryClick = (dir: ApiTypes.DirectoryEntry) => {
        if (loadingItemPath === dir.path) return;
        setLoadingItemPath(dir.path);
        setBrowseTarget(dir.path);
    };

    const handleSelectCurrentPath = () => {
        if (currentPath) {
            onSelectPath(currentPath);
            onClose();
        }
    };

    const handleBackToDrives = () => {
        setBrowseTarget("drives");
    };

    const handleRefresh = () => {
        if (showDrives) {
            queryClient.invalidateQueries({ queryKey: ["drives"] });
        } else {
            queryClient.invalidateQueries({ queryKey: ["directories", browseTarget] });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t("dir_browser.title")}</DialogTitle>
                    <DialogDescription>
                        {t("dir_browser.desc")}
                        {!showDrives && (
                            <div className="mt-2">
                                <span>{t("dir_browser.current_path")}</span>
                                <code className="font-mono bg-muted px-1 py-0.5 rounded text-sm break-all">
                                    {currentPath || t("dir_browser.loading")}
                                </code>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between gap-2 my-2">
                    <div>
                        {isWindows && !showDrives && currentPath && (
                            <Button variant="outline" size="sm" onClick={handleBackToDrives}>
                                <HardDrive className="mr-2 h-4 w-4" />
                                {t("dir_browser.back_to_drives")}
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isContentFetching}>
                        {isContentFetching ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {t("dir_browser.refresh")}
                    </Button>
                </div>

                {overallError && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("dir_browser.error")}</AlertTitle>
                        <AlertDescription>
                            {overallError instanceof Error ? overallError.message : String(overallError)}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="h-[300px] w-full min-w-0 rounded-md border p-3 my-2 overflow-y-scroll">
                    {(() => {
                        if (isInitiallyLoading) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="ml-2">{t("dir_browser.loading")}</p>
                                </div>
                            );
                        }

                        if (showDrives) {
                            if (drives.length === 0 && !drivesQuery.isLoading) {
                                return (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">{t("dir_browser.no_drives")}</p>
                                    </div>
                                );
                            }
                            return (
                                <ul className="flex flex-col gap-1 items-stretch min-w-0">
                                    {drives.map(drive => (
                                        <li key={drive.name + drive.path} className="contents">
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
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {drive.label}
                                                        </p>
                                                    )}
                                                </div>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            );
                        }

                        if (directories.length === 0 && !directoriesQuery.isFetching) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-muted-foreground">{t("dir_browser.empty")}</p>
                                </div>
                            );
                        }
                        return (
                            <ul className="flex flex-col gap-1 items-stretch min-w-0">
                                {directories.map(dir => (
                                    <li key={dir.name + dir.path} className="contents">
                                        <Button
                                            variant="ghost"
                                            className="min-w-0 w-full justify-start text-left h-auto py-2 px-3 overflow-hidden flex items-center space-x-2"
                                            onClick={() => handleDirectoryClick(dir)}
                                            title={dir.path}
                                            disabled={loadingItemPath === dir.path}
                                        >
                                            {loadingItemPath === dir.path && (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                                            )}
                                            {loadingItemPath !== dir.path &&
                                                (dir.name === ".. (Up)" ? (
                                                    <ArrowUpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                ) : (
                                                    <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                ))}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm">{dir.name}</p>
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        );
                    })()}
                </div>

                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {t("dir_browser.cancel")}
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={handleSelectCurrentPath}
                        disabled={isInitiallyLoading || !currentPath || showDrives}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("dir_browser.select")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
