use blog_contracts::models::Theme;
use comrak::options::Plugins;
use comrak::plugins::syntect::{SyntectAdapter, SyntectAdapterBuilder};
use comrak::{Options, markdown_to_html_with_plugins};
use std::sync::OnceLock;

fn adapter(theme: Theme) -> &'static SyntectAdapter {
    static ADAPTERS: [OnceLock<SyntectAdapter>; 4] = [const { OnceLock::new() }; 4];

    let slot = match theme {
        Theme::Latte => 0,
        Theme::Frappe => 1,
        Theme::Macchiato => 2,
        Theme::Mocha => 3,
    };

    return ADAPTERS[slot].get_or_init(|| {
        return SyntectAdapterBuilder::new()
            .syntax_set(two_face::syntax::extra_newlines())
            .theme(&format!("Catppuccin {theme}"))
            .build();
    });
}

fn options() -> Options<'static> {
    let mut options = Options::default();

    options.extension.table = true;
    options.extension.strikethrough = true;
    options.extension.autolink = true;
    options.extension.tasklist = true;
    options.extension.footnotes = true;
    options.extension.superscript = true;
    options.extension.alerts = true;
    options.extension.header_id_prefix = Some(String::new());
    options.parse.smart = true;
    options.render.github_pre_lang = true;
    options.render.compact_html = true;

    return options;
}

pub fn to_html(md: &str, theme: Theme) -> String {
    let mut plugins = Plugins::default();
    plugins.render.codefence_syntax_highlighter = Some(adapter(theme));
    return markdown_to_html_with_plugins(md, &options(), &plugins);
}
