import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// StrictMode removed - it causes double render of all components
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
