// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Tạo 1 client cho toàn bộ app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // không retry khi lỗi (tùy bạn)
      refetchOnWindowFocus: false, // không refetch khi focus lại tab
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* QueryClientProvider phải bao bên ngoài App */}
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>

      {/* Devtools (chỉ cho dev) */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>
);
