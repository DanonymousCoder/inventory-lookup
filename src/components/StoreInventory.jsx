import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import Papa from "papaparse";
import { Search, Package, X, Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

// Sample demonstration inventory (Nigerian market essentials matching the search tags in the prompt)
const DEMO_INVENTORY = [
  {
    "Primary Name": "Indomie Instant Noodles (Super Pack)",
    "Aliases/Tags": "indomie noodles pasta food",
    "Size/Variant": "120g x 40 Cartons",
    "Price": "₦18,500",
    "Image URL": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop&q=80"
  },
  {
    "Primary Name": "Kings Vegetable Oil (Ororo)",
    "Aliases/Tags": "ororo cooking oil vegetable oil devon kings",
    "Size/Variant": "5 Litres",
    "Price": "₦14,200",
    "Image URL": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80"
  },
  {
    "Primary Name": "Golden Terra Soya Oil",
    "Aliases/Tags": "ororo soya oil terra cooking oil",
    "Size/Variant": "1 Litre Pouch",
    "Price": "₦2,800",
    "Image URL": ""
  },
  {
    "Primary Name": "Peak Full Cream Evaporated Milk",
    "Aliases/Tags": "peak milk tin peak wapco dairy",
    "Size/Variant": "150g Tin",
    "Price": "₦950",
    "Image URL": ""
  },
  {
    "Primary Name": "Milo Chocolate Malt Drink",
    "Aliases/Tags": "milo nestle beverage cocoa drink",
    "Size/Variant": "500g Refill",
    "Price": "₦3,400",
    "Image URL": ""
  },
  {
    "Primary Name": "Dangote Refined Granulated Sugar",
    "Aliases/Tags": "sugar sweet dangote white sugar",
    "Size/Variant": "1kg",
    "Price": "₦1,900",
    "Image URL": ""
  },
  {
    "Primary Name": "Golden Penny Semovita",
    "Aliases/Tags": "semo semovita swallow flour golden penny",
    "Size/Variant": "2kg Bag",
    "Price": "₦3,200",
    "Image URL": ""
  },
  {
    "Primary Name": "Gala Sausage Roll",
    "Aliases/Tags": "gala beef sausage snack uac",
    "Size/Variant": "Carton of 96",
    "Price": "₦19,200",
    "Image URL": ""
  }
];

export default function StoreInventory() {
  const [inventory, setInventory] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // The published CSV link for your Google Sheet
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_z2-cTa5Zc5EMxWLv0-w81hIX2D5oez8Vdjw2Av2TCcGwxQgrwI0pTqebMgHhMLZ4sMJfQ_h7KLuz/pub?gid=0&single=true&output=csv";

  const fetchInventory = () => {
    setLoading(true);
    setError(null);
    setUsingDemoData(false);
    
    // Add timestamp parameter to prevent browser caching stale CSV responses
    const urlWithCacheBuster = `${SHEET_CSV_URL}&_cb=${Date.now()}`;
    
    Papa.parse(urlWithCacheBuster, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Check if Google returned HTML login page instead of CSV
        const firstRow = results.data[0];
        const looksLikeHtml = firstRow && Object.keys(firstRow).some(k => k.includes("<") || k.includes("html") || k.includes("doctype"));

        if (looksLikeHtml || results.data.length === 0) {
          setError("Google Sheet requires public permissions. File > Share > Publish to web.");
          setInventory(DEMO_INVENTORY);
          setUsingDemoData(true);
        } else {
          setInventory(results.data);
        }
        setLoading(false);
      },
      error: (err) => {
        setError("Failed to load live spreadsheet. Switched to demo items.");
        setInventory(DEMO_INVENTORY);
        setUsingDemoData(true);
        setLoading(false);
      }
    });
  };

  // Fetch data when the app loads
  useEffect(() => {
    fetchInventory();
  }, []);

  // Initialize Fuse.js for fuzzy searching across names and aliases
  const fuse = useMemo(() => {
    return new Fuse(inventory, {
      keys: ["Primary Name", "Aliases/Tags"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [inventory]);

  const results = query 
    ? fuse.search(query).map(result => result.item) 
    : inventory;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-10 p-4 border-b border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              Store Lookup
            </h1>
            <div className="flex items-center gap-2">
              {usingDemoData && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3" /> Demo Mode
                </span>
              )}
              <button 
                onClick={fetchInventory} 
                className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors active:scale-95"
                title="Sync Latest Prices"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-green-600' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-all"
              placeholder="Search items (e.g., 'ororo', 'indomie')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 mt-2">
        {/* Banner if Google Sheets needs publishing */}
        {error && (
          <div className="mb-4 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
              <p className="text-amber-700 mt-0.5 leading-relaxed">
                In Google Sheets, go to <span className="font-semibold">File &rarr; Share &rarr; Publish to web</span> &rarr; Select <span className="font-semibold">CSV</span> and set access to anyone with the link.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-600" />
            <p className="text-sm font-medium">Syncing latest prices from spreadsheet...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="font-medium">No items found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-gray-400 mt-1">Try another keyword or alias</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>Showing {results.length} {results.length === 1 ? 'item' : 'items'}</span>
              {query && <span>Filtered by &ldquo;{query}&rdquo;</span>}
            </div>

            {results.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-all hover:shadow-sm hover:border-gray-200"
              >
                {item["Image URL"] ? (
                  <img 
                    src={item["Image URL"]} 
                    alt={item["Primary Name"] || "Item"} 
                    className="w-12 h-12 rounded-lg object-cover mr-3 bg-gray-50 border border-gray-100"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                <div className="flex-1 pr-4 min-w-0">
                  <h3 className="font-bold text-base leading-snug text-gray-900 truncate">
                    {item["Primary Name"]}
                  </h3>
                  {item["Size/Variant"] && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        {item["Size/Variant"]}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-gray-900 tracking-tight">
                    {item["Price"]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
