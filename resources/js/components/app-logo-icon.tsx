import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div 
            {...props} 
            className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-md shadow-indigo-500/20 text-xl font-bold select-none ${props.className || 'size-9'}`}
        >
            🌍
        </div>
    );
}
