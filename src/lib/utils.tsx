import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Streamdown } from "streamdown";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MarkdownRender = (content: string) => {
  return (
    <div>
      <Streamdown>{content}</Streamdown>
    </div>
  );
};
