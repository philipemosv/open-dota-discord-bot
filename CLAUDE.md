# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discord bot for Dota 2 statistics using the OpenDota API. Users link their Steam accounts via Discord slash commands to view hero statistics, win/loss records, and match history.

## Commands

```bash
npm run dev     # Development with hot-reload (nodemon + ts-node)
npm run build   # Compile TypeScript to dist/
npm start       # Run compiled bot from dist/
```

## Environment Variables

Required in `.env`:
- `DISCORD_TOKEN` - Discord bot token
- `MONGODB_URI` - MongoDB connection string

## Architecture

**Entry Point**: `src/index.ts` - Initializes Discord client, connects to MongoDB, dynamically loads commands from `src/commands/`

**Command Structure**: Each command in `src/commands/` exports:
- `data` - SlashCommandBuilder definition
- `execute(interaction)` - Handler function

**Current Commands**:
- `/link` - Link Discord user to Steam ID (stored in MongoDB)
- `/stats` - Hero statistics with win rates (filtered by days)
- `/wl` - Win/loss record with estimated MMR change
- `/history` - Recent 10 matches with dropdown selector

**Data Flow**:
1. User links Steam ID via `/link` → stored in `User` model (MongoDB)
2. Stats commands lookup user's Steam ID → call OpenDota API → format response

**Key Modules**:
- `src/opendota.ts` - OpenDota API wrapper (base URL: `https://api.opendota.com/api`)
- `src/db.ts` - MongoDB connection via Mongoose
- `src/heroes.ts` - Static hero ID to name mapping
- `src/models/User.ts` - Mongoose schema for Discord-Steam linking
- `src/utils/` - Helper functions for data processing and table formatting

**OpenDota API Notes**:
- `lobby_type: '7'` filters for ranked matches
- `date` parameter filters by number of days
