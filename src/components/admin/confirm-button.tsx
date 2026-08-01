"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

type ConfirmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmation: string;
};

export function ConfirmButton({ confirmation, onClick, ...props }: ConfirmButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && !window.confirm(confirmation)) event.preventDefault();
  }

  return <button {...props} onClick={handleClick} />;
}
