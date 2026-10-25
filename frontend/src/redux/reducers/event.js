import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  allEvents: [],
  events: [],
};

export const eventReducer = createReducer(initialState, {
  eventCreateRequest: (state) => {
    state.isLoading = true;
  },
  eventCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.event = action.payload;
    state.success = true;
  },
  eventCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  eventCreateReset: (state) => {
    state.success = false;
    state.error = null;
  },

  // get all events of shop
  getAlleventsShopRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getAlleventsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.events = action.payload || [];
    state.error = null;
  },
  getAlleventsShopFailed: (state, action) => {
    state.isLoading = false;
    state.events = [];
    state.error = action.payload;
  },

  // delete event of a shop
  deleteeventRequest: (state) => {
    state.isLoading = true;
  },
  deleteeventSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteeventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all events
  getAlleventsRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getAlleventsSuccess: (state, action) => {
    state.isLoading = false;
    state.allEvents = action.payload || [];
    state.error = null;
  },
  getAlleventsFailed: (state, action) => {
    state.isLoading = false;
    state.allEvents = [];
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});
