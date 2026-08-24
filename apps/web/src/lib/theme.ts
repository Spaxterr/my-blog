import { createContextId, type Signal } from '@builder.io/qwik';

export const THEMES = {
    latte: {
        name: 'Latte',
    },
    frappe: {
        name: 'Frappé',
    },
    macchiato: {
        name: 'Macchiato',
    },
    mocha: {
        name: 'Mocha',
    },
};

export type Theme = keyof typeof THEMES;

export const THEME_NAMES = Object.keys(THEMES) as Theme[];
export const DEFAULT_THEME: Theme = 'frappe';

export const ThemeContext = createContextId<Signal<Theme>>('global.theme');

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && value in THEMES;
}
