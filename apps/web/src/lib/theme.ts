import { createContextId, type Signal } from '@builder.io/qwik';
import type { Cookie } from '@builder.io/qwik-city';
import type { Theme as ApiTheme } from '@shared/contracts';

export const THEMES = {
    latte: {
        name: 'Latte',
        color: '#eff1f5',
    },
    frappe: {
        name: 'Frappé',
        color: '#303446',
    },
    macchiato: {
        name: 'Macchiato',
        color: '#24273a',
    },
    mocha: {
        name: 'Mocha',
        color: '#1e1e2e',
    },
};

export type Theme = keyof typeof THEMES;

export const THEME_NAMES = Object.keys(THEMES) as Theme[];

export const DEFAULT_THEME: Theme = 'frappe';

export const ThemeContext = createContextId<Signal<Theme>>('global.theme');

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && value in THEMES;
}

export function themeFromCookie(cookie: Cookie): Theme {
    const value = cookie.get('theme')?.value;
    return isTheme(value) ? value : DEFAULT_THEME;
}

export const API_THEME: Record<Theme, ApiTheme> = {
    latte: 'Latte',
    frappe: 'Frappe',
    macchiato: 'Macchiato',
    mocha: 'Mocha',
};
