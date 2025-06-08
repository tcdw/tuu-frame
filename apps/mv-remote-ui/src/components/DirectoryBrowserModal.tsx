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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Folder, ArrowUpCircle, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface DirectoryBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPath: (path: string) => void;
    initialPath?: string;
}

export function DirectoryBrowserModal({
    isOpen,
    onClose,
    onSelectPath,
    initialPath,
}: DirectoryBrowserModalProps) {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [directories, setDirectories] = useState<ApiTypes.DirectoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPathContents = useCallback(async (pathToList: string | undefined) => {
        setIsLoading(true);
        setError(null);
        try {
            // If pathToList is undefined, the API defaults to home, which is good for initial load.
            const result = await browseDirectories(pathToList);
            setDirectories(result);
            if (pathToList) setCurrentPath(pathToList); // Only update currentPath if one was actually listed
            else {
                 // If no path was given, the API returns home. We need to find out what that was.
                 // For now, assume the first '..' entry if present, or we need another way to get the initial path.
                 // This is a bit of a hack. The API should ideally return the path it listed.
                 // For now, if initialPath is set, use it.
                 setCurrentPath(initialPath || result.find(d => d.name === ".. (Up)")?.path || "/");
            }
        } catch (err: any) {
            console.error("Error browsing directories:", err);
            setError(err.message || "Failed to load directory contents.");
            setDirectories([]);
        } finally {
            setIsLoading(false);
        }
    }, [initialPath]);

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

                <ScrollArea className="h-[300px] w-full rounded-md border p-4 my-4">
                    {isLoading && !directories.length ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2">Loading directories...</p>
                        </div>
                    ) : directories.length === 0 && !isLoading ? (
                        <div className="flex items-center justify-center h-full">
                             <p className="text-muted-foreground">No sub-directories found.</p>
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {directories.map((dir) => (
                                <li key={dir.path}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-left h-auto py-2 px-3"
                                        onClick={() => handleDirectoryClick(dir)}
                                        title={dir.path}
                                    >
                                        {dir.name === ".. (Up)" ? (
                                            <ArrowUpCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Folder className="mr-2 h-5 w-5 text-blue-500" />
                                        )}
                                        <span className="truncate">{dir.name}</span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ScrollArea>

                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        type="button" 
                        onClick={handleSelectCurrentPath} 
                        disabled={isLoading || !currentPath}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Select Current Path
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
