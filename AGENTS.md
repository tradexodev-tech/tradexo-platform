# Tradexo AI Development Guide

## Project Overview

Tradexo is an AI-powered global B2B platform that connects:

- Exporters
- Importers
- Manufacturers
- Suppliers
- Service Providers

The platform uses AI to match businesses, generate trade opportunities, automate lead generation, and simplify international trade.

---

## Tech Stack

Frontend

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS

Backend

- Supabase
- PostgreSQL
- Authentication
- Row Level Security (RLS)

Deployment

- Vercel

---

## Current Project Status

Completed

- User Registration
- User Login
- Authentication
- Complete Profile
- Profile saved in Supabase
- Role Selection UI

Upcoming

- Dashboard
- Company Profile
- Products
- Marketplace
- AI Matchmaking
- AI Assistant
- Subscription
- Admin Panel

---

## Folder Rules

app/
Pages and routes

components/
Reusable UI components

lib/
Supabase and business logic

types/
TypeScript types

public/
Assets

---

## Coding Standards

- Always use TypeScript.
- Prefer functional React components.
- Keep components reusable.
- Never duplicate logic.
- Place database functions inside lib/.
- Use async/await.
- Keep code production-ready.
- Preserve existing functionality unless explicitly requested.

---

## UI Guidelines

- Clean SaaS design
- Mobile responsive
- Tailwind CSS
- Consistent spacing
- Accessible components

---

## Database

Supabase is the single source of truth.

Current table:

profiles

Never break existing schema without approval.

---

## Development Workflow

Before writing code:

1. Read the existing project.
2. Understand architecture.
3. Explain the implementation plan.
4. Wait for approval.
5. Then modify code.

---

## Current Sprint

Sprint 4

Objective:

Build the first production-ready Tradexo Dashboard using the existing authentication and onboarding flow.

Never modify authentication without explicit approval.