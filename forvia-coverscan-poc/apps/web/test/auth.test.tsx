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
  it("rend 6 cases accessibles (aria-label Chiffre N du code)", () => {
    render(<PinHarness />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`Chiffre ${i} du code`)).toBeInTheDocument();
    }
  });

  it("avance automatiquement à la saisie et assemble la valeur", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Chiffre ${n} du code`) as HTMLInputElement;

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

  it("le retour arrière sur une case vide recule et efface", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Chiffre ${n} du code`) as HTMLInputElement;

    fireEvent.change(box(1), { target: { value: "4" } });
    fireEvent.change(box(2), { target: { value: "5" } });
    // box 3 focused and empty → backspace clears box 2 and moves back
    fireEvent.keyDown(box(3), { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("4");
    expect(document.activeElement).toBe(box(2));
  });

  it("le collage d'un code à 6 chiffres remplit toutes les cases", () => {
    const onChange = vi.fn();
    render(<PinHarness onChange={onChange} />);
    const box = (n: number) => screen.getByLabelText(`Chiffre ${n} du code`) as HTMLInputElement;

    fireEvent.paste(box(1), { clipboardData: { getData: () => "123456" } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
    for (let i = 1; i <= 6; i++) {
      expect(box(i).value).toBe(String(i));
    }
  });
});

/* --------------------------------------------------- validation mot de passe */

describe("isValidPassword", () => {
  it("refuse moins de 10 caractères", () => {
    expect(isValidPassword("Ab1!x")).toBe(false);
  });
  it("exige une minuscule", () => {
    expect(isValidPassword("ABCDEF123!")).toBe(false);
  });
  it("exige une majuscule", () => {
    expect(isValidPassword("abcdef123!")).toBe(false);
  });
  it("exige un chiffre", () => {
    expect(isValidPassword("Abcdefghi!")).toBe(false);
  });
  it("exige un caractère spécial", () => {
    expect(isValidPassword("Abcdefgh12")).toBe(false);
  });
  it("accepte un mot de passe conforme", () => {
    expect(isValidPassword("CoverScan2026!")).toBe(true);
  });
});

/* ------------------------------------------------------------- flux de login */

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
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "demo@forvia.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument());
  }

  it("affiche l'étape e-mail avec les textes de la maquette", () => {
    render(<LoginPage />);
    expect(screen.getByText("Bienvenue sur CoverScan")).toBeInTheDocument();
    expect(
      screen.getByText("Configurez votre mot de passe afin d’accéder à la plateforme"),
    ).toBeInTheDocument();
    expect(screen.getByText("Contacter CoverScan")).toBeInTheDocument();
  });

  it("mauvais mot de passe → message d'erreur sous le champ", async () => {
    render(<LoginPage />);
    await goToPasswordStep();
    expect(screen.getByText("demo@forvia.com")).toBeInTheDocument();

    fetchMock.mockReturnValueOnce(
      jsonResponse(false, 401, { error: "E-mail ou mot de passe incorrect." }),
    );
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "mauvais" } });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("E-mail ou mot de passe incorrect.");
    expect(push).not.toHaveBeenCalled();
  });

  it("bon mot de passe → POST /api/auth/login puis redirection vers l'accueil", async () => {
    render(<LoginPage />);
    await goToPasswordStep();

    fetchMock.mockReturnValueOnce(jsonResponse(true, 200, { ok: true }));
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "CoverScan2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    const loginCall = fetchMock.mock.calls.find(([url]) => url === "/api/auth/login");
    expect(loginCall).toBeDefined();
    expect(JSON.parse((loginCall![1] as RequestInit).body as string)).toEqual({
      email: "demo@forvia.com",
      password: "CoverScan2026!",
    });
  });
});
