import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Ticket } from "../../components/TicketQueue";

export interface GraphSnapshotResponse {
  ticketId: string;
  customerEmail: string;
  rawIssueText: string;
  categories: string[];
  sentiment: "URGENT_CHURN" | "NEUTRAL" | "ANGRY";
  draftResponse: string | null;
  requiresHumanReview: boolean;
  humanApproved: boolean;
}

export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  tagTypes: ["Ticket"],

  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => "/tickets",
      providesTags: ["Ticket"],

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const { io } = await import("socket.io-client");
        const socket = io(import.meta.env.VITE_BACKEND_WEBSOCKETS_URL);

        const sortTicketsByDate = (tickets: Ticket[]) => {
          tickets.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        };

        try {
          await cacheDataLoaded;

          // Sort initial API response
          updateCachedData((draft) => {
            sortTicketsByDate(draft);
          });

          socket.on("ticket_pipeline_event", (eventData) => {
            updateCachedData((draft) => {
              const ticket = draft.find((t) => t.id === eventData.ticketId);

              if (ticket) {
                // Update existing ticket
                ticket.status = eventData.status;

                if (eventData.category) {
                  ticket.category = eventData.category;
                }

                if (eventData.sentiment) {
                  ticket.sentiment = eventData.sentiment;
                }
              } else if (eventData.status === "processing") {
                // Add new incoming ticket
                const createdAt =
                  eventData.createdAt ?? new Date().toISOString();

                draft.push({
                  id: eventData.ticketId,
                  sender: eventData.sender,
                  body: eventData.body,
                  category: null,
                  sentiment: null,
                  status: "processing",
                  createdAt,

                  timestamp: new Date(createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                });
              }

              // Always maintain newest first ordering
              sortTicketsByDate(draft);
            });
          });
        } catch {}

        await cacheEntryRemoved;

        socket.close();
      },
    }),

    getGraphState: builder.query<GraphSnapshotResponse, string>({
      query: (ticketId) => `/tickets/${ticketId}/graph-state`,
    }),

    resumeGraphEngine: builder.mutation<
      any,
      { ticketId: string; finalDraft: string }
    >({
      query: ({ ticketId, finalDraft }) => ({
        url: `/tickets/${ticketId}/resume`,
        method: "POST",
        body: { finalDraft },
      }),
      invalidatesTags: ["Ticket"],
    }),

    rejectGraphEngine: builder.mutation<any, string>({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetGraphStateQuery,
  useResumeGraphEngineMutation,
  useRejectGraphEngineMutation,
} = crmApi;
