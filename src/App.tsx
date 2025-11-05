import { Authenticated, Unauthenticated } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./page/Dashboard";
import { SignInForm } from "./components/login";

export default function App() {
  return (
    <BrowserRouter>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </BrowserRouter>
  );
}
