use axum::response::Html;

// ponytail: spec baked in at compile time, so it can never drift from the crate
// it documents and there is no file to ship alongside the binary.
const OPENAPI_YAML: &str =
    include_str!("../../../../packages/contracts/tsp-output/@typespec/openapi3/openapi.yaml");

pub async fn docs_handler() -> Html<&'static str> {
    return Html(include_str!("docs.html"));
}

pub async fn openapi_handler() -> ([(&'static str, &'static str); 1], &'static str) {
    return ([("content-type", "text/yaml")], OPENAPI_YAML);
}
