"use client";

import { useUser } from "@/hooks/useUser";
import { useAssessments } from "@/hooks/useAssessments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useUser();

  console.log(user);

  const { data: assessments = [], isLoading: isAssessmentsLoading } =
    useAssessments();

  const loading = isUserLoading || isAssessmentsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-4">
        <p>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ</p>
        <Link href="/login">
          <Button>เข้าสู่ระบบ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-zinc-100 p-6 md:p-12 ">
      <div className="max-w-4xl mx-auto space-y-8 pt-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            โปรไฟล์
          </h1>
        </div>

        {/* User Info Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <span className="text-xl font-bold text-cyan-400">
                  {user.data.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-lg">{user.data.email}</div>
                <div className="text-sm text-zinc-400 font-normal">
                  ID: {user.data.id}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Assessment History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Assessment History
          </h2>

          {assessments.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <p className="text-zinc-500 mb-4">
                You haven't performed any assessments yet.
              </p>
              <Link href="/assessment/brand">
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full">
                  Start New Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {assessments.map((assessment: any) => (
                <Card
                  key={assessment.id}
                  className="bg-white/5 border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                >
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg group-hover:text-cyan-400 transition-colors">
                        {assessment.model?.brand?.name} {assessment.model?.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(assessment.created_at), "PPP")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {format(new Date(assessment.created_at), "p")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          assessment.status === "completed"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {assessment.status.toUpperCase()}
                      </div>

                      {/* We could add a button to view details if we implemented that page */}
                      <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/10 hover:text-white"
                        size="sm"
                        asChild
                      >
                        <Link href={`/assessment/result?id=${assessment.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
