import React, { useEffect } from 'react';
import { Event } from '@/api/entities';

const workshopData = {
    "title": "KCSIE Workshop: A Summary and Deep Dive into AI & Online Risks",
    "description": "The 2025 KCSIE guidance highlights a critical new safeguarding frontier: the risks linked to AI, misinformation, disinformation and conspiracy theories. These challenges are no longer \"emerging\" — they are here now, shaping the way children learn, socialise and view the world.\n\nThis workshop, led by safeguarding expert **Leigh Williams**, will equip DSLs and senior leaders with the insight, language and tools they need to respond.\n\n### Session Objectives\n- Understanding the expansion of online safety risk terms \"misinformation, disinformation and conspiracy theories\", assessing the potential risks they present and discussing school solutions\n- An overview of KCSIE 2025 changes with suggested actions for DSLs\n- Understanding the potential safeguarding risks relating to \"generative AI\"\n- Reviewing existing DfE guidance and expectations for filtering and monitoring protocols\n- Holistically addressing online safety risks as a whole school (in partnership with IT and curriculum leads)\n\n### About the Trainer\n**Leigh Williams** is an experienced health and social care manager, safeguarding lead and trainer with over 25 years' experience. A JNC-qualified specialist with a strong record of delivering high-impact safeguarding training to Designated Safeguarding Leads (DSL) and other professionals across multi-agency environments.\n\nWith extensive knowledge of KCSIE, Working Together to Safeguard Children, and the 2014 Care Act, Leigh has served as CEO & Safeguarding Lead at Cumbria Addictions where over 70% of clients present with complex safeguarding concerns. They have also worked as an External Consultant for The Outward Bound Trust, providing safeguarding support across England, Wales and Scotland.\n\nAs a Multi-Agency Safeguarding Trainer for Cumbria's Local Safeguarding Children's Board, Leigh delivered training to over 100 professionals annually. They have developed bespoke CPD including specialized training on safeguarding digital natives online, making them particularly well-suited to address the emerging challenges of AI and online risks in the 2025 KCSIE guidance.\n\nQualified to teach, assess and quality assure adult education (PTLLS Level 4, A1 Assessor, V1 Verifier), Leigh excels at contextualizing learning and engaging professionals both online and in-person, embedding current safeguarding legislation into practice.",
    "date": "2025-09-16T10:00:00.000Z",
    "location": "Online via Zoom",
    "imageUrl": "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=800&auto=format&fit=crop",
    "type": "Workshop",
    "registrationUrl": "https://www.eventbrite.co.uk/e/kcsie-workshop-a-summary-and-deep-dive-into-ai-online-risks-tickets-1668550392139?aff=oddtdtcreator"
};

export default function DataSeeder() {
  useEffect(() => {
    const seedData = async () => {
      try {
        const existingEvents = await Event.filter({ title: workshopData.title });
        if (existingEvents.length === 0) {
          await Event.create(workshopData);
          console.log("Successfully seeded KCSIE workshop.");
        } else {
          // If it exists, check if URL needs updating
          const eventToUpdate = existingEvents[0];
          if (eventToUpdate.registrationUrl !== workshopData.registrationUrl) {
              await Event.update(eventToUpdate.id, { registrationUrl: workshopData.registrationUrl });
              console.log("Updated workshop with registration URL.");
          } else {
              console.log("KCSIE workshop already exists and is up-to-date.");
          }
        }
      } catch (error) {
        console.error("Failed to seed workshop data:", error);
      }
    };

    seedData();
  }, []);

  return null; // This component renders nothing
}