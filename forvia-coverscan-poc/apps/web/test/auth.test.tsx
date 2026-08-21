import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
}));

import { PinInput } from "@/app/(auth)/_components/PinInput";
import { isValidPassword } from "@/lib/auth-demo";
import LoginPage from "@/app/(auth)/login/page";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  sessionStorage.clear();
});

/* ------------------------------------------------------------------ PinInput */

function PinHarness({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <PinInput
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("PinInput", () => {
  it("renders 6 accessible boxes (aria-label Digit N of the code)", () => {
    render(<PinHarness />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`Digit ${i} of the code`)).toBeInTheDocument();
    }
  });

  it("auto-advances while typing and assembles the value", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Digit ${n} of the code`) as HTMLInputElement;

    fireEvent.change(box(1), { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith("1");
    expect(document.activeElement).toBe(box(2));

    fireEvent.change(box(2), { target: { value: "2" } });
    fireEvent.change(box(3), { target: { value: "3" } });
    expect(onChange).toHaveBeenLastCalledWith("123");
    expect(document.activeElement).toBe(box(4));
    expect(box(1).value).toBe("1");
    expect(box(3).value).toBe("3");
  });

  it("backspace on an empty box steps back and clears", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Digit ${n} of the code`) as HTMLInputElement;

    fireEvent.change(box(1), { target: { value: "4" } });
    fireEvent.change(box(2), { target: { value: "5" } });
    // box 3 focused and empty → backspace clears box 2 and moves back
    fireEvent.keyDown(box(3), { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("4");
    expect(document.activeElement).toBe(box(2));
  });

  it("pasting a 6-digit code fills every box", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Digit ${n} of the code`) as HTMLInputElement;

    fireEvent.paste(box(1), { clipboardData: { getData: () => "123456" } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
    for (let i = 1; i <= 6; i++) {
      expect(box(i).value).toBe(String(i));
    }
  });
});

/* ------------------------------------------------------- password validation */

describe("isValidPassword", () => {
  it("rejects fewer than 10 characters", () => {
    expect(isValidPassword("Ab1!x")).toBe(false);
  });
  it("requires a lowercase letter", () => {
    expect(isValidPassword("ABCDEF123!")).toBe(false);
  });
  it("requires an uppercase letter", () => {
    expect(isValidPassword("abcdef123!")).toBe(false);
  });
  it("requires a digit", () => {
    expect(isValidPassword("Abcdefghi!")).toBe(false);
  });
  it("requires a special character", () => {
    expect(isValidPassword("Abcdefgh12")).toBe(false);
  });
  it("accepts a compliant password", () => {
    expect(isValidPassword("CoverScan2026!")).toBe(true);
  });
});

/* ------------------------------------------------------------------ login flow */

describe("LoginPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const jsonResponse = (ok: boolean, status: number, body: unknown) =>
    Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

  async function goToPasswordStep() {
    fetchMock.mockReturnValueOnce(jsonResponse(true, 200, { mode: "password" }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "demo@forvia.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByLabelText("Password")).toBeInTheDocument());
  }

  it("shows the email step with the mockup copy in English", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome to Forvia")).toBeInTheDocument();
    expect(screen.getByText("Set up your password to access the platform")).toBeInTheDocument();
    expect(screen.getByText("Contact Forvia")).toBeInTheDocument();
  });

  it("wrong password → error message under the field", async () => {
    render(<LoginPage />);
    await goToPasswordStep();
    expect(screen.getByText("demo@forvia.com")).toBeInTheDocument();

    fetchMock.mockReturnValueOnce(
      jsonResponse(false, 401, { error: "Incorrect email or password." }),
    );
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Incorrect email or password.");
    expect(push).not.toHaveBeenCalled();
  });

  it("correct password → POST /api/auth/login then redirect to the home page", async () => {
    render(<LoginPage />);
    await goToPasswordStep();

    fetchMock.mockReturnValueOnce(jsonResponse(true, 200, { ok: true }));
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "CoverScan2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    const loginCall = fetchMock.mock.calls.find(([url]) => url === "/api/auth/login");
    expect(loginCall).toBeDefined();
    expect(JSON.parse((loginCall![1] as RequestInit).body as string)).toEqual({
      email: "demo@forvia.com",
      password: "CoverScan2026!",
    });
  });
});
