import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  NewsletterUnavailableError,
  subscribeToNewsletter,
} from "@/features/newsletter/subscribe";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ message: "Expected a JSON request." }, { status: 415 });
    }

    await subscribeToNewsletter(await request.json());

    return NextResponse.json({ message: "Subscription saved." }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (error instanceof NewsletterUnavailableError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    console.error("Newsletter subscription failed", error);
    return NextResponse.json(
      { message: "Could not subscribe right now. Please try again." },
      { status: 500 },
    );
  }
}
