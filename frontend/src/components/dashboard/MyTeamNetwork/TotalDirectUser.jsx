import React from "react";

const TotalDirectUser = () => {
  const directUsers = []; // <-- yaha API se data aa jayega future me

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] p-5 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          My Direct Team
        </h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          Your directly referred users list
        </p>
      </div>

      {/* CARD WRAPPER */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6">
        
        {/* TABLE HEADER */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 px-2 py-3 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm md:text-base">
          <span>Name</span>
          <span>User ID</span>
          <span>Status</span>
          <span className="hidden md:block">Joining Date</span>
        </div>

        {/* If No Records */}
        {directUsers.length === 0 && (
          <div className="w-full py-14 flex flex-col items-center justify-center text-gray-500">
            <img
              className="h-28 opacity-70 mb-4"
              src="https://cdn-icons-png.flaticon.com/512/4076/4076504.png"
              alt="no data"
            />
            <p className="text-lg md:text-xl font-medium">No Records Found...</p>
            <p className="text-sm text-gray-400 mt-1">
              You don't have any direct team members yet.
            </p>
          </div>
        )}

        {/* Example Records (future API) */}
        {directUsers.length > 0 &&
          directUsers.map((user, index) => (
            <div
              key={index}
              className="grid grid-cols-3 md:grid-cols-4 gap-4 px-3 py-4 border-b last:border-none hover:bg-slate-50 transition"
            >
              <span className="font-medium text-slate-800">{user.name}</span>
              <span className="text-slate-600">{user.userId}</span>

              <span
                className={`px-3 py-1 text-xs rounded-full w-fit ${
                  user.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status}
              </span>

              <span className="hidden md:block text-slate-500">
                {user.joined}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TotalDirectUser;
