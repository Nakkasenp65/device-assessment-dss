import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Zap,
  BarChart3,
  BrainCircuit,
  ScanLine,
  Check,
  Cpu,
  Battery,
  Wifi,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="bg-[#020617] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Hero Section - Side by Side */}
      <section className="relative min-h-screen pt-36 lg:pt-20 flex items-center px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020617] to-[#020617]"></div>
        <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-2000" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-1000 fade-in order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-sm font-medium text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md cursor-default">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
              <span>Intelligent Decision Support System</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
              ประเมินสภาพมือถือ
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-gradient bg-300%">
                อย่างมืออาชีพ
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              ยกระดับมาตรฐานการตรวจสอบด้วยระบบ
              <span className="text-white font-medium"> AHP Algorithm</span>
              ที่ช่วยวิเคราะห์ทุกจุดสำคัญ ทั้งสภาพภายนอกและประสิทธิภาพภายใน เพื่อผลลัพธ์ที่เชื่อถือได้
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/assessment/brand">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-white text-black px-8 text-lg font-bold transition-all hover:bg-cyan-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                >
                  เริ่มการประเมิน
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                >
                  ดูตัวอย่างรายงาน
                </Button>
              </Link>
            </div>

            {/* Stats / Badges */}
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-zinc-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <span>Standardized Criteria</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual / Scanner Animation */}
          <div className="relative order-1 lg:order-2 flex justify-center animate-in zoom-in slide-in-from-right-10 duration-1000 fade-in delay-200">
            {/* Abstract Phone Frame */}
            <div className="relative w-[300px] h-[600px] bg-black border-4 border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-sm z-10 mx-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>{" "}
              {/* Notch */}
              {/* Screen Content */}
              <div className="absolute inset-0 bg-zinc-950 flex flex-col p-6 pt-16 space-y-4">
                {/* Header Pulse */}
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse">
                    <ScanLine className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-xs text-cyan-500 font-mono">SCANNING...</div>
                </div>

                {/* Scanning Items */}
                <div className="space-y-4">
                  <ScanItem icon={<Smartphone />} label="Physical Body" delay="delay-[0ms]" />
                  <ScanItem icon={<Cpu />} label="Processor Performance" delay="delay-[1000ms]" />
                  <ScanItem icon={<Battery />} label="Battery Health" delay="delay-[2000ms]" />
                  <ScanItem icon={<Wifi />} label="Connectivity" delay="delay-[3000ms]" />
                </div>

                {/* Result Card (Pops up at end) */}
                <div className="mt-auto bg-gradient-to-br from-cyan-900/50 to-blue-900/50 p-4 rounded-xl border border-cyan-500/20 animate-in slide-in-from-bottom duration-1000 fill-mode-forwards delay-[4000ms] opacity-0">
                  <div className="text-xs text-zinc-400 mb-1">การประเมินสภาพ</div>
                  <div className="text-2xl font-bold text-white">ผลลัพธ์ดีเยี่ยม</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full w-[92%] shadow-[0_0_10px_#22d3ee]"></div>
                  </div>
                </div>
              </div>
              {/* Scanning Beam */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/80 shadow-[0_0_15px_4px_rgba(6,182,212,0.4),0_0_40px_10px_rgba(6,182,212,0.15)] animate-scan pointer-events-none z-30" />
            </div>

            {/* Decorative Elements behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] border border-white/5 rounded-[3.5rem] rotate-6 animate-pulse z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] border border-cyan-500/10 rounded-[3.5rem] -rotate-6 z-0"></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600 hidden lg:block">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 bg-black/40 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">วิเคราะห์ด้วยหลักการทางวิทยาศาสตร์</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              ระบบ DSS ของเราใช้เกณฑ์การตัดสินใจแบบพหุเกณฑ์ (MCDM) เพื่อผลลัพธ์ที่เชื่อถือได้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-cyan-400" />}
              title="AHP Methodology"
              desc="ใช้กระบวนการลำดับชั้นเชิงวิเคราะห์ (AHP) ในการถ่วงน้ำหนักความสำคัญลดความลำเอียงในการตัดสินใจ"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-indigo-400" />}
              title="Structured Assessment"
              desc="โครงสร้างการประเมินที่ชัดเจน ครอบคลุมทั้งสภาพภายนอก (Physical), การใช้งาน (Functional), และอายุการใช้งาน"
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-purple-400" />}
              title="Fast & Accurate"
              desc="ประมวลผลข้อมูลรวดเร็ว ให้คำแนะนำที่แม่นยำสำหรับการตัดสินใจซื้้อ-ขาย"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-sm text-zinc-600 border-t border-white/5 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-zinc-400">
            <Smartphone className="h-5 w-5" />
            <span>SmartDSS</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Smartphone Condition DSS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ScanItem({ icon, label, delay }: { icon: any; label: string; delay: string }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 opacity-0 animate-in fade-in slide-in-from-left duration-700 fill-mode-forwards ${delay}`}
    >
      <div className="text-zinc-400">{icon}</div>
      <div className="flex-1 text-sm text-zinc-200">{label}</div>
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-green-500" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div
      className={`p-8 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 group`}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-cyan-500/10 border border-white/5 group-hover:border-cyan-500/20">
        {icon}
      </div>
      <h3 className="font-bold text-2xl mb-4 text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 leading-relaxed font-light text-lg">{desc}</p>
    </div>
  );
}
