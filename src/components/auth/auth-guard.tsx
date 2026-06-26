"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("studyflow_auth_token"));
      setIsReady(true);
    };

    syncToken();
    window.addEventListener("storage", syncToken);
    window.addEventListener("focus", syncToken);
    window.addEventListener("pageshow", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("focus", syncToken);
      window.removeEventListener("pageshow", syncToken);
    };
  }, []);

  useEffect(() => {
    if (isReady && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isReady, pathname, router, token]);

  if (!isReady) {
    return null;
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
