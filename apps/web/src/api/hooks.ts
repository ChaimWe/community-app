import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import { CommunityEvent, Group, Member, MemberInput } from "./types";

export function useMembers(search = "", program = "", includeArchived = false) {
  return useQuery({
    queryKey: ["members", search, program, includeArchived],
    queryFn: async () => (await api.get<Member[]>("/members", { params: { search, program, includeArchived } })).data,
  });
}

export function useMember(id?: string) {
  return useQuery({
    queryKey: ["member", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get<Member>(`/members/${id}`)).data,
  });
}

export function useGroups(includeArchived = false) {
  return useQuery({
    queryKey: ["groups", includeArchived],
    queryFn: async () => (await api.get<Group[]>("/groups", { params: { includeArchived } })).data,
  });
}

export function useEvents(includeArchived = false) {
  return useQuery({
    queryKey: ["events", includeArchived],
    queryFn: async () => (await api.get<CommunityEvent[]>("/events", { params: { includeArchived } })).data,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberInput) => api.post("/members", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberInput }) => api.patch(`/members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Group>) => api.post("/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Group> }) => api.patch(`/groups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CommunityEvent>) => api.post("/events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommunityEvent> }) => api.patch(`/events/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previousEvents = queryClient.getQueriesData<CommunityEvent[]>({ queryKey: ["events"] });

      queryClient.setQueriesData<CommunityEvent[]>({ queryKey: ["events"] }, (currentEvents) =>
        currentEvents?.map((event) => {
          if (event._id !== id) return event;

          const updated = { ...event, ...data };
          if (Array.isArray(data.attendeeIds)) {
            const attendeeIds = new Set(data.attendeeIds.map(String));
            updated.seatingPlans = event.seatingPlans?.map((plan) => ({
              ...plan,
              tables: plan.tables.map((table) => ({
                ...table,
                memberIds: table.memberIds.filter((memberId) => attendeeIds.has(String(memberId))),
              })),
            }));
          }
          return updated;
        }),
      );

      return { previousEvents };
    },
    onError: (_error, _variables, context) => {
      context?.previousEvents.forEach(([queryKey, events]) => {
        queryClient.setQueryData(queryKey, events);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useGenerateSeating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/events/${id}/seating/generate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useArchiveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/members/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useRestoreMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/members/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/events/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRestoreEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/events/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useArchiveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/groups/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useRestoreGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/groups/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
