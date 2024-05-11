import { createRoot } from "react-dom/client";
import App from "./components/App";
import { StyledEngineProvider } from "@mui/material/styles";
import "./index.module.scss";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StyledEngineProvider injectFirst>
    <App />
  </StyledEngineProvider>
);
