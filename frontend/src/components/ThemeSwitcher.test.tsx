import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "dark";
    localStorage.clear();
  });

  it("applies and remembers the selected theme", () => {
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByTitle("Use light theme"));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("auramail-theme")).toBe("light");
    expect(screen.getByTitle("Use dark theme")).toBeInTheDocument();
  });
});
