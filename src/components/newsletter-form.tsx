"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "pending" | "success" | "error";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("pending");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          source: compact ? "header" : "post-detail",
        }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Could not subscribe right now.");
      }

      form.reset();
      setStatus("success");
      setMessage("You’re on the list.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not subscribe right now.");
    }
  }

  if (status === "success") {
    return (
      <p className={compact ? "text-xs text-[#777]" : "text-sm text-[#505050]"} role="status">
        {message}
      </p>
    );
  }

  return (
    <form className="flex min-w-0 items-center gap-2" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={compact ? "header-email" : "detail-email"}>
        Email address
      </label>
      <input
        id={compact ? "header-email" : "detail-email"}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@email.com"
        className={`focus-ring min-w-0 rounded-full border border-[#e6e6e6] bg-[#fafafa] text-[#555] outline-none transition-colors placeholder:text-[#929292] focus:border-[#aaa] ${
          compact ? "w-[148px] px-3 py-[6px] text-[13px]" : "flex-1 px-4 py-2.5 text-sm"
        }`}
      />
      <input
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={status === "pending"}
        className={`focus-ring shrink-0 rounded-full bg-[#262626] text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-60 ${
          compact ? "px-3 py-[6px] text-[13px]" : "px-4 py-2.5 text-sm"
        }`}
      >
        {status === "pending" ? "joining…" : "subscribe"}
      </button>
      {status === "error" ? (
        <span className="sr-only" role="alert">
          {message}
        </span>
      ) : null}
    </form>
  );
}
