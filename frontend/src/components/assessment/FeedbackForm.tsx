"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/api/feedback";
import { toast } from "sonner";

interface FeedbackFormProps {
  assessmentId: number;
  existingFeedback?: {
    rate: number;
    comment: string | null;
  };
}

export function FeedbackForm({ assessmentId, existingFeedback }: FeedbackFormProps) {
  const [rating, setRating] = useState(existingFeedback?.rate || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        assessment_id: assessmentId,
        rate: rating,
        comment,
      });
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-3">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"}`}
            />
          ))}
        </div>
        <p className="text-zinc-300 font-medium">Thank you for your feedback!</p>
        {comment && <p className="text-zinc-500 text-sm italic">"{comment}"</p>}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-lg text-white">Rate this Assessment</h3>
      </div>

      <div className=" flex flex-col gap-4">
        <div className="flex gap-2 ">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="cursor-pointer focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-600 hover:text-yellow-400/50"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Optional comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 resize-none h-24"
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}
