import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit3, Trash2 } from 'lucide-react';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
} from '@/api/endpoints/social';
import { CommentResponse, CommentCreate } from '@/api/types/social';

interface CommentSectionProps {
  postId: string;
  className?: string;
}

interface CommentItemProps {
  comment: CommentResponse;
  onReply: (parentId: string) => void;
  onEdit: (comment: CommentResponse) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
}

function CommentItem({ comment, onReply, onEdit, onDelete, currentUserId }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentResponse[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (loadingReplies) return;

    setLoadingReplies(true);
    try {
      const response = await getCommentReplies(comment.id);
      setReplies(response.data);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {comment.user_avatar ? (
            <img
              className="h-8 w-8 rounded-full"
              src={comment.user_avatar}
              alt={comment.user_username}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm text-gray-600">{comment.user_username.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{comment.user_username}</h4>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>

          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <Reply className="h-3 w-3" />
              <span>返信</span>
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  className="text-xs text-gray-500 hover:text-green-600 flex items-center space-x-1"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>編集</span>
                </button>

                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center space-x-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>削除</span>
                </button>
              </>
            )}

            <button
              onClick={loadReplies}
              disabled={loadingReplies}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {loadingReplies ? '読み込み中...' : '返信を見る'}
            </button>
          </div>

          {showReplies && replies.length > 0 && (
            <div className="mt-4 ml-4 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId, className = '' }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<CommentResponse | null>(null);
  const [editText, setEditText] = useState('');

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await getComments(postId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData: CommentCreate = {
        body: newComment,
        parent_comment_id: replyingTo || undefined,
      };

      await createComment(postId, commentData);
      setNewComment('');
      setReplyingTo(null);
      loadComments(); // コメント一覧を再読み込み
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleEditComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editText.trim()) return;

    try {
      await updateComment(editingComment.id, { body: editText });
      setEditingComment(null);
      setEditText('');
      loadComments(); // コメント一覧を再読み込み
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return;

    try {
      await deleteComment(commentId);
      loadComments(); // コメント一覧を再読み込み
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const startReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  const startEdit = (comment: CommentResponse) => {
    setEditingComment(comment);
    setEditText(comment.body);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">コメント ({comments.length})</h3>
      </div>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? '返信を入力...' : 'コメントを入力...'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          {replyingTo && (
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              返信をキャンセル
            </button>
          )}

          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {replyingTo ? '返信' : 'コメント'}
          </button>
        </div>
      </form>

      {/* 編集フォーム */}
      {editingComment && (
        <form onSubmit={handleEditComment} className="mb-6 bg-yellow-50 p-4 rounded-lg">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setEditingComment(null);
                setEditText('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={!editText.trim()}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              更新
            </button>
          </div>
        </form>
      )}

      {/* コメント一覧 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだコメントがありません。最初のコメントを投稿してみましょう！
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={startReply}
              onEdit={startEdit}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
