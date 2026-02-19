"use client";

import { useRouter } from "next/navigation";
import { useBrands, useBrandModels } from "@/hooks/useBrands";
import { useAssessment } from "@/context/AssessmentContext";
import { Loader2, Smartphone, Cpu, CheckCircle2, HardDrive, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  release_year: number;
  brand_id: number;
}

const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024];

export default function DeviceSelectionPage() {
  const { state, setBrand, setModel, setStorageGb } = useAssessment();
  const router = useRouter();

  const { data: brands = [], isLoading: loadingBrands } = useBrands();

  const { data: models = [], isLoading: loadingModels } = useBrandModels(state.selectedBrand?.id);

  const handleBrandChange = (brandName: string) => {
    const selected = brands.find((b: Brand) => b.name === brandName);
    if (selected) {
      setBrand(selected);
    }
  };

  const handleModelChange = (modelName: string) => {
    const selected = models.find((m: Model) => m.name === modelName);
    if (selected) {
      setModel(selected);
    }
  };

  const handleStorageChange = (value: string) => {
    setStorageGb(Number(value));
  };

  const handleContinue = () => {
    if (state.selectedBrand && state.selectedModel) {
      router.push("/assessment/condition");
    }
  };

  if (loadingBrands) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-6 py-12 items-center min-h-[80vh]">
      {/* LEFT COLUMN: FORM */}
      <div className="space-y-8 animate-in slide-in-from-left duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <Smartphone className="w-3 h-3" />
            ASSESSMENT STEP 1
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            เริ่มการประเมินของคุณ
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
            เลือกรายละเอียดอุปกรณ์ของคุณด้านล่าง ระบบของเราจะวิเคราะห์ข้อมูลเพื่อประเมินสภาพที่แม่นยำที่สุด
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-xl shadow-2xl">
          {/* Brand Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              แบรนด์ (Brand)
            </label>
            <Select onValueChange={handleBrandChange} value={state.selectedBrand?.name || ""}>
              <SelectTrigger className="cursor-pointer w-full bg-black/40 border-white/10 text-white h-12 rounded-xl focus:ring-cyan-500/50">
                <SelectValue placeholder="เลือกแบรนด์..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f36] border-white/10 text-white">
                {brands.map((brand: Brand) => (
                  <SelectItem key={brand.id} value={brand.name} className="focus:bg-cyan-500/20 focus:text-cyan-300">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              รุ่น (Model)
            </label>
            <Select
              onValueChange={handleModelChange}
              value={state.selectedModel?.name || ""}
              disabled={!state.selectedBrand || loadingModels}
            >
              <SelectTrigger className="cursor-pointer w-full bg-black/40 border-white/10 text-white h-12 rounded-xl focus:ring-cyan-500/50 disabled:opacity-50">
                <SelectValue
                  placeholder={
                    !state.selectedBrand ? "กรุณาเลือกแบรนด์ก่อน..." : loadingModels ? "กำลังโหลด..." : "เลือกรุ่น..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f36] border-white/10 text-white max-h-[300px]">
                {models.map((model: Model) => (
                  <SelectItem key={model.id} value={model.name} className="focus:bg-cyan-500/20 focus:text-cyan-300">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Storage Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-500" />
              ความจุ (Storage)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STORAGE_OPTIONS.map((gb) => {
                const isSelected = state.storage_gb === gb;
                return (
                  <button
                    key={gb}
                    onClick={() => handleStorageChange(gb.toString())}
                    className={`cursor-pointer py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/20"
                        : "bg-black/40 border-white/10 text-zinc-400 hover:border-cyan-500/30 hover:text-zinc-300"
                    }`}
                  >
                    {gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!state.selectedBrand || !state.selectedModel}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            ดำเนินการต่อ <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-xs text-center text-zinc-500">
            ระบบจะวิเคราะห์ข้อมูลโมเดลเพื่อกำหนดเกณฑ์การประเมินที่เหมาะสม
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: VISUAL */}
      <div className="relative hidden lg:flex items-center justify-center animate-in slide-in-from-right duration-700 delay-200">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 rounded-full blur-[100px]" />

        <div className="relative w-full max-w-[400px] aspect-[4/5] bg-gradient-to-br from-[#1a1f36] to-[#0d101b] rounded-[3rem] border border-white/10 shadow-2xl p-8 flex flex-col justify-between overflow-hidden group">
          {/* Phone Frame Look */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

          {/* Dynamic Content Overlay */}
          <div className="z-10 relative h-full flex flex-col items-center justify-center space-y-8">
            {/* Device ID Pill */}
            <div className="absolute top-0 right-0 py-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-500 font-mono">
                Device ID: --
              </span>
            </div>

            {/* Central Phone Graphic (Abstract) */}
            <div className="relative w-48 h-80 bg-gradient-to-b from-zinc-800 to-black rounded-[2.5rem] shadow-2xl border-[4px] border-zinc-700 flex items-center justify-center overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />

              {/* Screen Content */}
              <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center text-zinc-700 relative">
                {state.selectedBrand && (
                  <div className="absolute top-10 w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-2xl font-bold text-cyan-400 animate-in zoom-in">
                    {state.selectedBrand.name.substring(0, 1)}
                  </div>
                )}
                {!state.selectedBrand && <Smartphone className="w-12 h-12 opacity-20" />}
              </div>
            </div>

            {/* Floating Badges */}
            {state.selectedBrand && (
              <div className="absolute top-32 right-[-20px] bg-[#1e293b] border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-right">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">แบรนด์</div>
                  <div className="font-bold text-white text-sm">{state.selectedBrand.name}</div>
                </div>
              </div>
            )}

            {state.selectedModel && (
              <div className="absolute bottom-20 left-[-20px] bg-[#1e293b] border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-left delay-100">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">รุ่น</div>
                  <div className="font-bold text-white text-sm">{state.selectedModel.name}</div>
                </div>
              </div>
            )}

            {state.storage_gb > 0 && (
              <div className="absolute bottom-4 right-[-10px] bg-[#1e293b] border border-white/10 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right delay-200">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">
                  {state.storage_gb >= 1024 ? `${state.storage_gb / 1024} TB` : `${state.storage_gb} GB`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
