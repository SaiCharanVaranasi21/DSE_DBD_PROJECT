import { useEffect, useState } from "react";
import App from "./App.jsx";
import Starting from "./assets/components/Starting.jsx";

const pageFromPath = () => {
  if (window.location.pathname === "/login") {
    return "signin";
  }

  if (window.location.pathname === "/signup") {
    return "signup";
  }

  return null;
};

function Root() {
  const [authPage, setAuthPage] = useState(pageFromPath);

  useEffect(() => {
    const handleRouteChange = () => setAuthPage(pageFromPath());
    window.addEventListener("popstate", handleRouteChange);

    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const navigateToAuth = (page) => {
    const path = page === "signup" ? "/signup" : "/login";
    window.history.pushState({}, "", path);
    setAuthPage(page);
  };

  if (authPage) {
    return <App initialPage={authPage} />;
  }

  return (
    <Starting
      onLogin={() => navigateToAuth("signin")}
      onSignup={() => navigateToAuth("signup")}
    />
  );
}

export default Root;
