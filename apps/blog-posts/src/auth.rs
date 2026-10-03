use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode, header},
    middleware::Next,
    response::Response,
};
use serde::Deserialize;

#[derive(Clone)]
pub struct AuthClient {
    base: String,
    http: reqwest::Client,
}

impl AuthClient {
    pub fn new(base: String) -> Self {
        return Self {
            base,
            http: reqwest::Client::new(),
        };
    }
}

#[derive(Deserialize, Debug)]
struct SessionUser {
    role: Option<String>,
    #[serde(default)]
    banned: bool,
}

#[derive(Deserialize, Debug)]
struct Session {
    user: SessionUser,
}

fn is_admin(role: Option<String>) -> bool {
    return role
        .unwrap_or_default()
        .split(',')
        .any(|r| return r.trim() == "admin");
}

async fn get_session(auth: &AuthClient, incoming: &HeaderMap) -> Result<Session, StatusCode> {
    let mut headers = reqwest::header::HeaderMap::new();
    for name in [header::COOKIE, header::AUTHORIZATION] {
        if let Some(value) = incoming.get(&name) {
            headers.insert(name, value.clone());
        }
    }

    if headers.is_empty() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let session = auth
        .http
        .get(format!("{}/api/auth/get-session", auth.base))
        .headers(headers)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("get-session request failed: {e}");
            return StatusCode::BAD_GATEWAY;
        })?
        .json::<Option<Session>>()
        .await
        .map_err(|e| {
            tracing::error!("Could not decode get-session response: {e}");
            return StatusCode::BAD_GATEWAY;
        })?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if session.user.banned {
        return Err(StatusCode::FORBIDDEN);
    }

    return Ok(session);
}

#[allow(dead_code)]
pub async fn require_auth(
    State(auth): State<AuthClient>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    get_session(&auth, req.headers()).await?;
    return Ok(next.run(req).await);
}

pub async fn require_admin(
    State(auth): State<AuthClient>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let session = get_session(&auth, req.headers()).await?;
    if !is_admin(session.user.role) {
        return Err(StatusCode::FORBIDDEN);
    }

    return Ok(next.run(req).await);
}
