import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";

const EventsPage = () => {
  const { allEvents = [], isLoading, error } = useSelector((state) => state.events);
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          {error ? (
            <p>{error}</p>
          ) : allEvents.length > 0 ? (
            <div className="space-y-6 px-4 py-6 sm:px-6">
              {allEvents.map((event) => (
                <EventCard key={event.id} active={true} data={event} />
              ))}
            </div>
          ) : (
            <p>No events available.</p>
          )}
          <Footer />
        </div>
      )}
    </>
  );
};

export default EventsPage;
