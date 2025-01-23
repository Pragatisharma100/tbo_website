import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

const mockSightseeingAPI = async (destination, days) => {
  const dailyAttractions = {
    1: [
      { id: 1, name: "Historical Museum", duration: 120, timeSlot: "09:00" },
      { id: 2, name: "Central Park", duration: 90, timeSlot: "11:30" },
      { id: 3, name: "Local Market", duration: 60, timeSlot: "13:30" }
    ],
    2: [
      { id: 4, name: "Art Gallery", duration: 120, timeSlot: "10:00" },
      { id: 5, name: "Beach Walk", duration: 90, timeSlot: "13:00" },
      { id: 6, name: "Sunset Point", duration: 60, timeSlot: "16:00" }
    ]
  };
  
  return new Promise(resolve => {
    setTimeout(() => {
      const result = {};
      for (let i = 1; i <= days; i++) {
        result[i] = dailyAttractions[i] || dailyAttractions[1];
      }
      return resolve(result);
    }, 1000);
  });
};

const ItineraryPlanner = () => {
  const [destination, setDestination] = useState("");
  const [numDays, setNumDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [itinerary, setItinerary] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const daysRef = useRef({});

  const handleSearch = async () => {
    if (!destination || numDays < 1 || !startDate) return;
    setLoading(true);
    try {
      const data = await mockSightseeingAPI(destination, numDays);
      setItinerary(data);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    }
    setLoading(false);
  };

  const getDayDate = (dayNum) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNum - 1);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let closestDay = 1;
      let minDistance = Infinity;

      Object.entries(daysRef.current).forEach(([day, ref]) => {
        if (ref) {
          const distance = Math.abs(ref.offsetTop - scrollPosition);
          if (distance < minDistance) {
            minDistance = distance;
            closestDay = parseInt(day);
          }
        }
      });

      setActiveDay(closestDay);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Itinerary Planner</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <input
              type="number"
              min="1"
              value={numDays}
              onChange={(e) => setNumDays(parseInt(e.target.value))}
              className="w-24 p-2 border rounded"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 p-2 border rounded"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Plan"}
          </button>
        </div>
      </div>

      {Object.keys(itinerary).length > 0 && (
        <div className="flex gap-6">
          <div className="flex-grow space-y-6">
            {Object.entries(itinerary).map(([day, attractions]) => (
              <div key={day} ref={el => daysRef.current[day] = el}>
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Day {day} - {getDayDate(parseInt(day))}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      {attractions.map((attraction) => (
                        <div key={attraction.id} className="flex items-start mb-8">
                          <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                            {attraction.timeSlot}
                          </div>
                          <div className="relative flex-grow pl-8 border-l-2 border-blue-200">
                            <div className="absolute -left-2 top-2 w-4 h-4 rounded-full bg-blue-500" />
                            <div className="bg-white rounded-lg shadow p-4 mb-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {attraction.name}
                              </h4>
                              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Duration: {attraction.duration} minutes
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-56 fixed top-8 right-11 h-fit">
            <div className="bg-white rounded-lg shadow p-4">
              {Object.keys(itinerary).map((day) => (
                <div
                  key={day}
                  className={`py-2 px-4 mb-2 rounded cursor-pointer transition-colors ${
                    parseInt(day) === activeDay
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-100"
                  }`}
                  onClick={() => {
                    daysRef.current[day]?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {getDayDate(parseInt(day))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanner;