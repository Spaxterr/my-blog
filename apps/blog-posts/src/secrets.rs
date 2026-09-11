pub fn read_secret(key: &str) -> Option<String> {
    return std::fs::read_to_string(format!("/run/secrets/{}", key.to_lowercase()))
        .map(|s| return s.trim().to_string())
        .ok()
        .or_else(|| return std::env::var(key).ok());
}
