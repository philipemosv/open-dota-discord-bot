# OpenDota Discord Bot

A Discord bot for Dota 2 statistics using the [OpenDota API](https://docs.opendota.com/). Link your Steam account and track your hero statistics, win/loss records, match history, and streaks.

## Features

- **Account Linking** - Link your Discord account to your Steam ID
- **Hero Statistics** - View win rates per hero with color-coded performance indicators
- **Win/Loss Tracking** - See your W/L record, win rate, estimated MMR change, and streaks
- **Match History** - Browse your last 10 matches with detailed scoreboard view

## Commands

| Command | Description |
|---------|-------------|
| `/link <steamid>` | Link your Discord account to your Steam ID |
| `/stats <days>` | View hero statistics for the specified time period (0-365 days) |
| `/wl <days>` | View win/loss record with streaks for the specified time period |
| `/history` | Browse your last 10 matches with interactive match details |

### Command Examples

```
/link 123456789          # Link your Steam account
/stats 30                # Hero stats for last 30 days
/wl 7                    # Win/loss for last week
/history                 # Recent match history
```

## Setup

### Prerequisites

- Node.js 18+
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- Your Steam ID (find it at [steamid.xyz](https://steamid.xyz/) or [findsteamid.com](https://findsteamid.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/philipemosv/open-dota-discord-bot.git
   cd open-dota-discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

4. Register slash commands with Discord (first time only):
   ```bash
   npm run deploy
   ```

### Running the Bot

**Development** (with hot-reload):
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts              # Bot entry point
├── db.ts                 # SQLite database (user linking)
├── opendota.ts           # OpenDota API wrapper
├── heroes.ts             # Hero ID to name mapping
├── commands/
│   ├── link.ts           # /link command
│   ├── hero-stats.ts     # /stats command
│   ├── history.ts        # /history command
│   └── winloss.ts        # /wl command
└── utils/
    ├── hero-stats-helper.ts      # Hero data processing
    ├── streak-helper.ts          # Streak calculation
    └── table-formatter-helper.ts # Table/embed formatting
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Discord**: discord.js v14
- **Database**: SQLite (better-sqlite3)
- **API**: OpenDota API (no key required)

## License

ISC
