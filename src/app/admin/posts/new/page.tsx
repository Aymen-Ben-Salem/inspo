import { PostEditor } from "@/components/admin/post-editor";
import { createPostAction } from "@/features/admin/actions";

export default function NewPostPage() {
  return (
    <div className="grid gap-7">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#777]">Posts</p>
        <h1 className="mt-1 text-4xl font-medium tracking-[-0.05em]">New post</h1>
      </div>
      <PostEditor action={createPostAction} />
    </div>
  );
}
