"use client";

import { Comment, type CommentData } from "@/components/comment";
import { Small } from "@/components/ui/small";

interface CommentsListProps {
  comments: CommentData[];
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-6 px-4 text-center">
        <Small variant="default">Ainda não há comentários.</Small>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-rule px-4">
      {comments.map((c) => (
        <Comment key={c.id} comment={c} />
      ))}
    </ul>
  );
}

export type { CommentData };
