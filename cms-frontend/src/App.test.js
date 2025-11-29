import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders home page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toBeInTheDocument();
});

test("navigates to register page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  const registerButton = screen.getByRole("button", { name: /register/i });
  fireEvent.click(registerButton);

  const registerTitle = screen.getByRole("heading", { name: /register/i });
  expect(registerTitle).toBeInTheDocument();
});

test("navigates to login page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  const loginButton = screen.getByRole("button", { name: /login/i });
  fireEvent.click(loginButton);

  const loginTitle = screen.getByRole("heading", { name: /login/i });
  expect(loginTitle).toBeInTheDocument();
});
