import Image from "next/image";
import { ViewTransitionLink } from "@/components/transitions/ViewTransitionLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users } from "lucide-react";
import type { RelatedDeityCard } from "@/lib/deity-page";

/**
 * Related-deity grid. The server page selects the cards
 * (`selectRelatedDeities`) so the catalog never reaches the client.
 */
export function RelatedDeities({ deities }: { deities: RelatedDeityCard[] }) {
  if (deities.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2 text-xl">
          <Users className="h-5 w-5 text-gold" />
          Related Deities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {deities.map(({ label, ...deity }) => (
            <ViewTransitionLink
              key={deity.id}
              href={`/deities/${deity.slug}`}
              className="group"
            >
              <div className="flex flex-col items-center p-3 rounded-xl border border-border hover:border-gold/50 hover:bg-gold/5 transition-all duration-200">
                {deity.imageUrl ? (
                  <div
                    className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold/20 group-hover:border-gold/40 transition-colors mb-2"
                    style={{ viewTransitionName: `deity-image-${deity.slug}` }}
                  >
                    <Image
                      src={deity.imageUrl}
                      alt={deity.name}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/20 group-hover:border-gold/40 transition-colors flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-gold" />
                  </div>
                )}
                <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors text-center">
                  {deity.name}
                </span>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs border-gold/30 text-gold-text"
                >
                  {label}
                </Badge>
              </div>
            </ViewTransitionLink>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
