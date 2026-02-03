import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Sources & References - Mythos Atlas',
  description: 'Academic sources and references used in compiling the Mythos Atlas mythology encyclopedia.',
};

export default function SourcesPage() {
  const sources = [
    {
      category: 'Greek Mythology',
      references: [
        {
          title: 'Theogony',
          author: 'Hesiod',
          description: 'Ancient Greek poem describing the origins and genealogies of the gods.',
        },
        {
          title: 'The Iliad & The Odyssey',
          author: 'Homer',
          description: 'Epic poems central to understanding Greek mythology and heroic tradition.',
        },
        {
          title: 'Metamorphoses',
          author: 'Ovid',
          description: 'Latin narrative poem chronicling the history of the world from creation to the deification of Julius Caesar.',
        },
      ],
    },
    {
      category: 'Norse Mythology',
      references: [
        {
          title: 'Prose Edda',
          author: 'Snorri Sturluson',
          description: 'Old Norse textbook written in Iceland during the early 13th century, a major source for Norse mythology.',
        },
        {
          title: 'Poetic Edda',
          author: 'Various',
          description: 'Collection of Old Norse poems from the Icelandic medieval manuscript Codex Regius.',
        },
      ],
    },
    {
      category: 'Egyptian Mythology',
      references: [
        {
          title: 'The Book of the Dead',
          author: 'Ancient Egyptian Funerary Texts',
          description: 'Collection of spells and instructions to help the deceased navigate the afterlife.',
        },
        {
          title: 'Pyramid Texts',
          author: 'Ancient Egyptian',
          description: 'Oldest known religious texts in the world, carved into pyramids at Saqqara.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <BookOpen className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Sources & References
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Academic sources and primary texts used in our research
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8">
          <Card className="border-gold/20 bg-midnight-light/50 mb-8">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Our Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80 leading-relaxed text-lg">
                Mythos Atlas draws from primary ancient texts, scholarly translations, and modern academic research to provide accurate and comprehensive information about world mythologies. We prioritize sources that are widely recognized by scholars and institutions.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {sources.map((section) => (
              <div key={section.category}>
                <h2 className="text-3xl font-serif font-semibold text-parchment mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
                  {section.category}
                </h2>
                <div className="grid gap-6">
                  {section.references.map((ref, idx) => (
                    <Card key={idx} className="border-gold/20 bg-midnight-light/50">
                      <CardHeader>
                        <CardTitle className="text-parchment flex items-center gap-2">
                          {ref.title}
                          <ExternalLink className="h-4 w-4 text-gold/60" />
                        </CardTitle>
                        <p className="text-gold/80 text-sm">{ref.author}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-parchment/70">{ref.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="border-gold/20 bg-midnight-light/50 mt-12">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-parchment/80 leading-relaxed">
                We also reference modern scholarly works from universities and research institutions worldwide. Our team continuously updates and verifies information to maintain accuracy and scholarly integrity.
              </p>
              <p className="text-parchment/70 text-sm italic">
                Note: This is a living document. Sources are continuously being added and updated as we expand our coverage of world mythologies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
