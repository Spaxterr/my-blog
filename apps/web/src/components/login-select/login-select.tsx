import { $, type Component, component$, type QRL } from '@builder.io/qwik';
import { Dropdown } from '@qwik-ui/headless';
import { authClient } from '~/lib/auth';
import GithubIcon from '~icons/cib/github';
import SharpDiscordIcon from '~icons/ic/sharp-discord';

interface Provider {
    provider: string;
    providerName: string;
    icon: QRL<Component>;
}

const providers: Provider[] = [
    {
        provider: 'discord',
        icon: $(SharpDiscordIcon),
        providerName: 'Discord',
    },
    {
        provider: 'github',
        icon: $(GithubIcon),
        providerName: 'GitHub',
    },
];

export const LoginSelect = component$(() => {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger class="hover:cursor-pointer hover:bg-ctp-surface0 p-2">Log In</Dropdown.Trigger>
            <Dropdown.Popover>
                <div class="flex flex-col bg-ctp-crust gap-y-1 text-ctp-text">
                    {providers.map((p) => {
                        const Icon = p.icon.resolved;
                        if (!Icon) return <div></div>;

                        return (
                            <button
                                type="button"
                                key={p.provider}
                                class="flex flex-row items-center gap-x-2 select-none hover:bg-ctp-surface0 px-2 py-1 hover:cursor-pointer"
                                onClick$={async () => {
                                    await authClient.signIn.social({
                                        provider: p.provider,
                                        loginHint: `Sign in using your ${p.provider} account`,
                                        callbackURL: window.location.href,
                                    });
                                }}
                            >
                                <Icon /> Log in with {p.providerName}
                            </button>
                        );
                    })}
                </div>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
});
