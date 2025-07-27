import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../auth";
import { getPresets, addPreset, deletePreset, setActiveDirectory } from "../../services/api";
import * as ApiTypes from "@mtv/shared-api-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Trash2,
    Play,
    PlusCircle,
    Loader2,
    AlertCircle,
    FolderOpen,
    ListVideo,
    FolderSearch,
    Tv2 as MonitorIcon,
} from "lucide-react";
import { DirectoryBrowserModal } from "@/components/DirectoryBrowserModal";
import { useTranslation } from "react-i18next";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/dashboard")({
    component: DashboardComponent,
});

function DashboardComponent() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [presets, setPresets] = useState<ApiTypes.PresetItem[]>([]);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetPath, setNewPresetPath] = useState("");
    const [isBrowserModalOpen, setIsBrowserModalOpen] = useState(false);
    const [activeDirectoryPath, setActiveDirectoryPath] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loadingPresets, setLoadingPresets] = useState<boolean>(true);
    const { t } = useTranslation();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/login", replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchInitialPresets = async () => {
                try {
                    setLoadingPresets(true);
                    setError(null);
                    const presetItems = await getPresets();
                    setPresets(presetItems);
                } catch (err) {
                    console.error("Failed to load presets:", err);
                    setError(err instanceof Error ? err.message : t("dashboard.fetch_error"));
                } finally {
                    setLoadingPresets(false);
                }
            };
            fetchInitialPresets();
        }
    }, [isAuthenticated, t]);

    const handleAddPreset = async () => {
        if (!newPresetPath.trim()) {
            setError(t("dashboard.preset_path_empty"));
            return;
        }
        try {
            setError(null);
            const result = await addPreset({
                path: newPresetPath.trim(),
                name: newPresetName.trim() || undefined,
                order: "shuffle",
            });
            if (result && Array.isArray(result.presets)) {
                setPresets(result.presets);
            } else {
                console.warn("handleAddPreset: API response did not contain a valid presets array.", result);
                setError(t("dashboard.preset_update_failed"));
            }
            setNewPresetName("");
            setNewPresetPath("");
        } catch (err) {
            console.error("Failed to add preset:", err);
            setError(err instanceof Error ? err.message : t("dashboard.add_error"));
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
                setError(t("dashboard.preset_update_failed"));
            }
        } catch (err) {
            console.error("Failed to delete preset:", err);
            setError(err instanceof Error ? err.message : t("dashboard.delete_error"));
        }
    };

    const handleSetActiveDirectory = async (path: string) => {
        if (!path.trim()) {
            setError(t("dashboard.active_dir_empty"));
            return;
        }
        try {
            setError(null);
            const result = await setActiveDirectory(path);
            console.log("Set active directory result:", result.message, "Videos found:", result.videoCount);
        } catch (err) {
            console.error("Failed to set active directory:", err);
            setError(err instanceof Error ? err.message : t("dashboard.set_active_dir_error"));
        }
    };

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("dashboard.error")}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ListVideo className="mr-2 h-5 w-5 text-primary" />
                        {t("dashboard.title")}
                    </CardTitle>
                    <CardDescription>{t("dashboard.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingPresets ? (
                        <div className="flex items-center justify-center p-6">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                            <p className="text-muted-foreground">{t("dashboard.loading")}</p>
                        </div>
                    ) : presets.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">{t("dashboard.empty")}</p>
                    ) : (
                        <ul className="space-y-3">
                            {presets.map(preset => (
                                <li
                                    key={preset.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <div className="mb-2 sm:mb-0 flex-grow min-w-0">
                                        <p className="font-medium text-foreground truncate" title={preset.name}>
                                            {preset.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate" title={preset.path}>
                                            {preset.path}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2 self-end sm:self-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title={t("dashboard.play")}
                                            onClick={() => {
                                                setActiveDirectoryPath(preset.path);
                                                handleSetActiveDirectory(preset.path);
                                            }}
                                        >
                                            <Play />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title={t("dashboard.delete")}
                                            onClick={() => setDeleteConfirmId(preset.id)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <Input
                            type="text"
                            value={newPresetName}
                            onChange={e => setNewPresetName(e.target.value)}
                            placeholder={t("dashboard.input_name_placeholder")}
                            className="sm:col-span-2"
                        />
                        <div className="flex space-x-2 items-center sm:col-span-2">
                            <Input
                                type="text"
                                value={newPresetPath}
                                onChange={e => setNewPresetPath(e.target.value)}
                                placeholder={t("dashboard.input_path_placeholder")}
                                className="flex-grow"
                            />
                            <Button
                                variant="outline"
                                onClick={() => setIsBrowserModalOpen(true)}
                                title="Browse for folder"
                            >
                                <FolderSearch className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={handleAddPreset} className="w-full sm:col-span-2">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t("dashboard.add")}
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FolderOpen className="mr-2 h-5 w-5 text-primary" />
                        {t("dashboard.set_active_dir")}
                    </CardTitle>
                    <CardDescription>{t("dashboard.set_active_dir_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full space-x-2 items-start">
                        <Input
                            type="text"
                            value={activeDirectoryPath}
                            onChange={e => setActiveDirectoryPath(e.target.value)}
                            placeholder={t("dashboard.input_placeholder")}
                            className="flex-grow"
                        />
                        <Button
                            onClick={() => handleSetActiveDirectory(activeDirectoryPath)}
                            disabled={!activeDirectoryPath.trim()}
                        >
                            {t("dashboard.set_and_play")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MonitorIcon className="mr-2 h-5 w-5 text-primary" />
                        {t("monitor.title")}
                    </CardTitle>
                    <CardDescription>{t("monitor.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <a href="/app/monitor">
                        <Button className="w-full">
                            <MonitorIcon className="mr-2 h-4 w-4" />
                            {t("dashboard.open_monitor")}
                        </Button>
                    </a>
                </CardContent>
            </Card>

            <DirectoryBrowserModal
                isOpen={isBrowserModalOpen}
                onClose={() => setIsBrowserModalOpen(false)}
                onSelectPath={selectedPath => {
                    setNewPresetPath(selectedPath);
                    setIsBrowserModalOpen(false);
                }}
            />

            <AlertDialog
                open={!!deleteConfirmId}
                onOpenChange={open => {
                    if (!open) setDeleteConfirmId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("dashboard.delete_confirm_title")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("dashboard.delete_confirm_desc")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("dashboard.delete_confirm_cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={async () => {
                                if (deleteConfirmId) {
                                    await handleDeletePreset(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }
                            }}
                        >
                            {t("dashboard.delete_confirm_ok")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
