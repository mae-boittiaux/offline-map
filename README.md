# offline-map

## Project Structure
```bash
/offline-map
├── clear-data.js           # Clear DB, cache, UI, and state
├── connection-status.js    # Displays online/offline state
├── event-listeners.js      # User input/event binding
├── favicon.ico             # Browser tab icon
├── form-submission.js      # OSM API data fetch and render trigger
├── index.html              # Application entry HTML
├── indexedDB.js            # IndexedDB schema and handlers
├── initialisation.js       # Bootstraps canvas, database, and UI
├── input-validation.js     # Input range and logic checking
├── log-message.js          # Unified logging system
├── main.js                 # Entry point script
├── mouse-events.js         # Panning via mouse drag
├── parse-data.js           # XML to JS object transformation
├── registration.js         # Service Worker registration
├── render-main.js          # Core rendering logic
├── render-nodes.js         # Node rendering
├── render-relations.js     # Relation rendering
├── render-rules.js         # Style definitions with zIndex
├── render-ways.js          # Way rendering
├── service-worker.js       # Offline caching logic
├── style.css               # CSS styling and layout
└── zoom-buttons.js         # Zoom control handlers
```