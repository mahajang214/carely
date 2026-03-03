import React, { useEffect, useState } from "react";
import { commonAPI } from "../../common/commonAPI";

function CareNotesDashboard() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  // 🔹 Fetch all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await commonAPI.getAllCareNotes();
      // assume backend returns bookings list
      setBookings(res?.data?.data || []);
      //   console.log("BOOKINGS : ", res?.data?.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    }
  };

  // 🔹 Fetch notes when booking selected
  useEffect(() => {
    if (selectedBooking) {
      fetchNotes();
    }
  }, [selectedBooking, page]);

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);

      const res = await commonAPI.getCareNote(
        `${selectedBooking._id}?page=${page}&limit=${limit}`,
      );

      //   console.log("NOTES : ", res?.data?.data);
      setNotes(res?.data?.data || []);
      setTotalPages(res?.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      const res = await commonAPI.addCareNote({
        bookingId: selectedBooking._id,
        note: noteText,
      });
      //   console.log("ADD NOTE : ",res.data)
      setNoteText("");
      setPage(1);
      fetchNotes();
    } catch (error) {
      console.log("ERROR : ", error.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6 h-[calc(100vh-120px)]">
      {/* 🔹 Left Side - Bookings List */}
      <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-lg p-5 border overflow-y-auto max-h-[300px] lg:max-h-full">
        <h2 className="text-lg font-semibold mb-4">Bookings</h2>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => {
                setSelectedBooking(booking);
                setPage(1);
              }}
              className={`p-4 rounded-2xl cursor-pointer border transition ${
                selectedBooking?._id === booking._id
                  ? "bg-indigo-50 border-indigo-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <p className="font-medium text-gray-800 text-sm sm:text-base">
                {booking?.patientId?.firstName} {booking?.patientId?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {booking?.bookingServiceCategory}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Right Side - Care Notes */}
      <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-lg border flex flex-col h-full">
        {!selectedBooking ? (
          <div className="text-gray-400 text-center m-auto px-4">
            Select a booking to view care notes
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b font-semibold text-base sm:text-lg">
              {selectedBooking?.bookingServiceCategory}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
              {notes.map((note) => {
                const isCaregiver = note.senderRole === "caregiver";

                return (
                  <div
                    key={note._id}
                    className={`flex ${
                      isCaregiver ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                        isCaregiver
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border"
                      }`}
                    >
                      <p className="text-sm break-words">{note.note}</p>

                      <div
                        className={`text-[10px] mt-2 flex justify-between gap-3 ${
                          isCaregiver ? "text-indigo-200" : "text-gray-400"
                        }`}
                      >
                        <span>{note.senderRole}</span>
                        <span>
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Section */}
            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-xl p-3 resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                rows={2}
              />

              <button
                onClick={handleAddNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl w-full sm:w-auto"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CareNotesDashboard;
