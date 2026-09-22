use std::sync::LazyLock;

use jsonschema::Validator;
use serde_json::{Value, json};

const OPENAPI_JSON: &str =
    include_str!("../../../packages/contracts/tsp-output/@typespec/openapi3/openapi.json");

fn validator_for(schema_name: &str) -> Validator {
    let mut schema: Value =
        serde_json::from_str(OPENAPI_JSON).expect("embedded openapi.json is not valid JSON");

    schema["$ref"] = json!(format!("#/components/schemas/{schema_name}"));

    return jsonschema::validator_for(&schema)
        .unwrap_or_else(|e| panic!("invalid schema for {schema_name}: {e}"));
}

pub static CREATE_POST_PAYLOAD: LazyLock<Validator> =
    LazyLock::new(|| return validator_for("CreatePostPayload"));

pub static CREATE_TAG_PAYLOAD: LazyLock<Validator> =
    LazyLock::new(|| return validator_for("CreateTagPayload"));

pub fn check(validator: &Validator, body: &Value) -> Result<(), String> {
    let errors: Vec<String> = validator
        .iter_errors(body)
        .map(|e| {
            let path = e.instance_path().to_string();
            if path.is_empty() {
                return e.to_string();
            }
            return format!("{}: {e}", path.trim_start_matches('/'));
        })
        .collect();

    if errors.is_empty() {
        return Ok(());
    }

    return Err(errors.join("; "));
}
