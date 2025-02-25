# National Park Explorer 🏞️

A modern web application for discovering and exploring U.S. National Parks, with offline capabilities and user features.

![National Park Explorer](https://images.unsplash.com/photo-1562310503-a918c4c61e38?auto=format&fit=crop&w=1200&h=400&q=80)

## Features

### 🌟 Core Features
- **Park Discovery**: Search and explore national parks by state
- **Activity Filtering**: Find parks based on specific activities like hiking, camping, and scenic views
- **Interactive Maps**: View park locations with interactive maps powered by OpenStreetMap
- **Weather Information**: Real-time weather data for each park
- **Detailed Park Information**: 
  - Operating hours
  - Entrance fees
  - Accessibility information
  - Visitor centers
  - Trail information
  - Upcoming events

### 👤 User Features
- **User Authentication**: Secure email-based authentication
- **Favorite Parks**: Save and manage favorite parks
- **Profile Management**: Customize user preferences and settings
- **Password Management**: Secure password update functionality

### 📱 Progressive Web App (PWA)
- **Offline Support**: Access park information without internet connection
- **Downloadable Maps**: Save park maps for offline use
- **Installable**: Can be installed as a standalone app on mobile devices
- **Auto Updates**: Automatic updates when new versions are available

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Lucide React (icons)
- Leaflet (maps)
- date-fns (date formatting)

### Backend & Data
- Supabase (authentication & database)
- National Park Service API
- WeatherAPI.com (weather data)

### Storage & Caching
- IndexedDB (offline data)
- Workbox (service worker)
- PWA capabilities

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- National Park Service API key
- WeatherAPI.com API key

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/national-park-explorer.git
cd national-park-explorer
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── services/      # API service functions
├── types/         # TypeScript type definitions
└── data/          # Static data and constants
```

### Key Components
- `App.tsx`: Main application component
- `ParkForm.tsx`: Search and filter interface
- `ParkResults.tsx`: Display park search results
- `ParkDetails.tsx`: Detailed park information
- `ParkMap.tsx`: Interactive park map
- `AuthModal.tsx`: Authentication interface
- `ProfileSettings.tsx`: User profile management

## Features in Detail

### Authentication
- Email-based authentication
- Secure password management
- Profile customization

### Park Discovery
- State-based search
- Activity filtering
- Interactive map interface
- Detailed park information

### Offline Capabilities
- Service worker for offline access
- IndexedDB for data storage
- Downloadable maps
- Offline-first architecture

### User Data
- Favorite parks management
- User preferences
- Profile settings

## Contributing

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- National Park Service for their comprehensive API
- OpenStreetMap contributors for map data
- Unsplash photographers for beautiful park images
- The React and Vite communities