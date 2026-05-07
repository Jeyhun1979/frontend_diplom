import { create } from "zustand";
import { getBookingDraft } from "../utils/bookingDraft";

const initialDraft = getBookingDraft() ?? {};

export const useTicketStore = create((set, get) => ({
  tickets: [],
  searchData: initialDraft.searchData ?? {},
  searchParams: initialDraft.searchParams ?? null,
  selectedTrain: initialDraft.selectedTrain ?? null,
  selectedSeats: initialDraft.selectedSeats ?? [],
  returnTrain: initialDraft.returnTrain ?? null,
  returnSeats: initialDraft.returnSeats ?? [],
  passengers: initialDraft.passengers ?? [],
  order: initialDraft.order ?? null,
  contacts: initialDraft.contacts ?? { phone: "", email: "" },
  paymentMethod: initialDraft.paymentMethod ?? "cash",

  setTickets: (tickets) => set({ tickets }),
  setSearchData: (data) => set({ searchData: data }),
  updateSearchData: (patch) =>
    set((state) => ({ searchData: { ...(state.searchData ?? {}), ...patch } })),
  setSearchParams: (params) => set({ searchParams: params }),
  setSelectedTrain: (train) => set({ selectedTrain: train }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  setReturnTrain: (train) => set({ returnTrain: train }),
  setReturnSeats: (seats) => set({ returnSeats: seats }),
  setPassengers: (passengers) => set({ passengers }),
  setContacts: (contacts) => set({ contacts }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setOrder: (order) => set({ order }),

  clearBooking: () => {
    set({
      selectedTrain: null,
      selectedSeats: [],
      returnTrain: null,
      returnSeats: [],
      passengers: [],
      order: null,
    });
  },
}));
