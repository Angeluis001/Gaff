"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Search } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/LanguageContext"

export function FAQSection() {
  const { messages } = useLanguage()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState(messages.faq.categories[0]?.id ?? "general")

  const categories = useMemo(
    () =>
      messages.faq.categories.map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${item.question} ${item.answer}`
            .toLowerCase()
            .includes(search.toLowerCase())
        ),
      })),
    [messages.faq.categories, search]
  )

  return (
    <section id="faq" className="landing-section scroll-mt-28 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.faq.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.faq.title}</h2>
          <p className="section-copy mt-5">{messages.faq.subtitle}</p>
        </div>

        <div className="glass-panel rounded-[2rem] border border-gold/10 p-6 sm:p-8">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sand/44" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={messages.faq.searchPlaceholder}
              className="w-full rounded-full border border-gold/14 bg-white/4 px-11 py-3 text-sm text-white outline-none placeholder:text-sand/40"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line" className="mb-6 w-full justify-start gap-2 overflow-x-auto">
              {messages.faq.categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="rounded-full border border-gold/10 px-4 py-2 text-sand/72 data-active:border-gold data-active:text-white"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Accordion className="rounded-[1.5rem] border border-gold/10 bg-white/3 px-4 py-2">
                  {category.items.map((item) => (
                    <AccordionItem key={item.question} value={item.question}>
                      <AccordionTrigger className="py-4 text-base text-white">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-sand/72">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${search}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-gold/10 bg-white/3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm leading-7 text-sand/70">
                Can’t find your answer? Launch the same contract the future Botpress
                bridge listens for.
              </p>
              <Button
                type="button"
                className="rounded-full bg-gold text-navy hover:bg-gold/90"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("gaff:open-chat"))
                }
              >
                {messages.faq.chatCta ?? "Chat with us"}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
