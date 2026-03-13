# Architecture

## Overview

siggy is a terminal Signal client that wraps
[signal-cli](https://github.com/AsamK/signal-cli) via JSON-RPC over stdin/stdout.
It is built on a Tokio async runtime with Ratatui for rendering.

```mermaid
graph TB
    subgraph main["Main Thread"]
        KB["Keyboard Input<br/><i>crossterm poll 50ms</i>"]
        APP["App State<br/><i>app.rs</i>"]
        UI["Ratatui Renderer<br/><i>ui.rs</i>"]
        DB["SQLite<br/><i>db.rs · WAL mode</i>"]
    end

    subgraph tokio["Tokio Tasks"]
        SR["stdout reader<br/><i>parse JSON-RPC</i>"]
        SW["stdin writer<br/><i>send JSON-RPC</i>"]
    end

    CLI["signal-cli<br/><i>child process</i>"]

    KB -- "InputAction" --> APP
    APP -- "&App" --> UI
    APP -- "persist" --> DB
    DB -- "load" --> APP
    APP -- "JsonRpcRequest<br/>(mpsc)" --> SW
    SW -- "stdin" --> CLI
    CLI -- "stdout" --> SR
    SR -- "SignalEvent<br/>(mpsc)" --> APP
```

## Async runtime

The application uses a **multi-threaded Tokio runtime** (via `#[tokio::main]`).
The main thread runs the TUI event loop. signal-cli communication happens in
spawned Tokio tasks that communicate back to the main thread via
`tokio::sync::mpsc` channels.

## Event loop

The main loop in `main.rs` runs on a 50ms tick:

```mermaid
flowchart LR
    A["Poll keyboard<br/><i>50ms timeout</i>"] --> B["Drain signal<br/>events"]
    B --> C["Update state"]
    C --> D{"Needs<br/>redraw?"}
    D -- yes --> E["Render frame<br/><i>ui::draw()</i>"]
    D -- no --> F["Maintenance<br/><i>typing, expiry,<br/>receipts</i>"]
    E --> F
    F --> A
```

This keeps the UI responsive while processing backend events as they arrive.

## Startup sequence

```mermaid
sequenceDiagram
    participant M as main.rs
    participant C as Config
    participant S as Setup Wizard
    participant L as Link Flow
    participant DB as SQLite
    participant SC as SignalClient

    M->>C: Load TOML config
    alt account field empty
        M->>S: Run setup wizard
        S->>L: Device linking (QR code)
        L-->>M: Account registered
    end
    M->>DB: Open database
    M->>SC: Spawn signal-cli
    SC-->>M: Connected
    M->>SC: Sync contacts, groups, identities
    M->>M: Enter event loop
```

## Key dependencies

| Crate | Purpose |
|---|---|
| `ratatui` 0.29 | Terminal UI framework |
| `crossterm` 0.28 | Cross-platform terminal I/O |
| `tokio` 1.x | Async runtime |
| `serde` / `serde_json` | JSON serialization for signal-cli RPC |
| `rusqlite` 0.32 | SQLite database (bundled) |
| `chrono` 0.4 | Timestamp handling |
| `qrcode` 0.14 | QR code generation for device linking |
| `image` 0.25 | Image decoding for inline previews |
| `arboard` 3.x | Clipboard access for /paste |
| `anyhow` 1.x | Error handling |
| `toml` 0.8 | Config file parsing |
| `dirs` 6.x | Platform-specific directory paths |
| `uuid` 1.x | RPC request ID generation |
