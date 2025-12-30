'use client'

import { useState, useRef, useEffect } from 'react'
import { Comment } from '@/lib/definitions'
import UserAvatar from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { createComment } from '@/lib/actions/comments'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function CommentSection({
  comments,
  folderId,
  fileId
}: {
  comments: Comment[],
  folderId?: number,
  fileId?: number
}) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pathname = usePathname()

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [content])

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const result = await createComment(content, folderId, fileId, pathname)
      if (result.success) {
        setContent('')
        toast.success('Đã gửi bình luận')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-4">Bình luận</h3>
        <div className="flex items-start gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết bình luận..."
            className="flex-1 min-h-10 max-h-50 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 shrink-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Chưa có bình luận nào</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="shrink-0">
                <div className="w-8 h-8">
                  <UserAvatar url={comment.author.avatarUrl} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold truncate">{comment.author.name}</span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
