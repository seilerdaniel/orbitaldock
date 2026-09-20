import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases con clsx + tailwind-merge (los estilos tailwind no se pisan entre sí). */
export const cn = (...inputs) => twMerge(clsx(inputs));
