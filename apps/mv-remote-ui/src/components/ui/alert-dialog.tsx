import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { dialogContent, dialogFooter, dialogHeader, dialogOverlay } from "@/components/ui/style/dialog.ts";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
    return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
    return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
    return (
        <AlertDialogPrimitive.Overlay
            data-slot="alert-dialog-overlay"
            className={cn(dialogOverlay, className)}
            {...props}
        />
    );
}

function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogPrimitive.Content
                data-slot="alert-dialog-content"
                className={cn(dialogContent, className)}
                {...props}
            />
        </AlertDialogPortal>
    );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="alert-dialog-header" className={cn(dialogHeader, className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="alert-dialog-footer" className={cn(dialogFooter, className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className={cn("text-lg leading-none font-semibold", className)}
            {...props}
        />
    );
}

function AlertDialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    );
}

function AlertDialogAction({
    variant,
    size,
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & VariantProps<typeof buttonVariants>) {
    return <AlertDialogPrimitive.Action className={buttonVariants({ variant, size, className })} {...props} />;
}

function AlertDialogCancel({
    variant,
    size,
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & VariantProps<typeof buttonVariants>) {
    return (
        <AlertDialogPrimitive.Cancel
            className={buttonVariants({ variant: variant || "outline", size, className })}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
