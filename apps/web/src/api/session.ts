import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export interface Session {
  name: string;
  email: string;
}

export function useSession() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => (await api.get<Session>("/auth/me")).data,
    retry: false,
  });
}
