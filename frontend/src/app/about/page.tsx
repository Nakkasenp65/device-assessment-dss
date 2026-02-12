import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  Zap,
  BarChart3,
  LayoutDashboard,
  LogIn,
  User,
  BrainCircuit,
  Scale,
  Network,
  Users,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AboutPage() {
  const user = await getSession();

  return (
    <div className="bg-[#020617] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden min-h-screen">
      {/* Hero Section - Compact */}
      <section className="relative pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]"></div>

        <div className="relative z-10 max-w-4xl space-y-6 animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-md">
            <Target className="w-4 h-4" />
            <span>ภารกิจของเรา</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl">
            สร้างมาตรฐานความเชื่อมั่น
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
              ในทุกการประเมิน
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
            SmartDSS
            พัฒนาขึ้นเพื่อแก้ปัญหาความไม่ชัดเจนในการประเมินราคาสมาร์ทโฟนมือสอง
            ด้วยการนำเทคโนโลยีและหลักการทางวิทยาศาสตร์มาใช้
            เพื่อความเป็นธรรมสำหรับทุกคน
          </p>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="relative z-10 py-20 bg-black/20 backdrop-blur-md border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in slide-in-from-left duration-1000">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <BrainCircuit className="w-8 h-8 text-cyan-400" />
                หลักการทำงาน (How It Works)
              </h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                ระบบใช้กระบวนการ{" "}
                <strong>Analytic Hierarchy Process (AHP)</strong>{" "}
                ซึ่งเป็นเครื่องมือตัดสินใจทางคณิตศาสตร์
                ในการคำนวณน้ำหนักความสำคัญของปัจจัยต่างๆ
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <span className="font-bold text-cyan-400">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      กำหนดเกณฑ์ (Criteria)
                    </h3>
                    <p className="text-sm text-zinc-400">
                      แบ่งเกณฑ์เป็น สภาพภายนอก, การใช้งาน, และอายุเครื่อง
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <span className="font-bold text-cyan-400">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      เปรียบเทียบความสำคัญ (Pairwise Comparison)
                    </h3>
                    <p className="text-sm text-zinc-400">
                      ผู้เชี่ยวชาญกำหนดน้ำหนักความสำคัญของแต่ละคู่ปัจจัย
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <span className="font-bold text-cyan-400">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      ประมวลผล (Synthesis)
                    </h3>
                    <p className="text-sm text-zinc-400">
                      คำนวณคะแนนรวมเพื่อระบุสภาพเกรดและราคาที่เหมาะสม
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative animate-in slide-in-from-right duration-1000 delay-200">
              {/* Visual Diagram Placeholder */}
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse" />

                {/* Diagram Nodes */}
                <div className="relative z-10 flex justify-center">
                  <div className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    Goal: Smartphone Value
                  </div>
                </div>

                <div className="relative z-10 flex justify-between gap-4 mt-8">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                    <div className="text-sm font-bold">Physical</div>
                    <div className="text-xs text-zinc-500">30-40%</div>
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm font-bold">Functional</div>
                    <div className="text-xs text-zinc-500">40-50%</div>
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-sm font-bold">Age</div>
                    <div className="text-xs text-zinc-500">10-20%</div>
                  </div>
                </div>

                {/* Connecting Lines (CSS borders imply connections) */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
                <div className="absolute top-1/3 left-1/4 w-[50%] h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Context */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300">
          <Users className="w-4 h-4" />
          <span>ผู้จัดทำ</span>
        </div>
        <h2 className="text-3xl font-bold">ส่วนหนึ่งของโครงการวิจัย</h2>
        <p className="text-zinc-400 text-lg">
          ระบบนี้เป็นส่วนหนึ่งของวิทยานิพนธ์ (Thesis) เพื่อการศึกษา
          <br />
          มุ่งเน้นการประยุกต์ใช้ทฤษฎีการตัดสินใจเพื่อแก้ปัญหาในชีวิตจริง
        </p>

        <Link href="/">
          <Button
            size="lg"
            className="mt-8 rounded-full h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold transition-transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> กลับสู่หน้าหลัก
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-sm text-zinc-600 border-t border-white/5 bg-[#020617]">
        <p>
          &copy; {new Date().getFullYear()} Smartphone Condition DSS. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
