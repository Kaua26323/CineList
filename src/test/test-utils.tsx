import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router";

interface TestProviderOptions {
  initialEntries?: MemoryRouterProps["initialEntries"];
  queryClient?: QueryClient;
}

type AppRenderOptions = Omit<RenderOptions, "wrapper"> & TestProviderOptions;

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createTestWrapper({
  initialEntries = ["/"],
  queryClient = createTestQueryClient(),
}: TestProviderOptions = {}) {
  function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { TestWrapper, queryClient };
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries,
    queryClient,
    ...renderOptions
  }: AppRenderOptions = {},
) {
  const providers = createTestWrapper({ initialEntries, queryClient });

  return {
    queryClient: providers.queryClient,
    ...render(ui, { wrapper: providers.TestWrapper, ...renderOptions }),
  };
}

export function renderHookWithProviders<Result, Props>(
  callback: (initialProps: Props) => Result,
  {
    initialEntries,
    queryClient,
    ...renderHookOptions
  }: Omit<RenderHookOptions<Props>, "wrapper"> & TestProviderOptions = {},
) {
  const providers = createTestWrapper({ initialEntries, queryClient });

  return {
    queryClient: providers.queryClient,
    ...renderHook(callback, {
      wrapper: providers.TestWrapper,
      ...renderHookOptions,
    }),
  };
}

export * from "@testing-library/react";
