import { cn } from "@/lib/utils";

interface DrawerProps {
    children: React.ReactNode;
    isOpen: boolean;
    isPinned: boolean;
    _onTogglePinned: () => void;
    onClose: () => void;
    className?: string;
}

export function Drawer({ children, isOpen, isPinned, _onTogglePinned, onClose, className }: DrawerProps) {
    return (
        <dialog
            className={cn(
                "fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ease-in-out",
                "w-72 md:w-72",
                isOpen ? "translate-x-0" : "translate-x-full",
                isPinned && isOpen ? "shadow-lg" : "",
                className,
            )}
            onKeyDown={e => {
                if (e.key === "Escape") {
                    onClose();
                }
            }}
            aria-modal="true"
            aria-hidden={!isOpen}
            open={isOpen}
        >
            <div className="h-full overflow-y-auto bg-background">{children}</div>
        </dialog>
    );
}

export function DrawerOverlay({
    isOpen,
    isPinned,
    onClick,
}: { isOpen: boolean; isPinned: boolean; onClick: () => void }) {
    if (isPinned) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            onClick={onClick}
            onKeyDown={e => {
                if (e.key === "Escape") {
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close drawer overlay"
        />
    );
}
