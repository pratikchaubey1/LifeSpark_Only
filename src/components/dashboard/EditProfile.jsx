import React from "react";

const EditProfile = () => {
  const inputBase =
    "w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";
  const labelBase = "text-xs sm:text-sm font-medium text-slate-600";

  return (
    <div className="w-full min-h-screen bg-slate-100 flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 lg:p-8">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src="https://i.pravatar.cc/100"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-indigo-500/20"
              alt="Profile"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Karan Yadav
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                karanyadav@gmail.com
              </p>
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] sm:text-xs text-emerald-700 font-medium border border-emerald-100">
                Active Member
              </span>
            </div>
          </div>

          <button className="self-start md:self-auto px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition">
            Edit Profile Picture
          </button>
        </div>

        {/* PERSONAL INFO SECTION */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">
              Personal Information
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Update your basic details used for your account profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* USER ID */}
            <div>
              <label className={labelBase}>User ID</label>
              <input
                type="text"
                defaultValue="W5E414890"
                className={`${inputBase} bg-slate-100 cursor-not-allowed`}
                readOnly
              />
            </div>

            {/* NAME */}
            <div>
              <label className={labelBase}>Name</label>
              <input
                type="text"
                defaultValue=""
                placeholder="Enter full name"
                className={inputBase}
              />
            </div>

            {/* GENDER */}
            <div>
              <label className={labelBase}>Gender</label>
              <select className={inputBase}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* ADDRESS */}
            <div>
              <label className={labelBase}>Address</label>
              <input
                type="text"
                defaultValue=""
                placeholder="House / Street / Area"
                className={inputBase}
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className={labelBase}>Mobile No</label>
              <input
                type="text"
                defaultValue=""
                placeholder="Enter mobile number"
                className={inputBase}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className={inputBase}
              />
            </div>

            {/* CITY */}
            <div>
              <label className={labelBase}>City</label>
              <input
                type="text"
                placeholder="City"
                className={inputBase}
              />
            </div>

            {/* STATE */}
            <div>
              <label className={labelBase}>State</label>
              <input
                type="text"
                placeholder="State"
                className={inputBase}
              />
            </div>

            {/* PIN CODE */}
            <div>
              <label className={labelBase}>Pin Code</label>
              <input
                type="number"
                placeholder="Pin Code"
                className={inputBase}
              />
            </div>

            {/* AGE */}
            <div>
              <label className={labelBase}>Age</label>
              <input
                type="number"
                defaultValue={0}
                className={inputBase}
              />
            </div>
          </div>
        </div>

        {/* KYC SECTION */}
        <div className="mt-10 space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">
              KYC Details
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Your PAN and Aadhaar details help us verify your identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* PAN */}
            <div>
              <label className={labelBase}>PAN No</label>
              <input
                type="text"
                placeholder="PAN Number"
                className={inputBase}
              />
            </div>

            {/* AADHAAR */}
            <div>
              <label className={labelBase}>Aadhaar No</label>
              <input
                type="number"
                placeholder="Aadhaar Number"
                className={inputBase}
              />
            </div>

            {/* NOMINEE */}
            <div>
              <label className={labelBase}>Nominee Name</label>
              <input
                type="text"
                placeholder="Nominee Name"
                className={inputBase}
              />
            </div>

            {/* RELATION */}
            <div>
              <label className={labelBase}>Relation</label>
              <input
                type="text"
                placeholder="Relation with nominee"
                className={inputBase}
              />
            </div>
          </div>
        </div>

        {/* UPI SECTION */}
        <div className="mt-10 space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">
              UPI Details
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Add your UPI details for faster payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* UPI NO */}
            <div>
              <label className={labelBase}>UPI No</label>
              <input
                type="text"
                placeholder="UPI linked mobile number"
                className={inputBase}
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className={labelBase}>UPI ID</label>
              <input
                type="text"
                placeholder="yourid@bank"
                className={inputBase}
              />
            </div>
          </div>
        </div>

        {/* UPDATE BUTTON */}
        <div className="mt-10 flex justify-end">
          <button className="w-full md:w-auto px-8 sm:px-10 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
