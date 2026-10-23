# Store Assistant Admin · Demo

An interactive demo of a two-surface product: **the store-side assistant** (Feishu IM on mobile) and **its admin console** (browser).

👉 **Live demo:** see the Pages link on this repo.
👉 **简介 (中文):** [简介.md](简介.md)

## What you can do in 3 minutes

1. **Console → Rules**: publish "Expiry T-2 must log an action" → the phone on the right immediately shows the rule taking effect (it was "pilot not covering this store" before).
2. **Phone**: submit an order with a changed quantity → the console's adoption rate and receipt queue update.
3. **Phone**: mark a variance on receiving → after +1h the warehouse confirms and issues a replenishment note (closed loop).
4. **Console → AI Copilot** (left panel): ask "which stores have unhandled expiry today" → structured result table; ask "expand the expiry rule to all stores" → a **draft card** with confirm/publish (never auto-executes).
5. **Phone → scenario panel** (right, outside the phone): 25 one-click scenarios covering order query, logistics, FAQ hit/miss, transfer-to-human, complaints, tickets, plus supply-chain flows.

## Key design decisions

- **Two surfaces, one payer.** The assistant's user is the store manager; the console's user is brand supply chain — and the payer is supply chain. Every screen is built from the payer's point of view.
- **Five peer responsibilities** in the console: Outreach / Insights / FAQ Flywheel / Agent Config / IAM.
- **Arbitration principle:** every new control action must offset one store-side action, otherwise the assistant stops being an assistant.
- **Boundary test:** "If you switch this platform off, does the number still exist?" If yes → don't build it (it belongs to the customer's systems or BI). Only action-metadata belongs here.
- **FAQ flywheel is the only module that proves "it gets better with use"** — its output must be a generated draft, not a report.

## Internationalization

Full zh/en toggle (top-right avatar menu). Covers menus, tables, statuses, phone cards and AI answers. Some long-form copy (metric definitions, prompt bodies) is still Chinese — in progress.

## Stack

React 18 + Ant Design 5, Vite, pure front-end mock data, single-page app.
A single event stream is the source of truth — all metrics are derived, not hard-coded.

## Disclaimer

Fictional brand and data ("Muye Tea", 21 stores, 121 events). For product-form demonstration only.
