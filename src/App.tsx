import { Authenticated, Unauthenticated } from "convex/react";
import Dashboard from "./page/Dashboard";
import { SignInForm } from "./components/login";

export default function App() {
  return (
    <>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
