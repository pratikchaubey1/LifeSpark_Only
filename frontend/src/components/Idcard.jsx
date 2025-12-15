import React, { useRef } from "react";

const IDCard = ({
  name = "Atul",
  email = "atul@gmail.com",
  address = "Mughalsarai",
  district = "Chandauli",
  pinCode = "232101",
  registrationDate = "02/12/2025",
  emergencyContact = "8188874312",
  dsCode = "LSA315375",
  location = "Uttar Pradesh, India",
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open("", "", "width=400,height=650");
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card</title>
          <style>
            body { display:flex; justify-content:center; }
          </style>
        </head>
        <body>${content.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4">

      {/* PRINT BUTTON */}
      <button
        onClick={handlePrint}
        className="mb-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
      >
        Print ID Card
      </button>

      {/* ID CARD */}
      <div
        ref={printRef}
        className="w-[320px] rounded-2xl border-2 border-blue-600 bg-white shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-blue-700">LifeSpark</h1>
          <p className="text-sm text-orange-500 font-semibold">
            Associate
          </p>
        </div>

        {/* IMAGE SECTION */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-orange-400 flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-white bg-white"></div>
          <p className="mt-3 text-white font-bold text-lg">{name}</p>
        </div>

        {/* DETAILS */}
        <div className="p-4 text-sm space-y-2">
          <p><b>Email:</b> {email}</p>
          <p><b>Address:</b> {address}</p>
          <p><b>District:</b> {district}</p>
          <p><b>Pin Code:</b> {pinCode}</p>
          <p><b>Location:</b> {location}</p>
          <p><b>Date of Registration:</b> {registrationDate}</p>
          <p><b>Emergency Contact:</b> {emergencyContact}</p>
        </div>

        {/* FOOTER */}
        <div className="bg-orange-50 text-center p-3 border-t">
          <p className="font-semibold text-slate-800">
            DS CODE: {dsCode}
          </p>
          <p className="text-xs italic text-slate-500">
            Authorised Signatory
          </p>
        </div>
      </div>
    </div>
  );
};

export default IDCard;