import { component$, isDev } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';
import { authBaseUrl } from './lib/auth';

import './global.css';

export default component$(() => {
    return (
        <QwikCityProvider>
            <head>
                <meta charset="utf-8" />
                {/* How the browser learns the auth origin — see DEPLOYMENT.md */}
                <meta name="auth-host" content={authBaseUrl()} />
                {!isDev && <link rel="manifest" href={`${import.meta.env.BASE_URL}manifest.json`} />}
                <RouterHead />
            </head>
            <body lang="en" class="bg-ctp-base text-ctp-text">
                <RouterOutlet />
            </body>
        </QwikCityProvider>
    );
});
