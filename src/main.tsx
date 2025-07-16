import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { startScheduledSync } from './utils/scheduler.ts'
import './index.css'

// Start scheduled sync
startScheduledSync();

createRoot(document.getElementById("root")!).render(<App />);
