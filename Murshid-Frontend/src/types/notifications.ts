export type NotificationType = 'answer' | 'comment' | 'reply';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_post_id?: string;
  related_answer_id?: string;
  related_comment_id?: string;
  actor_id?: string;
  actor_name?: string;
  actor_avatar?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithContent extends Notification {
  post_title?: string;
  post_type?: string;
}

