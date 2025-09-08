# TvTracker - Movie & TV Series Tracking Application

A comprehensive MERN stack application for tracking movies and TV series with social features and detailed analytics.

## Features

- **Authentication System**: JWT-based user authentication
- **Dashboard**: Search, recent watches, currently watching shows, watchlist preview
- **Movie/TV Details**: Complete information, cast, crew, streaming availability
- **Watchlist Management**: Add/remove items with filtering
- **Watch Tracking**: Episode-by-episode tracking for TV shows
- **Statistics**: Comprehensive analytics with heatmaps and genre breakdowns
- **Groups**: Create groups and chat with friends about movies/shows
- **Dark Mode**: Glassmorphism UI with smooth animations

## Tech Stack

- **Frontend**: React.js, CSS (Glassmorphism design)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **External API**: TMDB API for movie/TV data

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:

```bash
cd tvtracker-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with:

```
MONGODB_URI=mongodb://localhost:27017/tvtracker
JWT_SECRET=your_jwt_secret_here
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
```

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd tvtracker-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

### TMDB API Setup

1. Create account at [TMDB](https://www.themoviedb.org/)
2. Go to Settings > API
3. Request API key
4. Add the API key to your backend .env file

### MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update the MONGODB_URI in your .env file
3. The application will create collections automatically

## Project Structure

```
tvtracker/
├── tvtracker-backend/
│   ├── server.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Watch.js
│   │   ├── Watchlist.js
│   │   ├── Group.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── watch.js
│   │   ├── watchlist.js
│   │   ├── stats.js
│   │   ├── groups.js
│   │   └── chat.js
│   └── middleware/
│       └── auth.js
└── tvtracker-frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── MovieCard.js
    │   │   └── ProtectedRoute.js
    │   └── pages/
    │       ├── Login.js
    │       ├── Signup.js
    │       ├── Dashboard.js
    │       ├── MovieDetails.js
    │       ├── Watchlist.js
    │       ├── Stats.js
    │       ├── Groups.js
    │       └── GroupChat.js
    └── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Watch Tracking

- `POST /api/watch` - Add watch entry
- `GET /api/watch` - Get recent watches
- `GET /api/watch/currently-watching` - Get series in progress
- `GET /api/watch/progress/:tmdbId` - Get progress for specific series
- `DELETE /api/watch/:id` - Remove watch entry

### Watchlist

- `POST /api/watchlist` - Add to watchlist
- `GET /api/watchlist` - Get user's watchlist
- `DELETE /api/watchlist` - Remove from watchlist
- `GET /api/watchlist/check/:tmdbId/:mediaType` - Check if item is in watchlist

### Statistics

- `GET /api/stats` - Get comprehensive user statistics

### Groups

- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `POST /api/groups/:id/join` - Join group
- `GET /api/groups/:id/stats` - Get group statistics

### Chat

- `POST /api/chat/:groupId` - Send message
- `GET /api/chat/:groupId` - Get chat history

## Usage

1. **Sign up/Login**: Create an account or login
2. **Search**: Use the search bar on dashboard to find movies/TV shows
3. **Track**: Click on items to view details and mark as watched
4. **Watchlist**: Add items to your watchlist for later viewing
5. **Statistics**: View comprehensive stats about your watching habits
6. **Groups**: Create or join groups to chat with friends about movies/shows

## Features Details

### Watch Tracking

- Movies: Simple watched/unwatched status
- TV Shows: Season and episode-specific tracking
- Progress bars for currently watching series
- Viewing history with timestamps

### Statistics

- Tabbed interface (Overall, Movies, TV Shows)
- Time tracking in days/hours/minutes
- Activity heatmap showing daily activity
- Top genres analysis
- Biggest marathons (most-watched series)
- Recent activity tracking

### Groups & Chat

- Create groups with preferred genres
- WhatsApp-style chat interface
- Real-time messaging (polling every 3 seconds)
- Group statistics showing collective preferences
- Media sharing capabilities

### UI/UX Features

- Dark mode throughout
- Glassmorphism design with blur effects
- Smooth animations and hover effects
- Responsive design for mobile and desktop
- Loading states and error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
