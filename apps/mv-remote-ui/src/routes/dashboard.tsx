import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { getPresets, addPreset, deletePreset, setActiveDirectory } from "../services/api";
import * as ApiTypes from "../../../mv-player/src/shared-api-types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogOut, KeyRound, Trash2, Play, PlusCircle, Loader2, AlertCircle, FolderOpen, ListVideo } from "lucide-react";

// Helper to derive a name from a path
const pathToName = (path: string): string => {
    if (!path) return "Unnamed Preset";
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    return normalizedPath.split("/").pop() || normalizedPath;
};

export const Route = createFileRoute("/dashboard")({
    beforeLoad: () => {
        // Component-level check will handle redirection if auth context isn't ready/available here.
    },
    component: DashboardComponent,
});

function DashboardComponent() {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.logout();
    };

    const [presets, setPresets] = useState<ApiTypes.PresetItem[]>([]);
    const [newPresetPath, setNewPresetPath] = useState("");
    const [activeDirectoryPath, setActiveDirectoryPath] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loadingPresets, setLoadingPresets] = useState<boolean>(true);

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            navigate({ to: "/login", replace: true });
        }
    }, [auth.isLoading, auth.isAuthenticated, navigate]);

    useEffect(() => {
        if (auth.isAuthenticated) {
            // Only fetch if authenticated
            const fetchInitialPresets = async () => {
                try {
                    setLoadingPresets(true);
                    setError(null);
                    const presetItems = await getPresets();
                    setPresets(presetItems);
                } catch (err) {
                    console.error("Failed to load presets:", err);
                    setError(err instanceof Error ? err.message : "An unknown error occurred while fetching presets.");
                } finally {
                    setLoadingPresets(false);
                }
            };
            fetchInitialPresets();
        }
    }, [auth.isAuthenticated]); // Depend on auth.isAuthenticated

    const handleAddPreset = async () => {
        if (!newPresetPath.trim()) {
            setError("Preset path cannot be empty.");
            return;
        }
        try {
            setError(null);
            const result = await addPreset({ mainPath: newPresetPath.trim(), order: 'shuffle', name: pathToName(newPresetPath.trim()) });
            if (result && Array.isArray(result.presets)) {
                setPresets(result.presets);
            } else {
                console.warn("handleAddPreset: API response did not contain a valid presets array.", result);
                setError("Preset action completed, but failed to update list from response.");
                // Optionally, re-fetch presets to ensure consistency
                // await fetchInitialPresets(); 
            }
            setNewPresetPath("");
        } catch (err) {
            console.error("Failed to add preset:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while adding preset.");
        }
    };

    const handleDeletePreset = async (idToDelete: string) => {
        try {
            setError(null);
            const result = await deletePreset(idToDelete);
            if (result && Array.isArray(result.presets)) {
                setPresets(result.presets);
            } else {
                console.warn("handleDeletePreset: API response did not contain a valid presets array.", result);
                setError("Preset action completed, but failed to update list from response.");
                // Optionally, re-fetch presets to ensure consistency
                // await fetchInitialPresets();
            }
        } catch (err) {
            console.error("Failed to delete preset:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while deleting preset.");
        }
    };

    const handleSetActiveDirectory = async (path: string) => {
        if (!path.trim()) {
            setError("Active directory path cannot be empty.");
            return;
        }
        try {
            setError(null);
            // setActiveDirectoryPath(path); // Optimistic update done by user typing or clicking preset
            const result = await setActiveDirectory(path);
            console.log("Set active directory result:", result.message, "Videos found:", result.videoCount);
            // Optionally show a success toast/alert here
        } catch (err) {
            console.error("Failed to set active directory:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while setting active directory.");
        }
    };

    if (auth.isLoading || (!auth.isAuthenticated && !auth.isLoading)) {
        // Show loading if auth is loading OR if not authenticated and not loading (implies redirect is imminent)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
                <Loader2 className="mr-2 h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground mt-2">Loading...</p>
            </div>
        );
    }
    // useEffect handles redirection if !auth.isAuthenticated, so this is an additional safeguard.
    if (!auth.isAuthenticated) return null;

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-background">
            <div className="w-full max-w-4xl">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">MV Player Remote</h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {auth.username && (
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                Welcome, {auth.username}!
                            </span>
                        )}
                        <Link to="/settings/change-password">
                            <Button variant="outline" size="sm">
                                <KeyRound /> Change Password
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleLogout} disabled={auth.isLoading}>
                            <LogOut /> {auth.isLoading ? "Logging out..." : "Logout"}
                        </Button>
                    </div>
                </header>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ListVideo className="mr-2 h-5 w-5 text-primary" />
                            Preset Folders
                        </CardTitle>
                        <CardDescription>
                            Manage your saved preset folders. Click play to set as active directory.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingPresets ? (
                            <div className="flex items-center justify-center p-6">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                                <p className="text-muted-foreground">Loading presets...</p>
                            </div>
                        ) : presets.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No presets saved yet. Add one below.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {presets.map((preset) => (
                                    <li
                                        key={preset.id}
                                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-medium text-foreground">{preset.name || pathToName(preset.mainPath)}</p>
                                            <p className="text-xs text-muted-foreground">{preset.mainPath}</p>
                                        </div>
                                        <div className="flex space-x-2 self-end sm:self-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setActiveDirectoryPath(preset.mainPath);
                                                    handleSetActiveDirectory(preset.mainPath);
                                                }}
                                            >
                                                <Play /> Play
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeletePreset(preset.id)}
                                            >
                                                <Trash2 /> Delete
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <div className="flex w-full space-x-2 items-start">
                            <Input
                                type="text"
                                value={newPresetPath}
                                onChange={e => setNewPresetPath(e.target.value)}
                                placeholder="Enter absolute path for new preset"
                                className="flex-grow"
                            />
                            <Button onClick={handleAddPreset}>
                                <PlusCircle />
                                Add Preset
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FolderOpen className="mr-2 h-5 w-5 text-primary" />
                            Set Active Directory
                        </CardTitle>
                        <CardDescription>Manually enter a path or select a preset to start playback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full space-x-2 items-start">
                            <Input
                                type="text"
                                value={activeDirectoryPath}
                                onChange={e => setActiveDirectoryPath(e.target.value)}
                                placeholder="Enter absolute path or click 'Play' on a preset"
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => handleSetActiveDirectory(activeDirectoryPath)}
                                disabled={!activeDirectoryPath.trim()}
                            >
                                Set & Play
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
