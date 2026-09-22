FROM rust:1 AS build
WORKDIR /src
COPY . .

RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=cargo-target,target=/src/apps/blog-posts/target \
    cargo build --release --locked --manifest-path apps/blog-posts/Cargo.toml \
 && cp apps/blog-posts/target/release/blog-posts /usr/local/bin/blog-posts

FROM debian:trixie-slim
# rustls-native-certs and sqlx both read the system trust store; trixie-slim ships none.
COPY --from=build /etc/ssl/certs/ /etc/ssl/certs/
COPY --from=build /usr/local/bin/blog-posts /usr/local/bin/blog-posts
USER nobody

CMD ["blog-posts"]
