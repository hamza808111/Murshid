import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { updateCommunityPost } from "@/lib/communityApi";
import type { Post, UpdatePostRequest } from "@/types/community";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedPost: Post) => void;
}

export const EditPostModal = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}: EditPostModalProps) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { language } = useI18n();

  // Reset form when modal opens with new post
  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags.join(", "));
    }
  }, [isOpen, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast.error(language === "ar" ? "العنوان مطلوب" : "Title is required");
      return;
    }

    if (!trimmedContent) {
      toast.error(language === "ar" ? "المحتوى مطلوب" : "Content is required");
      return;
    }

    if (trimmedTitle.length < 10) {
      toast.error(
        language === "ar"
          ? "العنوان قصير جداً (10 أحرف على الأقل)"
          : "Title is too short (minimum 10 characters)"
      );
      return;
    }

    if (trimmedContent.length < 20) {
      toast.error(
        language === "ar"
          ? "المحتوى قصير جداً (20 حرف على الأقل)"
          : "Content is too short (minimum 20 characters)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload: UpdatePostRequest = {
        title: trimmedTitle,
        content: trimmedContent,
        tags: parsedTags,
        major_tags: post.major_tags,
        university_tags: post.university_tags,
      };

      const updatedPost = await updateCommunityPost(post.id, payload);

      toast.success(
        language === "ar"
          ? "تم تحديث المنشور بنجاح"
          : "Post updated successfully"
      );

      onSuccess?.(updatedPost);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(
        language === "ar"
          ? "فشل في تحديث المنشور"
          : "Failed to update post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === "ar" ? "تعديل المنشور" : "Edit Post"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "عدل عنوان ومحتوى منشورك"
              : "Edit your post title and content"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-post-title">
              {language === "ar" ? "العنوان" : "Title"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === "ar" ? "عنوان المنشور..." : "Post title..."}
              disabled={isSubmitting}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {title.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-post-content">
              {language === "ar" ? "المحتوى" : "Content"} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === "ar"
                  ? "اكتب محتوى منشورك هنا..."
                  : "Write your post content here..."
              }
              className="min-h-[200px] resize-none"
              disabled={isSubmitting}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}/5000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-post-tags">
              {language === "ar" ? "الوسوم" : "Tags"}
            </Label>
            <Input
              id="edit-post-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={
                language === "ar"
                  ? "وسم1, وسم2, وسم3"
                  : "tag1, tag2, tag3"
              }
              disabled={isSubmitting}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === "ar"
                ? "افصل الوسوم بفاصلة"
                : "Separate tags with commas"}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                language === "ar" ? "حفظ التغييرات" : "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
