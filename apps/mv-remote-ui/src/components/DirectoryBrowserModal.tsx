import { useState, useEffect, useCallback } from "react";
import * as ApiTypes from "../../../mv-player/src/shared-api-types";
import { browseDirectories } from "../services/api";
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
import { Folder, ArrowUpCircle, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface DirectoryBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPath: (path: string) => void;
    initialPath?: string;
}

export function DirectoryBrowserModal({ isOpen, onClose, onSelectPath, initialPath }: DirectoryBrowserModalProps) {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [directories, setDirectories] = useState<ApiTypes.DirectoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Overall loading for initial/empty states
    const [loadingItemPath, setLoadingItemPath] = useState<string | null>(null); // For item-specific loading
    const [error, setError] = useState<string | null>(null);

    const fetchPathContents = useCallback(
        async (pathToList: string | undefined) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await browseDirectories(pathToList);
                setDirectories(result);
                // Determine the actual path that was listed by the API
                // If '.. (Up)' is present, its path is the listed directory.
                // Otherwise, if pathToList was provided, use that.
                // If neither, it implies API returned home, but we don't know its exact path from response alone.
                // This logic might need refinement if API behavior for root listing is ambiguous.
                const upEntry = result.find(d => d.name === ".. (Up)");
                const listedPath = upEntry ? upEntry.path.substring(0, upEntry.path.lastIndexOf("/")) : pathToList;
                setCurrentPath(listedPath || initialPath || "/");
            } catch (err: any) {
                console.error("Error browsing directories:", err);
                setError(err.message || "Failed to load directory contents.");
                setDirectories([]);
            } finally {
                setIsLoading(false);
                setLoadingItemPath(null); // Clear item-specific loader regardless of outcome
            }
        },
        [initialPath],
    );

    useEffect(() => {
        if (isOpen) {
            fetchPathContents(initialPath); // Load initial path when modal opens
        } else {
            // Reset state when modal is closed
            setCurrentPath("");
            setDirectories([]);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, initialPath, fetchPathContents]);

    const handleDirectoryClick = (dir: ApiTypes.DirectoryEntry) => {
        if (loadingItemPath === dir.path) return; // Prevent re-click if already loading this item
        setLoadingItemPath(dir.path);
        // No need to set setIsLoading(true) here as fetchPathContents handles its own general loading state
        // and we use loadingItemPath for specific item indication.
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
                    <DialogTitle>Browse for Folder</DialogTitle>
                    <DialogDescription>
                        Select a folder to use as a preset path. Current path:{" "}
                        <code className="font-mono bg-muted px-1 py-0.5 rounded text-sm break-all">
                            {currentPath || "Loading..."}
                        </code>
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="h-[300px] w-full min-w-0 rounded-md border p-3 my-4 overflow-y-scroll">
                    {isLoading && directories.length === 0 && !loadingItemPath ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2">Loading directories...</p>
                        </div>
                    ) : directories.length === 0 && !isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No sub-directories found.</p>
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
                    )}
                </div>

                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSelectCurrentPath} disabled={isLoading || !currentPath}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Select Current Path
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
