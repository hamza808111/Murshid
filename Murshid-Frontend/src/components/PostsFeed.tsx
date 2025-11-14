import { useEffect, useState } from 'react';
import { listPosts, createPost, listComments, createComment, listPostsForBookmarks, PostKind, PostScope } from '@/lib/communityApi';
import { getUniversities } from '@/lib/universitiesApi';
import { getMajors } from '@/lib/majorsApi';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PostsFeedProps {
  scope: PostScope;
  universityId?: string;
  majorId?: string;
  mode?: 'all' | 'bookmarks';
}

export default function PostsFeed({ scope, universityId, majorId, mode = 'all' }: PostsFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  // kind is derived from role: Specialists => 'post', Students => 'question'
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [universities, setUniversities] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [tagType, setTagType] = useState<'university' | 'major' | ''>('');
  const [tagUniversityId, setTagUniversityId] = useState<string>('');
  const [tagMajorId, setTagMajorId] = useState<string>('');
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [mentionOpen, setMentionOpen] = useState<boolean>(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{type:'university'|'major'; id:string; name:string}>>([]);

  const canPost = !!user && ((user.role === 'Specialist') || (user.role === 'Student'));
  const isSpecialist = user?.role === 'Specialist';

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, universityId, majorId, mode, user?.id]);

  useEffect(() => {
    // Preload lists for name resolution and mention autocomplete
    getUniversities().then(setUniversities).catch(() => {});
    getMajors().then(setMajors).catch(() => {});
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      let data;
      if (mode === 'bookmarks' && user?.id) {
        data = await listPostsForBookmarks(user.id);
      } else {
        data = await listPosts({ scope, university_id: universityId, major_id: majorId });
      }
      setPosts(data);
    } catch (e: any) {
      console.error('Failed to load posts', e);
      toast.error(e.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!user) return;
    try {
      if (!content.trim()) return;
      const enforcedKind: PostKind = isSpecialist ? 'post' : 'question';
      let effScope: PostScope = scope;
      const payload: any = { kind: enforcedKind, scope: effScope, content: content.trim() };
      if (scope === 'university') payload.university_id = universityId;
      if (scope === 'major') payload.major_id = majorId;
      if (scope === 'global') {
        if (tagType === 'university' && tagUniversityId) {
          payload.scope = 'university';
          payload.university_id = tagUniversityId;
        } else if (tagType === 'major' && tagMajorId) {
          payload.scope = 'major';
          payload.major_id = tagMajorId;
        }
      }
      const created = await createPost(payload);
      setContent('');
      setComposerOpen(false);
      setTagType('');
      setTagUniversityId('');
      setTagMajorId('');
      setPosts((p) => [created, ...p]);
      toast.success('Posted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to post');
    }
  }

  function updateMentionState(text: string, caret: number) {
    if (scope !== 'global') {
      setMentionOpen(false);
      return;
    }
    const upto = text.slice(0, caret);
    const match = /(^|\s)@([A-Za-z\u0600-\u06FF0-9_\- ]*)$/.exec(upto);
    if (match && match[2] !== undefined) {
      const q = match[2].trim();
      setMentionQuery(q);
      const uniItems = (universities || []).map((u:any)=>({type:'university' as const, id:u.id, name:u.name}));
      const majItems = (majors || []).map((m:any)=>({type:'major' as const, id:m.id, name:m.name}));
      const pool = [...uniItems, ...majItems];
      const filtered = q.length === 0 ? pool.slice(0,5) : pool.filter(it=>it.name.toLowerCase().includes(q.toLowerCase())).slice(0,5);
      setMentionSuggestions(filtered);
      setMentionOpen(filtered.length>0);
    } else {
      setMentionOpen(false);
      setMentionQuery('');
    }
  }

  function insertMention(s: {type:'university'|'major'; id:string; name:string}) {
    // Replace the trailing @query with @Name
    const textarea = document.getElementById('postsfeed-textarea') as HTMLTextAreaElement | null;
    const caret = textarea ? textarea.selectionStart : content.length;
    const upto = content.slice(0, caret);
    const after = content.slice(caret);
    const replaced = upto.replace(/(^|\s)@([A-Za-z\u0600-\u06FF0-9_\- ]*)$/, `$1@${s.name}`);
    const next = replaced + after;
    setContent(next);
    // Multiple tags resolved on submit
    setMentionOpen(false);
  }

  async function openComments(postId: string) {
    if (comments[postId]) return; // already loaded
    try {
      const data = await listComments(postId);
      setComments((c) => ({ ...c, [postId]: data }));
    } catch (e: any) {
      toast.error(e.message || 'Failed to load comments');
    }
  }

  async function submitComment(postId: string) {
    try {
      const text = (commentDraft[postId] || '').trim();
      if (!text) return;
      const c = await createComment(postId, text);
      setComments((m) => ({ ...m, [postId]: [...(m[postId] || []), c] }));
      setCommentDraft((d) => ({ ...d, [postId]: '' }));
    } catch (e: any) {
      toast.error(e.message || 'Failed to comment');
    }
  }

  return (
    <div className="space-y-4">
      {canPost && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{isSpecialist ? 'Post' : 'Question'}</Badge>
            </div>
            <Textarea
              placeholder={isSpecialist ? 'Share a post...' : 'Ask a question...'}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                const caret = (e.target as HTMLTextAreaElement).selectionStart || e.target.value.length;
                updateMentionState(e.target.value, caret);
              }}
              onFocus={() => setComposerOpen(true)}
              onKeyDown={(e:any) => {
                if (mentionOpen && e.key === 'Enter') {
                  e.preventDefault();
                  if (mentionSuggestions[0]) insertMention(mentionSuggestions[0]);
                }
              }}
              id="postsfeed-textarea"
            />
            {mentionOpen && (
              <div className="border rounded-md bg-popover text-popover-foreground shadow p-2 text-sm max-h-48 overflow-auto">
                {mentionSuggestions.map((s)=> (
                  <button
                    key={`${s.type}-${s.id}`}
                    type="button"
                    className="block w-full text-left px-2 py-1 hover:bg-muted rounded"
                    onClick={() => insertMention(s)}
                  >
                    @{s.name} <span className="text-xs text-muted-foreground">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Tag selector removed; use @mentions instead */}
            {composerOpen && (
              <div className="flex justify-end">
                <Button onClick={handleCreatePost} disabled={!content.trim()}>Publish</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-muted-foreground">No posts yet</div>
      ) : (
        posts.map((p) => (
          <Card key={p.id} className="">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{p.kind === 'post' ? 'Post' : 'Question'}</Badge>
                {p.author?.name && <span className="text-sm text-muted-foreground">by {p.author.name}</span>}
                <span className="text-xs text-muted-foreground ml-auto">{new Date(p.created_at).toLocaleString()}</span>
              </div>
              <div className="whitespace-pre-wrap text-foreground">{p.content}</div>
              {/* Tag labels */}
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Direct scope labels */}
                {p.scope === 'university' && p.university_id && (
                  <Badge variant="outline">
                    {universities.find((u:any)=>u.id===p.university_id)?.name || 'University'}
                  </Badge>
                )}
                {p.scope === 'major' && p.major_id && (
                  <Badge variant="outline">
                    {majors.find((m:any)=>m.id===p.major_id)?.name || 'Major'}
                  </Badge>
                )}
                {/* Joined tags */}
                {(p.posts_universities || []).map((tu:any) => (
                  <Badge key={`u-${tu.university?.id || Math.random()}`} variant="secondary">{tu.university?.name}</Badge>
                ))}
                {(p.posts_majors || []).map((tm:any) => (
                  <Badge key={`m-${tm.major?.id || Math.random()}`} variant="secondary">{tm.major?.name}</Badge>
                ))}
              </div>

              <div className="pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => openComments(p.id)}>
                  View discussion
                </Button>
                {comments[p.id] && (
                  <div className="mt-2 space-y-2">
                    {(comments[p.id] || []).map((c) => (
                      <div key={c.id} className="text-sm p-2 rounded-md bg-muted/40">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{c.author?.name || 'User'}</span>
                          <span className="text-xs">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-foreground">{c.content}</div>
                      </div>
                    ))}
                    {isSpecialist && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Write an answer..."
                          value={commentDraft[p.id] || ''}
                          onChange={(e) => setCommentDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                        />
                        <Button size="sm" onClick={() => submitComment(p.id)} disabled={!(commentDraft[p.id] || '').trim()}>
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
