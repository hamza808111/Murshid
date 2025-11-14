import { supabase } from "./supabase";

export type PostKind = 'post' | 'question';
export type PostScope = 'global' | 'university' | 'major';

export interface CommunityPost {
  id: string;
  author_id: string;
  kind: PostKind;
  scope: PostScope;
  university_id?: string | null;
  major_id?: string | null;
  title?: string | null;
  content: string;
  created_at: string;
  author?: any;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: any;
}

export async function listPosts(params?: { scope?: PostScope; university_id?: string; major_id?: string; limit?: number; }): Promise<CommunityPost[]> {
  // When a specific university/major is requested, include tagged posts from join tables
  if (params?.scope === 'university' && params.university_id) {
    const uid = params.university_id;
    const q1 = supabase
      .from('posts')
      .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
      .eq('scope', 'university')
      .eq('university_id', uid)
      .order('created_at', { ascending: false });
    const q2 = supabase
      .from('posts_universities')
      .select('post:posts(*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name)))')
      .eq('university_id', uid)
      .order('created_at', { ascending: false });
    const [r1, r2] = await Promise.all([q1, q2]);
    if (r1.error) throw r1.error; if (r2.error) throw r2.error;
    const fromTags = (r2.data || []).map((row: any) => row.post);
    const merged = [...(r1.data || []), ...fromTags];
    const dedup = Object.values(Object.fromEntries(merged.map((p: any) => [p.id, p])));
    return dedup as any;
  }

  if (params?.scope === 'major' && params.major_id) {
    const mid = params.major_id;
    const q1 = supabase
      .from('posts')
      .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
      .eq('scope', 'major')
      .eq('major_id', mid)
      .order('created_at', { ascending: false });
    const q2 = supabase
      .from('posts_majors')
      .select('post:posts(*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name)))')
      .eq('major_id', mid)
      .order('created_at', { ascending: false });
    const [r1, r2] = await Promise.all([q1, q2]);
    if (r1.error) throw r1.error; if (r2.error) throw r2.error;
    const fromTags = (r2.data || []).map((row: any) => row.post);
    const merged = [...(r1.data || []), ...fromTags];
    const dedup = Object.values(Object.fromEntries(merged.map((p: any) => [p.id, p])));
    return dedup as any;
  }

  // Default simple list
  let query = supabase
    .from('posts')
    .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
    .order('created_at', { ascending: false });
  if (params?.scope) query = query.eq('scope', params.scope);
  if (params?.limit) query = query.limit(params.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as CommunityPost[];
}

export async function listPostsForBookmarks(userId: string, limit?: number): Promise<CommunityPost[]> {
  // Fetch bookmarked university and major IDs
  const { data: uniBms, error: e1 } = await supabase
    .from('bookmarks')
    .select('item_id')
    .eq('user_id', userId)
    .eq('item_type', 'university');
  if (e1) throw e1;

  const { data: majorBms, error: e2 } = await supabase
    .from('bookmarks')
    .select('item_id')
    .eq('user_id', userId)
    .eq('item_type', 'major');
  if (e2) throw e2;

  const uniIds = (uniBms || []).map((r: any) => r.item_id);
  const majorIds = (majorBms || []).map((r: any) => r.item_id);

  const qGlobal = supabase
    .from('posts')
    .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
    .eq('scope', 'global')
    .order('created_at', { ascending: false });

  const promises: any[] = [qGlobal];
  if (uniIds.length > 0) {
    const qUniDirect = supabase
      .from('posts')
      .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
      .eq('scope', 'university')
      .in('university_id', uniIds)
      .order('created_at', { ascending: false });
    const qUniTags = supabase
      .from('posts_universities')
      .select('post:posts(*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name)))')
      .in('university_id', uniIds)
      .order('created_at', { ascending: false });
    promises.push(qUniDirect, qUniTags);
  }
  if (majorIds.length > 0) {
    const qMajDirect = supabase
      .from('posts')
      .select('*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name))')
      .eq('scope', 'major')
      .in('major_id', majorIds)
      .order('created_at', { ascending: false });
    const qMajTags = supabase
      .from('posts_majors')
      .select('post:posts(*, author:profiles(id, name, avatar_url, role), posts_universities(university:universities(id,name)), posts_majors(major:majors(id,name)))')
      .in('major_id', majorIds)
      .order('created_at', { ascending: false });
    promises.push(qMajDirect, qMajTags);
  }

  const results = await Promise.all(promises);
  const merged: any[] = [];
  for (const r of results) {
    if (r.error) throw r.error;
    if (!r.data) continue;
    if (r.data.length > 0 && 'post' in r.data[0]) {
      merged.push(...r.data.map((row: any) => row.post));
    } else {
      merged.push(...r.data);
    }
  }
  const dedup = Object.values(Object.fromEntries(merged.map((p: any) => [p.id, p])));
  dedup.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return limit ? (dedup as any[]).slice(0, limit) : (dedup as any[]);
}

export async function createPost(payload: { kind: PostKind; scope: PostScope; content: string; title?: string; university_id?: string | null; major_id?: string | null; university_ids?: string[]; major_ids?: string[]; }): Promise<CommunityPost> {
  const { university_ids = [], major_ids = [], ...postBase } = payload as any;
  const { data, error } = await supabase
    .from('posts')
    .insert([{ ...postBase }])
    .select('*, author:profiles(id, name, avatar_url, role)')
    .single();

  if (error) throw error;
  const post = data as any;

  // Insert tag joins
  if (university_ids.length > 0) {
    const rows = university_ids.map((uid) => ({ post_id: post.id, university_id: uid }));
    const { error: e1 } = await supabase.from('posts_universities').insert(rows);
    if (e1) throw e1;
  }
  if (major_ids.length > 0) {
    const rows = major_ids.map((mid) => ({ post_id: post.id, major_id: mid }));
    const { error: e2 } = await supabase.from('posts_majors').insert(rows);
    if (e2) throw e2;
  }
  return post as CommunityPost;
}

export async function listComments(post_id: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles(id, name, avatar_url, role)')
    .eq('post_id', post_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as CommunityComment[];
}

export async function createComment(post_id: string, content: string): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id, content }])
    .select('*, author:profiles(id, name, avatar_url, role)')
    .single();
  if (error) throw error;
  return data as unknown as CommunityComment;
}
