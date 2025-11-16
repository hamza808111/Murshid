import { supabase } from "./supabase";
import type { Post, Answer, CreatePostRequest, CreateAnswerRequest } from "@/types/community";

type CommunityAuthor = {
  id: string;
  name?: string;
  role?: string;
  establishment_name?: string;
  track?: string;
  level?: string;
  university_id?: string;
  avatar_url?: string;
  is_admin?: boolean;
};

const mapPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  content: row.content,
  author_id: row.author_id,
  author_name: row.author_name ?? "Anonymous",
  author_avatar: row.author_avatar,
  author_role: (row.author_role ?? "student") as Post["author_role"],
  author_university: row.author_university ?? undefined,
  author_major: row.author_major ?? undefined,
  author_academic_level: row.author_academic_level ?? undefined,
  post_type: row.post_type,
  tags: row.tags ?? [],
  major_tags: row.major_tags ?? [],
  university_tags: row.university_tags ?? [],
  likes_count: row.likes_count ?? 0,
  answers_count: row.answers_count ?? 0,
  views_count: row.views_count ?? 0,
  is_solved: row.is_solved ?? false,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapAnswer = (row: any): Answer => ({
  id: row.id,
  post_id: row.post_id,
  content: row.content,
  author_id: row.author_id,
  author_name: row.author_name ?? "Anonymous",
  author_avatar: row.author_avatar,
  author_role: (row.author_role ?? "student") as Answer["author_role"],
  author_university: row.author_university ?? undefined,
  author_major: row.author_major ?? undefined,
  author_academic_level: row.author_academic_level ?? undefined,
  likes_count: row.likes_count ?? 0,
  is_accepted: row.is_accepted ?? false,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const getNormalizedRole = (author: CommunityAuthor): Post["author_role"] => {
  if (author.is_admin) return "admin";
  const role = author.role?.toLowerCase();
  if (role === "specialist") return "specialist";
  return "student";
};

export async function getCommunityPosts(params?: { search?: string; type?: "all" | "questions" | "discussions" | "announcements" }): Promise<Post[]> {
  let query = supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.type && params.type !== "all") {
    const typeMap: Record<string, string> = {
      questions: "question",
      discussions: "discussion",
      announcements: "announcement",
    };
    query = query.eq("post_type", typeMap[params.type]);
  }

  if (params?.search) {
    const search = params.search.trim();
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }

  return (data ?? []).map(mapPost);
}

export async function getCommunityPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    throw error;
  }

  return data ? mapPost(data) : null;
}

export async function createCommunityPost(payload: CreatePostRequest, author: CommunityAuthor): Promise<Post> {
  const normalizedRole = getNormalizedRole(author);
  const safePostType = normalizedRole === "student" ? "question" : payload.post_type;

  const { data, error } = await supabase
    .from("community_posts")
    .insert([
      {
        title: payload.title,
        content: payload.content,
        post_type: safePostType,
        tags: payload.tags ?? [],
        major_tags: payload.major_tags ?? [],
        university_tags: payload.university_tags ?? [],
        author_id: author.id,
        author_name: author.name ?? "Anonymous",
        author_role: normalizedRole,
        author_university: author.establishment_name ?? author.university_id,
        author_major: author.track,
        author_academic_level: author.level,
        author_avatar: author.avatar_url,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating community post:", error);
    throw new Error(error.message || "Failed to create community post");
  }

  return mapPost(data);
}

export async function getPostAnswers(postId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("community_answers")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }

  return (data ?? []).map(mapAnswer);
}

export async function createCommunityAnswer(payload: CreateAnswerRequest, author: CommunityAuthor): Promise<Answer> {
  const normalizedRole = getNormalizedRole(author);

  const { data, error } = await supabase
    .from("community_answers")
    .insert([
      {
        post_id: payload.post_id,
        content: payload.content,
        author_id: author.id,
        author_name: author.name ?? "Anonymous",
        author_role: normalizedRole,
        author_university: author.establishment_name ?? author.university_id,
        author_major: author.track,
        author_academic_level: author.level,
        author_avatar: author.avatar_url,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating answer:", error);
    throw new Error(error.message || "Failed to create answer");
  }

  return mapAnswer(data);
}

export async function getCommunityPostsByAuthor(authorId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching author posts:", error);
    throw error;
  }

  return (data ?? []).map(mapPost);
}

export async function getCommunityAnswersByAuthor(authorId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("community_answers")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching author answers:", error);
    throw error;
  }

  return (data ?? []).map(mapAnswer);
}

export async function deleteCommunityPost(postId: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
