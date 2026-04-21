import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { OfflineStatusProvider } from "@/components/offline/offline-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <OfflineStatusProvider>
        <ThemeProvider disableTransitionOnChange={false}>
          <App />
        </ThemeProvider>
      </OfflineStatusProvider>
    </BrowserRouter>
  </StrictMode>
)
