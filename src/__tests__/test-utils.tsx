import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { DictionaryProvider } from "@/components/dictionary-provider";
import enDict from "@/dictionaries/en.json";

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

let mockPathname = "/en/buy";
let mockSearchParams = new URLSearchParams();

export function setMockPathname(pathname: string) {
  mockPathname = pathname;
}

export function setMockSearchParams(params: URLSearchParams | string) {
  mockSearchParams =
    typeof params === "string" ? new URLSearchParams(params) : params;
}

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <DictionaryProvider dictionary={enDict}>{children}</DictionaryProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { mockRouter, enDict };
export { render, screen, waitFor, within, act } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
