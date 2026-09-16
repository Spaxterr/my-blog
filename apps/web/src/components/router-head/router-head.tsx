import { $, component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
    const head = useDocumentHead();
    const loc = useLocation();

    const has = $((prop: string) => head.meta.some((m) => m.property === prop || m.name === prop));
    const description = head.meta.find((m) => m.name === 'description')?.content;
    const canonical = loc.url.origin + loc.url.pathname;

    return (
        <>
            <title>{head.title}</title>

            <link rel="canonical" href={canonical} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

            {loc.url.search && <meta name="robots" content="noindex,follow" />}
            {!has('og:type') && <meta property="og:type" content="website" />}
            <meta property="og:site_name" content="Kevin" />
            <meta property="og:url" content={canonical} />
            {!has('og:title') && <meta property="og:title" content={head.title} />}
            {description && !has('og:description') && (
                <meta property="og:description" content={description} />
            )}
            <meta name="twitter:card" content="summary_large_image" />

            {head.meta.map((m) => (
                <meta key={m.key} {...m} />
            ))}

            {head.links.map((l) => (
                <link key={l.key} {...l} />
            ))}

            {head.styles.map((s) => (
                <style
                    key={s.key}
                    {...s.props}
                    {...(s.props?.dangerouslySetInnerHTML ? {} : { dangerouslySetInnerHTML: s.style })}
                />
            ))}

            {head.scripts.map((s) => (
                <script
                    key={s.key}
                    {...s.props}
                    {...(s.props?.dangerouslySetInnerHTML ? {} : { dangerouslySetInnerHTML: s.script })}
                />
            ))}
        </>
    );
});
