import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../auth";
import { API_BASE_URL } from "../../utils/request";
import { togglePlayPauseRemote, nextTrackRemote, getPlayerStatus } from "../../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tv2 as MonitorIcon, ArrowLeft, Play, Pause, SkipForward } from "lucide-react";
import { useTranslation } from "react-i18next";

const JWT_STORAGE_KEY = "mv_remote_jwt_token";
const SNAPSHOT_INTERVAL_MS = 100; // Refresh snapshot every 1 second

export const Route = createFileRoute("/app/monitor")({
    component: MonitorComponent,
});

function MonitorComponent() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [monitorStreamUrl, setMonitorStreamUrl] = useState<string | null>(null);
    const [isPlayingRemote, setIsPlayingRemote] = useState<boolean>(false);
    const { t } = useTranslation();

    const fetchSnapshot = () => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            setMonitorStreamUrl(`${API_BASE_URL}/monitor/snapshot.jpg?token=${token}&rand=${Date.now()}`);
        } else {
            setMonitorStreamUrl(null);
            console.warn("Monitor: JWT token not found for snapshot.");
        }
    };

    const fetchPlayerStatus = async () => {
        try {
            const status = await getPlayerStatus();
            setIsPlayingRemote(status.isPlaying);
            console.log("Player status fetched:", status.isPlaying ? "Playing" : "Paused");
        } catch (error) {
            console.error("Failed to fetch player status:", error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/login", replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            setMonitorStreamUrl(null);
            setIsPlayingRemote(false);
            return;
        }
        fetchSnapshot();
        fetchPlayerStatus();
        const snapshotIntervalId = setInterval(fetchSnapshot, SNAPSHOT_INTERVAL_MS);
        return () => {
            clearInterval(snapshotIntervalId);
            console.log("Monitor component unmounted or auth changed, cleaning up snapshot interval.");
        };
    }, [isAuthenticated]);

    const handleTogglePlayPause = async () => {
        if (!isAuthenticated) return;
        try {
            await togglePlayPauseRemote();
            await fetchPlayerStatus();
        } catch (error) {
            console.error("Failed to send toggle play/pause command or fetch status:", error);
        }
    };

    const handleNextTrack = async () => {
        try {
            await nextTrackRemote();
        } catch (error) {
            console.error("Failed to send next track command:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <Button variant="outline" onClick={() => navigate({ to: "/app/dashboard" })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("monitor.back")}
                </Button>
            </div>
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center">
                            <MonitorIcon className="mr-2 h-5 w-5 text-primary" />
                            {t("monitor.title")}
                        </CardTitle>
                        <CardDescription>{t("monitor.description")}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleTogglePlayPause}
                            title={isPlayingRemote ? t("monitor.pause") : t("monitor.play")}
                            aria-label={isPlayingRemote ? t("monitor.pause") : t("monitor.play")}
                        >
                            {isPlayingRemote ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextTrack} title={t("monitor.next")}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {monitorStreamUrl ? (
                        <img
                            src={monitorStreamUrl}
                            alt={t("monitor.title")}
                            style={{
                                display: "block",
                                width: "100%",
                                aspectRatio: "16 / 9",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                backgroundColor: "hsl(var(--muted))",
                                objectFit: "contain",
                            }}
                            onError={e => {
                                console.error("Error loading MJPEG stream:", e);
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64 border border-dashed rounded-md bg-muted/40">
                            <p className="text-sm text-muted-foreground">
                                {t("monitor.empty", "The player monitor is active.")}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
