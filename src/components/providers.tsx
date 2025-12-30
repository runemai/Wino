"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

// QueryClient is re-exported from @tanstack/react-query via @tanstack/query-core
const getQueryClient = () => {
  const reactQuery = require("@tanstack/react-query");
  // QueryClient is available but not in type definitions
  return reactQuery.QueryClient || reactQuery.default?.QueryClient;
};

const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(() => {
    const QueryClient = getQueryClient();
    return new QueryClient(queryClientConfig);
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

