import { GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/metadata";
import { cn } from "@/lib/utils";

/**
 * Build Google Classroom's share link for a page on the site. Classroom opens
 * its own dialog where the teacher picks a class and posts the page as an
 * assignment, material or announcement; no script or sign-in is needed here.
 */
export function classroomShareUrl(path: string, title?: string): string {
  const params = new URLSearchParams({ url: `${siteConfig.url}${path}` });
  if (title) params.set("title", title);
  return `https://classroom.google.com/share?${params.toString()}`;
}

/** "Share to Classroom" link; hidden on the printed page. */
export function ClassroomShareButton({
  path,
  title,
  className,
}: {
  path: string;
  title?: string;
  className?: string;
}) {
  return (
    <a
      href={classroomShareUrl(path, title)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "min-h-11 print:hidden",
        className,
      )}
    >
      <GraduationCap aria-hidden="true" className="size-4" />
      Share to Google Classroom
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
