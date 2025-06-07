import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "bg-background rounded-2xl ring ring-muted shadow-2xl p-4 gap-2.5 flex items-top justify-center",
                    content: "flex flex-col items-stretch gap-1",
                    title: "text-base font-semibold",
                    description: "text-sm",
                    icon: "[&_svg]:block [&_svg]:size-6",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
