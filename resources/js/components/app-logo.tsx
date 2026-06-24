export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-sm shadow-indigo-500/25 text-lg shrink-0">
                🌍
            </div>
            <div className="ml-2.5 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-black text-slate-800 dark:text-neutral-200 text-base tracking-tight">
                    BitByWorld
                </span>
            </div>
        </>
    );
}
