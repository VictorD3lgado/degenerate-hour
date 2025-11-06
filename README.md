# 🔥 Degenerate Hour 🔥

A viral betting community app built with Expo and Supabase where users can share their wildest sports bets and track degenerate hour action!

## Features
- View community bets in real-time
- Sort by timestamp, risk level, and bet type
- Beautiful dark-themed UI
- Parlay tracking, prop combos, and more

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Supabase real-time subscriptions

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your phone (iOS or Android)

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Supabase Database Setup

Go to your Supabase dashboard and create the `bets` table:

```sql
CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  odds TEXT,
  risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 5),
  created_by TEXT
);

-- Optional: Add some sample data
INSERT INTO bets (title, description, type, odds, risk_level, created_by) VALUES
('5-leg midnight parlay', 'All underdogs hitting late night', 'parlay', '+2500', 5, 'degen_master'),
('Triple-double combo', 'LeBron, Jokic, and Giannis all getting triple doubles', 'prop combo', '+850', 4, 'stats_guy'),
('Fade the public special', 'Going against 80% of public on this one', 'fade', '+180', 3, 'contrarian_king');
```

### 4. Run the App
```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure
```
degenerate-hour/
├── App.js              # Main app component with Supabase integration
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
└── README.md          # This file
```

## Supabase Configuration
The app connects to Supabase using:
- **URL**: https://wuhlnkvsoskdgpymdxer.supabase.co
- **Anon Key**: (included in App.js)

## Next Steps
- [ ] Add authentication
- [ ] Enable bet submission from the app
- [ ] Add comments and reactions
- [ ] Implement upvote/downvote system
- [ ] Add user profiles
- [ ] Real-time bet updates
- [ ] Push notifications for hot bets

## Contributing
Feel free to open issues and pull requests!

## License
MIT
