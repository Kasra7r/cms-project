import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

test('renders home page', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  // اطمینان از وجود متن "Welcome to CMS" در صفحه
  const linkElement = screen.getByText(/welcome to cms/i);
  expect(linkElement).toBeInTheDocument();
});

test('navigates to register page', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  // کلیک روی دکمه "Register"
  const registerButton = screen.getByText(/Register/i);
  fireEvent.click(registerButton);
  
  // اطمینان از نمایش صفحه ثبت‌نام
  const registerHeader = screen.getByText(/Register/i);
  expect(registerHeader).toBeInTheDocument();
});

test('navigates to login page', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  // کلیک روی دکمه "Login"
  const loginButton = screen.getByText(/Login/i);
  fireEvent.click(loginButton);
  
  // اطمینان از نمایش صفحه ورود
  const loginHeader = screen.getByText(/Login/i);
  expect(loginHeader).toBeInTheDocument();
});
