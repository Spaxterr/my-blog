FROM rust:1 AS build
WORKDIR /src
COPY . .

RUN cargo build --release --manifest-path apps/blog-posts/Cargo.toml

FROM debian:trixie-slim
COPY --from=build /src/apps/blog-posts/target/release/blog-posts /usr/local/bin/blog-posts

CMD ["blog-posts"]
