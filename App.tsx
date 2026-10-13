// Root-level entry point for Expo
import { registerRootComponent } from 'expo';
import App from './frontend/App';

// Register the root component so Expo can launch the app
registerRootComponent(App);

export default App;
