import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";

const API  = "https://royalgemschoolsbackend.vercel.app";
const fmt  = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const numberToWords = (value) => {
  const number = Math.floor(Number(value) || 0);
  if (!number) return "Zero";
  if (number < 20) return ONES[number];
  if (number < 100) return `${TENS[Math.floor(number / 10)]}${number % 10 ? `-${ONES[number % 10]}` : ""}`;
  if (number < 1000) return `${ONES[Math.floor(number / 100)]} Hundred${number % 100 ? ` and ${numberToWords(number % 100)}` : ""}`;
  const units = [[1000000000, "Billion"], [1000000, "Million"], [1000, "Thousand"]];
  for (const [unit, label] of units) {
    if (number >= unit) return `${numberToWords(Math.floor(number / unit))} ${label}${number % unit ? `, ${numberToWords(number % unit)}` : ""}`;
  }
  return String(number);
};

const amountInWords = (amount) => `${numberToWords(amount)} Naira Only.`;

export default function ReceiptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [receipt, setReceipt] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("portalToken");
    fetch(`${API}/api/receipts/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.message && !data._id) throw new Error(data.message);
        setReceipt(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("portalToken");
      const response = await fetch(`${API}/api/receipts/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to download receipt");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${receipt?.receiptNumber || "royal-gem-receipt"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <div className="text-center">
        <span className="w-8 h-8 border-2 border-[#f056f0] border-t-transparent rounded-full animate-spin block mx-auto mb-3" />
        <p className="font-dm-sans text-sm text-gray-400">Loading receipt…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6EBEE]">
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm">{error}</div>
    </div>
  );

  if (!receipt) return null;

  const student = receipt.student || {};

  return (
    <div className="min-h-screen bg-[#E6EBEE] print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-dm-sans text-sm text-gray-500 hover:text-[#f056f0] transition-colors">
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-dm-sans text-sm
                       font-semibold text-gray-700 hover:border-[#f056f0] hover:text-[#f056f0] transition-colors">
            <FiPrinter /> Print Receipt
          </button>
            <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f056f0] hover:bg-[#525fe1] rounded-full font-dm-sans text-sm
                       font-semibold text-white transition-colors">
            <FiDownload /> {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="max-w-3xl mx-auto p-6 print:p-0 print:max-w-full">
        <div ref={printRef}
          className="overflow-hidden rounded-none bg-[#fce4f3] shadow-sm print:shadow-none">

          {/* School header */}
          <div className="bg-[#a13ea1] px-8 py-7 text-white">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/70 text-2xl font-black">
                  RG
                </div>
                <div>
                  <h1 className="font-jost text-xl font-black tracking-wide">ROYAL GEM MATHEMATICAL</h1>
                  <p className="mt-1 font-dm-sans text-xs uppercase tracking-[0.18em] text-white/80">Nurturing to Flourish</p>
                </div>
              </div>
              <p className="max-w-[230px] text-right font-dm-sans text-[10px] leading-4 text-white/90">
                Sales and Distribution of Educational Materials, After School Lesson, Tutorial for External Exams, Mathematics Improvement Services and On-the-job Training for Teachers
              </p>
            </div>
            <p className="mt-5 font-jost text-lg font-black">SCHOOL RECEIPT No: {receipt.receiptNumber}</p>
          </div>

          <div className="border-b-2 border-white bg-white px-8 py-2 font-dm-sans text-[9px] leading-4 text-gray-700">
            15, Royal Gem Avenue, Ayonnusi Estate, Off Sagamu Road, Ikorodu, Lagos State. Annex: 6 Main Street, Suncity Estate, Galadimawa, Abuja<br />
            Tel: 09065650959, 07037199498, 08034091055. Email: school.royalgem@gmail.com
          </div>

          <div className="flex items-center justify-between px-8 pt-8">
            <span className="bg-[#a13ea1] px-4 py-2 font-jost text-lg font-black text-white">OFFICIAL RECEIPT</span>
            <span className="font-jost font-bold text-gray-800">Date: {fmtDate(receipt.issuedAt)}</span>
          </div>

          <div className="space-y-4 px-8 pt-8 font-jost text-base text-gray-900">
            <p><strong className="text-[#a13ea1]">Received from;</strong> <b>{receipt.payerName || student.parentName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "—"}</b></p>
            <p><strong className="text-[#a13ea1]">The sum of;</strong> <b>{amountInWords(receipt.amount)}</b></p>
            <p><strong className="text-[#a13ea1]">Being payment for;</strong> <b>{receipt.description || `${student.firstName || ""} ${student.lastName || ""} ${receipt.term || ""} ${receipt.session || ""} School Fees`}</b></p>
          </div>

          <div className="flex items-center justify-between gap-8 px-8 py-7">
            <div className="border-2 border-[#a13ea1] bg-[#ffd1e9] px-5 py-3 font-jost text-2xl font-black text-gray-900">
              N{Number(receipt.amount || 0).toLocaleString("en-NG")}
            </div>
            <div className="text-right font-jost text-xl font-bold italic text-[#a13ea1]">For: Royal Gem</div>
          </div>

          {/* Fee items */}
          <div className="mx-8 grid grid-cols-3 gap-1">
            <div className="h-3 bg-[#a13ea1]" /><div className="h-3 bg-[#f8c6d9]" /><div className="h-3 bg-[#a13ea1]" />
          </div>

          {/* Payment summary */}
          <div className="grid grid-cols-3 gap-4 px-8 py-5 font-dm-sans text-[10px] text-gray-700">
            <div><b className="block text-[#a13ea1]">ADDRESS</b>6, Main Street, Suncity Estate, Galadimawa, Abuja</div>
            <div><b className="block text-[#a13ea1]">TELEPHONE</b>+2348034091055<br />+2347037199498</div>
            <div><b className="block text-[#a13ea1]">EMAILS</b>school.royalgem@gmail.com</div>
          </div>

          {/* Footer */}
          <div className="h-8 bg-[#a13ea1]" />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:bg-white, .print\\:bg-white * { visibility: visible; }
          .print\\:bg-white { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}