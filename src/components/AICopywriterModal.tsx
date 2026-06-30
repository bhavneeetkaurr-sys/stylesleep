import { useState } from "react";
import { Sparkles, Copy, Check, Send, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { Product } from "../types";

interface AICopywriterModalProps {
  products: Product[];
  token: string | null;
  onClose: () => void;
}

export default function AICopywriterModal({
  products,
  token,
  onClose
}: AICopywriterModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [platform, setPlatform] = useState<string>("WhatsApp Status");
  const [tone, setTone] = useState<string>("Luxurious & Persuasive");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProductId) {
      setError("Please select a premium product first.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCaption("");

    try {
      const response = await fetch("/api/reseller/ai-copywriter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProductId,
          platform,
          tone
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate copy.");
      }

      setGeneratedCaption(data.caption);
      if (data.notice) {
        console.warn("AI Note:", data.notice);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during AI generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-luxury-charcoal text-white p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg text-luxury-accent border border-primary/30">
              <Sparkles className="h-5 w-5 fill-luxury-accent" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base sm:text-lg tracking-wide">AI Copywriting Assistant</h3>
              <p className="text-xxs text-white/60 mt-0.5">Generate high-conversion WhatsApp statuses & social posts instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Field: Product selection */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">Select Bedsheet</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/20 bg-white p-2 focus:border-primary focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name.slice(0, 22)}...</option>
                ))}
              </select>
            </div>

            {/* Field: Target Platform */}
            <div>
              <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/20 bg-white p-2 focus:border-primary focus:outline-none"
              >
                <option value="WhatsApp Status">WhatsApp Status</option>
                <option value="Instagram Story">Instagram Story / Reel</option>
                <option value="Facebook Post">Facebook Post</option>
                <option value="Pinterest Pin">Pinterest Pin Description</option>
              </select>
            </div>

            {/* Field: Writing Tone */}
            <div>
              <label className="block text-xs font-semibold text-luxury-charcoal/80 mb-1.5">Copywriting Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs rounded-lg border border-primary/20 bg-white p-2 focus:border-primary focus:outline-none"
              >
                <option value="Luxurious & Persuasive">Luxurious & Elegant</option>
                <option value="Witty & Trendy">Witty & Modern</option>
                <option value="Short & Punchy">Short & Catchy</option>
                <option value="Educational (Textiles Focused)">Fabric-Expert Informative</option>
              </select>
            </div>

          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4.5 w-4.5" />
            {loading ? "Crafting Masterpiece with Gemini AI..." : "Generate Premium Social Copy"}
          </button>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xxs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Output Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-luxury-charcoal/80">
              <span>Generated Content Copy</span>
              {generatedCaption && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-luxury-beige hover:bg-primary hover:text-white rounded text-xxs font-bold text-primary transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Text
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Content Display */}
            <div className="min-h-[220px] bg-luxury-cream border border-primary/10 rounded-xl p-4 relative flex flex-col justify-between">
              {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-xs text-luxury-charcoal/50 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="font-medium">Consulting Gemini 3.5 Flash for high-converting marketing hooks...</p>
                </div>
              ) : generatedCaption ? (
                <pre className="text-xs sm:text-sm text-luxury-charcoal leading-relaxed whitespace-pre-wrap font-sans select-all overflow-y-auto max-h-[260px]">
                  {generatedCaption}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-xs text-luxury-charcoal/40">
                  <FileText className="h-10 w-10 text-primary/30 mb-2" />
                  <p className="font-semibold">Your social media copywriting will appear here.</p>
                  <p className="text-xxs mt-0.5">Configure your parameters above and click generate.</p>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines info box */}
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3 text-xxs text-amber-900 leading-relaxed flex items-start gap-2">
            <Sparkles className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gemini AI Copywriting Advantage:</span>
              Our AI extracts live thread counts, fiber specs (e.g. momme count, sateen weave, staple lengths), and combines them with highly persuasive hooks designed specifically for bedding buyers.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
