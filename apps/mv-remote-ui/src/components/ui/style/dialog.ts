export const dialogOverlay = `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
     fixed inset-0 z-50 bg-black/50 duration-300`;
export const dialogContent = `bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
     fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl p-6 shadow-xl duration-300 sm:max-w-lg dark:ring dark:ring-muted`;
export const dialogClose =
    "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-5 right-5 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5";
export const dialogHeader = "flex flex-col gap-3 text-center sm:text-left";
export const dialogFooter = "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end";
