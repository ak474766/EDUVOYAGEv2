import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../@/components/ui/dialog";
import { Input } from "../../../@/components/ui/input";
import { Switch } from "../../../@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../@/components/ui/select";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../@/components/ui/textarea";
import { Sparkle, Loader2Icon } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function AddNewCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [enhancingDescription, setEnhancingDescription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    noOfChapters: 1,
    includeVideo: false,
    level: "",
    catagory: "",
  });
  const router = useRouter();
  const isFormValid =
    formData?.name?.trim()?.length > 0 &&
    Number(formData?.noOfChapters) >= 1 &&
    Number(formData?.noOfChapters) <= 6 &&
    String(formData?.level || "").length > 0;

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    console.log(formData);
  };

  const enhanceDescription = async () => {
    if (!formData.description.trim() || enhancingDescription) return;

    try {
      setEnhancingDescription(true);
      const result = await axios.post("/api/prompt-enhancement", {
        text: formData.description,
        context: "course description for an educational platform",
      });

      if (result.data.success) {
        setFormData((prev) => ({
          ...prev,
          description: result.data.enhancedText,
        }));
        toast.success("Course description enhanced successfully!");
      } else {
        toast.error("Failed to enhance description. Please try again.");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      if (error.response?.data?.error === "api_key_error") {
        toast.error(
          "API key is invalid or missing. Please check your configuration."
        );
      } else if (error.response?.data?.error === "quota_exceeded") {
        toast.error("API quota exceeded. Please try again later.");
      } else if (error.response?.data?.error === "ai_service_error") {
        toast.error(
          "AI service is currently unavailable. Please try again later."
        );
      } else {
        toast.error("Failed to enhance description. Please try again.");
      }
    } finally {
      setEnhancingDescription(false);
    }
  };

  const onGenerate = async () => {
    console.log(formData);
    const courseId = uuidv4();
    try {
      setLoading(true);
      const result = await axios.post("/api/generate-course-layout", {
        ...formData,
        courseId: courseId,
      });

      // Handle different response types
      if (result.data.error === "limit_exceeded") {
        toast.error(result.data.message);
        setOpen(false); // Close dialog
        setTimeout(() => {
          router.push("/workspace/billing");
        }, 100);
        return;
      }

      if (result.data.error === "warning") {
        toast.warning(result.data.message);
        // Continue with course generation
      }

      if (result.data.courseId) {
        // Success case
        if (result.data.message) {
          toast.success(result.data.message);
        }
        setOpen(false); // Close dialog
        setTimeout(() => {
          router.push("/workspace/edit-course/" + result.data.courseId);
        }, 100);
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);

      // Handle API errors
      if (e.response?.data?.error === "limit_exceeded") {
        toast.error(e.response.data.message);
        setOpen(false); // Close dialog
        setTimeout(() => {
          router.push("/workspace/billing");
        }, 100);
      } else if (e.response?.data?.error === "warning") {
        toast.warning(e.response.data.message);
      } else if (e.response?.data?.error === "api_key_error") {
        toast.error(
          "API key is invalid or missing. Please check your configuration."
        );
      } else if (e.response?.data?.error === "quota_exceeded") {
        toast.error("API quota exceeded. Please try again later.");
      } else if (e.response?.data?.error === "ai_service_error") {
        toast.error(
          "AI service is currently unavailable. Please try again later."
        );
      } else if (e.response?.data?.error === "generation_failed") {
        toast.error("Failed to generate course. Please try again.");
      } else if (e.response?.status === 500 || e.response?.status === 503) {
        // API key or server error
        toast.error(
          "API service is currently unavailable. Please check your API key or try again later."
        );
      } else if (
        e.code === "NETWORK_ERROR" ||
        e.message?.includes("Network Error")
      ) {
        toast.error(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        toast.error("Failed to generate course. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="
          sm:max-w-[520px] w-full
          rounded-xl border bg-background/95 backdrop-blur
          shadow-2xl p-0 overflow-hidden
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
        "
      >
        <div className="border-b bg-gradient-to-r from-background to-muted/40 px-6 py-5">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Create New Course Using AI
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Provide basic details and toggle options; everything can be edited
              later.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 mt-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="hidden" aria-hidden="true" />
                <span>Course Name</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <svg className="h-4 w-4 opacity-80" aria-hidden="true" />
                </span>
                <Input
                  className="pl-9 h-10 rounded-md"
                  placeholder="Course Name"
                  value={formData.name}
                  onChange={(event) =>
                    onHandleInputChange("name", event?.target.value)
                  }
                  aria-invalid={!formData.name?.trim()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Give your course a clear and searchable title.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>Course Description (Optional)</span>
                <button
                  type="button"
                  onClick={enhanceDescription}
                  disabled={
                    !formData.description.trim() || enhancingDescription
                  }
                  className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Enhance description with AI"
                >
                  {enhancingDescription ? (
                    <Loader2Icon className="h-4 w-4 animate-spin text-blue-600" />
                  ) : (
                    <Sparkle className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                  )}
                </button>
              </label>
              <div className="relative">
                <Textarea
                  className="min-h-[80px] max-h-[200px] resize-none rounded-md"
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={(event) =>
                    onHandleInputChange("description", event?.target.value)
                  }
                  style={{
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "hsl(var(--muted)) transparent",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optional but recommended. Use the sparkle button to
                auto-enhance.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>No. of Chapters</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <svg className="h-4 w-4 opacity-80" aria-hidden="true" />
                </span>
                <Input
                  className="pl-9 h-10 rounded-md"
                  placeholder="No. of Chapters"
                  type="number"
                  min={1}
                  max={6}
                  step={1}
                  value={formData.noOfChapters}
                  onChange={(event) => {
                    const raw = Number(event?.target.value);
                    const clamped = isNaN(raw)
                      ? 1
                      : Math.max(1, Math.min(6, Math.floor(raw)));
                    onHandleInputChange("noOfChapters", clamped);
                  }}
                />
              </div>
            </div>

            <div
              className="
                flex items-center justify-between gap-3 rounded-lg border bg-muted/30
                px-3 py-2 transition-colors
              "
            >
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>Include Video</span>
              </label>
              <div className="flex items-center gap-2">
                <Switch
                  onCheckedChange={() =>
                    onHandleInputChange("includeVideo", !formData?.includeVideo)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>Difficulty Level</span>
              </label>
              <Select
                className="mt-1"
                onValueChange={(value) => onHandleInputChange("level", value)}
              >
                <SelectTrigger className="w-[200px] h-10 rounded-md focus:ring-2 focus:ring-ring">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>Category</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <svg className="h-4 w-4 opacity-80" aria-hidden="true" />
                </span>
                <Input
                  className="pl-9 h-10 rounded-md"
                  placeholder="Category (comma separated)"
                  value={formData.catagory}
                  onChange={(event) =>
                    onHandleInputChange("catagory", event?.target.value)
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="
                  w-full h-10 rounded-md
                  bg-gradient-to-r from-primary to-primary/80
                  hover:from-primary/90 hover:to-primary/70
                  text-primary-foreground
                  shadow-md transition-all
                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                "
                onClick={onGenerate}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    {/* Loader2 from lucide-react */}
                    <svg className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Generating…</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {/* Sparkles from lucide-react */}
                    <svg className="h-4 w-4" aria-hidden="true" />
                    <span>Generate Course</span>
                  </span>
                )}
              </Button>
              {!isFormValid && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter name, chapters and level to enable generation.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialog;
