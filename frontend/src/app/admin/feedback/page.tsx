"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Star,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface Feedback {
  answer_id: number;
  rate: number;
  comment: string | null;
  created_at: string;
  assessment: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
    model: {
      name: string;
      brand: { name: string };
    };
  };
}

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/assessments/admin/feedback");
        setFeedbackList(response.data.data);
      } catch (error) {
        console.error("Failed to load feedback", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ความคิดเห็นผู้ใช้งาน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            รายการความคิดเห็นทั้งหมดจากผู้ใช้งาน ({feedbackList.length} รายการ)
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Filter className="w-4 h-4" />
            ตัวกรอง
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Download className="w-4 h-4" />
            ส่งออก
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {feedbackList.map((feedback) => (
          <div
            key={feedback.answer_id}
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-zinc-700 transition-colors"
          >
            {/* User Info */}
            <div className="flex items-start gap-4 min-w-[200px]">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white">
                  {feedback.assessment.user?.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {feedback.assessment.user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  {format(new Date(feedback.created_at), "d MMM yyyy, HH:mm")}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= feedback.rate ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-white ml-2">
                  {feedback.rate}.0
                </span>
                <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded-full">
                  ประเมินรุ่น {feedback.assessment.model.brand.name}{" "}
                  {feedback.assessment.model.name}
                </span>
              </div>

              {feedback.comment ? (
                <div className="relative pl-4 border-l-2 border-zinc-700">
                  <p className="text-zinc-300 leading-relaxed">
                    {feedback.comment}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-600 italic text-sm">
                  ไม่มีความคิดเห็นเพิ่มเติม
                </p>
              )}
            </div>
          </div>
        ))}

        {feedbackList.length === 0 && (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">
              ยังไม่มีความคิดเห็น
            </h3>
            <p className="text-zinc-500 mt-2">
              เมื่อผู้ใช้งานส่งความคิดเห็น ข้อมูลจะปรากฏที่นี่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
