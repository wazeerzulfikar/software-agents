/* Who was in Pattie Maes's group at the MIT Media Lab, and when.
   Researched in October 2026 from MIT theses (DSpace title pages give the
   degree month), the group's people pages in the Wayback Machine, CVs and
   public profiles. Where only the year someone arrived is known, September
   is assumed. Each person's note says what is documented and what is not.

   spans: [from, to] as 'YYYY-MM' or 'now'. Spans that follow straight on
   from each other (an SM, then a PhD) are drawn as one bar with a thin join.
   A third value 'own' marks years spent leading a group of one's own at the
   Lab: drawn as an outline, and not lit by the walking line.
   role: the degrees or positions they held in the group.
   word: what they are known for there, in a word or two.
   The rows are sorted by arrival when drawn, so their order here is free. */
window.GROUP = {
  from: 1989.5,
  to: 2027.0,
  now: 2026 + 9.7 / 12,          // late October 2026
  // Switches for the installation.
  config: {
    themes: true,          // after each walk through the years, show the themes page
    themesSeconds: 50      // and stay on it this long before coming back
  },

  // What Pattie's group was called, from the Media Lab's own lists of groups
  // and the groups' sites in the Wayback Machine: Autonomous Agents until late
  // 1996, Software Agents until June 2001, when Henry Lieberman took the group
  // (and its name) on. Pattie came back from leave to a new group, Interactive
  // Experience (October 2003), renamed Ambient Intelligence in September 2004
  // and Fluid Interfaces in November 2008.
  eras: [
    { name: 'Autonomous Agents', from: '1991-09', to: '1997-01', years: '1991–1996' },
    { name: 'Software Agents', from: '1997-01', to: '2001-06', years: '1997–2001' },
    { name: 'Interactive Experience', from: '2003-10', to: '2004-09', years: '2003–04' },
    { name: 'Ambient Intelligence', from: '2004-09', to: '2008-11', years: '2004–2008' },
    { name: 'Fluid Interfaces', from: '2008-11', to: 'now', years: '2008–today' }
  ],

  people: [
    { name: 'Pattie Maes', role: 'Professor', pi: true,
      spans: [['1989-09', '2001-12'], ['2001-12', '2003-08', 'leave', 'On leave'], ['2003-08', 'now']],
      note: 'At the MIT AI Lab from 1989, the Media Lab from 1991. On leave from about December 2001 to August 2003 (the Media Lab faculty list).' },

    // ---- the agents years ----
    { name: 'Leonard Foner', role: 'SM · PhD', word: 'Yenta',
      spans: [['1992-09', '1994-06'], ['1994-06', '1999-06']],
      note: 'Arrival 1992 estimated (three years each at Bitstream and Symbolics after a 1986 SB). SM June 1994 and PhD June 1999, both supervised by Pattie.' },
    { name: 'Max Metral', role: 'UROP · SM', word: 'HOMR',
      spans: [['1992-09', '1994-06'], ['1994-06', '1995-06']],
      note: 'Undergraduate in the group from about 1992 (his SM thanks it for "this crazy three years"); SB June 1994, SM June 1995 (MotorMouth, the engine behind HOMR).' },
    { name: 'Bruce Blumberg', role: 'PhD', word: 'ALIVE',
      spans: [['1991-09', '1996-09']],
      note: 'Pattie wrote "Ben Bloomberg". Her first PhD student, from 1991 (strategy+business, 2000); thesis submitted September 1996, when he became faculty (Synthetic Characters); degree February 1997, the first PhD from the group.' },
    { name: 'Upendra Shardanand', role: 'MEng', word: 'Ringo',
      spans: [['1993-09', '1994-09'], ['1994-09', '1995-03']],
      note: 'SB and MEng (EECS, not an SM) September 1994, supervised by Pattie. Start 1993 estimated. Still with the group until Agents Inc. (later Firefly) was founded in March 1995.' },
    { name: 'Alan Wexelblat', role: 'PhD', word: 'Footprints',
      spans: [['1994-09', '1999-02']],
      note: 'His SM (1992-94) was in Richard Bolt\'s group. With Pattie from September 1994 (his CV); PhD February 1999.' },
    { name: 'Alexandros Moukas', role: 'SM', word: 'Amalthaea',
      spans: [['1995-09', '1997-06'], ['1997-06', '1999-12']],
      note: 'SM June 1997; then a doctoral candidate, left without a PhD for Frictionless Commerce and Velti. Departure between February 1999 and July 2000 (people pages); end of 1999 assumed.' },
    { name: 'Giorgos Zacharia', role: 'UROP · SM', word: 'Reputation',
      spans: [['1996-09', '1997-09'], ['1997-09', '1999-09']],
      note: 'Undergraduate researcher on Amalthaea from about 1996; SM September 1999 (Sporas and Histos reputation mechanisms).' },
    { name: 'Robert Guttman', role: 'SM', word: 'Tête-à-Tête',
      spans: [['1996-09', '1998-09']],
      note: 'Arrived September 1996 (his thesis); SM September 1998.' },
    { name: 'Nelson Minar', role: 'SM', word: 'Hive',
      spans: [['1996-09', '1998-09'], ['1998-09', '1999-06']],
      note: 'Pattie wrote "Nelson Hidalgo". SM September 1998; stayed as a research assistant into 1999.' },
    { name: 'Michael Best', role: 'PhD · Scientist', word: 'Language evolution',
      spans: [['1997-09', '2000-03'], ['2000-03', '2002-06']],
      note: 'His SM (1996) was with Ken Haase. Joined Pattie between May 1997 and December 1998 (estimated); PhD 2000; research scientist on the group\'s pages until mid-2002.' },
    { name: 'Daniele De Francesco', role: 'UROP · Master\'s', word: 'InShop',
      spans: [['1998-09', '1999-08'], ['1999-09', '2000-12']],
      note: 'An undergraduate in the group in December 1998 and February 1999 (Trafficopter), then a graduate student by August 2000 (InShop, mobile commerce); an alumnus by February 2001. No thesis found, so the degree (probably an EECS MEng) is unconfirmed.' },

    // ---- Ambient Intelligence and Fluid Interfaces ----
    { name: 'David Merrill', role: 'PhD', word: 'Siftables',
      spans: [['2004-09', '2009-06']],
      note: 'His SM (June 2004) was with Joe Paradiso. A first-year PhD student in Ambient Intelligence in 2004-05; defended September 2008, degree June 2009.' },
    { name: 'Seth Hunter', role: 'SM · PhD', word: 'WaaZam',
      spans: [['2007-09', '2009-09'], ['2009-09', '2014-02']],
      note: 'With Pattie from 2007 (his CV); SM September 2009 (MemTable), PhD February 2014 (WaaZam).' },
    { name: 'Aaron Zinman', role: 'PhD', word: 'Hyperego',
      spans: [['2009-09', '2011-09']],
      note: 'In Judith Donath\'s Sociable Media group from 2004; Pattie "adopted" him when it closed, between April 2009 and January 2010. PhD September 2011.' },
    { name: 'Suranga Nanayakkara', role: 'Postdoc', word: 'EyeRing',
      spans: [['2010-01', '2011-09'], ['2011-09', '2012-09']],
      note: 'Visiting postdoc 2010-11, then visiting assistant professor 2011-12 while at SUTD (his CV; months unknown). Listed as visiting faculty in May 2012 and as an alumnus in November 2012.' },
    { name: 'Anette von Kapri', role: 'SM', word: 'InReach',
      spans: [['2011-09', '2013-06']],
      note: 'Formally Anette Freiin von Kapri. First-year master\'s student in February 2012; SM June 2013 (InReach, remote 3D collaboration with bare hands). Nothing found on AR language learning.' },
    { name: 'Anirudh Sharma', role: 'SM', word: 'Glassified',
      spans: [['2012-09', '2014-06']],
      note: 'First-year master\'s student in autumn 2012; SM June 2014 (augmented tools with transparent displays).' },
    { name: 'Dhairya Dand', role: 'SM', word: 'Shoulder wearable',
      spans: [['2014-01', '2014-09']],
      note: 'In Henry Holtzman\'s Information Ecology group from 2012; moved to Pattie between September 2013 and February 2014. SM September 2014 (icon, a shoulder-worn device for learning across distances).' },
    { name: 'Harpreet Sareen', role: 'SM · Visiting professor', word: 'Cyborg Botany',
      spans: [['2015-09', '2017-09'], ['2017-09', '2019-06'], ['2026-01', '2026-05']],
      note: 'SM 2017 (Cyborg Botany), then a research affiliate continuing the plant work (Elowan, 2018) until about 2019. Visiting associate professor in Fluid Interfaces in the first half of 2026 (profile snapshots).' },
    { name: 'Valentin Heun', role: 'SM · PhD', word: 'Reality Editor',
      spans: [['2011-09', '2013-09'], ['2013-09', '2017-09']],
      note: 'His CV: SM 2011-2013 (Smarter Objects), PhD 2013-2017 (the Reality Editor); degrees September 2013 and September 2017.' },
    { name: 'Arnav Kapur', role: 'SM', word: 'AlterEgo',
      spans: [['2015-10', '2016-03'], ['2016-09', '2018-09'], ['2018-09', '2025-02']],
      note: 'A visiting student October 2015 to March 2016. SM September 2018 (start 2016 estimated), then PhD research with Pattie, with a gap in his profile from February 2023 to April 2024; left without a PhD in early 2025.' },
    { name: 'Adam Haar Horowitz', role: 'SM · PhD · Postdoc', word: 'Dormio',
      spans: [['2017-09', '2019-09'], ['2019-09', '2022-09'], ['2022-09', '2023-08']],
      note: 'Arrived autumn 2017; SM September 2019, PhD September 2022 (targeted dream incubation), postdoc until summer 2023.' },
    { name: 'Abhinandan Jain', role: 'SM · PhD', word: 'Interoception',
      spans: [['2017-10', '2018-08'], ['2018-09', '2020-09'], ['2020-09', '2024-09']],
      note: 'Pattie wrote "Abhi Jain". A visiting researcher from late 2017; SM September 2020, PhD September 2024 (interoceptive interventions; Somnia, his sleep prototype, led to Nocturnal).' },
    { name: 'Joanne Leong', role: 'SM · PhD', word: 'AI & learning',
      spans: [['2020-01', '2021-02'], ['2021-02', '2025-05']],
      note: 'Entered in autumn 2018 in Hiroshi Ishii\'s Tangible Media group; moved to Pattie between October 2019 and April 2020. SM February 2021, PhD May 2025 (Transformative Lenses).' },
    { name: 'Laura Perovich', role: 'PhD', word: 'Data physicalization',
      spans: [['2019-10', '2020-09']],
      note: 'In Object-Based Media (Michael Bove) from 2012. The months with Pattie after Bove left in autumn 2019 rest on Pattie\'s own note: her supervisor of record was Ethan Zuckerman, with Pattie on the committee. PhD September 2020.' },
    { name: 'Pat Pataranutaporn', role: 'SM · PhD · Postdoc', word: 'Cyborg Psychology',
      spans: [['2018-09', '2020-09'], ['2020-09', '2024-09'], ['2024-10', '2025-08'], ['2025-09', 'now', 'own']],
      note: 'SM September 2020, PhD September 2024, postdoc to August 2025; assistant professor from 1 September 2025, leading his own group, Cyborg Psychology.' },
    { name: 'Caitlin Morris', role: 'SM · PhD', word: 'Social learning',
      spans: [['2019-09', '2022-02'], ['2022-02', '2026-06']],
      note: 'Arrival autumn 2019 estimated; SM February 2022; PhD defended 30 June 2026.' },
    { name: 'Natasha Maniar', role: 'MEng', word: 'MemPal',
      spans: [['2023-09', '2024-09']],
      note: 'MEng (after an MIT SB in 2023), not an SM. Profiles show her a current MEng student April to July 2024 and finished by October 2024; no thesis record found.' },

    { name: 'Henry Lieberman', role: 'Research scientist', word: 'Letizia',
      spans: [['1994-09', '2001-09'], ['2001-09', '2014-09', 'own', 'Software Agents group']],
      note: 'With Muriel Cooper until 1994, then a research scientist in Pattie\'s group (Letizia, Let\'s Browse, Apt Decision). Ran the group as Software Agents when Pattie went on leave in late 2001, and kept that name for his own group until September 2014. Now at CSAIL.' },
    { name: 'Joan Morris DiMicco', role: 'SM', word: 'Dynamic pricing',
      spans: [['1999-09', '2001-06']],
      note: 'Joan Morris then. Two years in the lab (her thesis); SM June 2001 (simulation-based dynamic pricing). Her 2005 PhD was with Walter Bender.' },
    { name: 'Jim Cruz-Youll', role: 'SM', word: 'P2P markets',
      spans: [['1999-09', '2001-09']],
      note: 'Jim Youll then. Arrived with Joan Morris in autumn 1999; SM September 2001 (peer-to-peer agent markets), "her last Software Agents graduate".' },
    { name: 'Hugo Liu', role: 'PhD', word: 'Point of view',
      spans: [['2003-09', '2006-06']],
      note: 'MEng (2002) and the start of his PhD with Henry Lieberman; moved to Pattie\'s new group when she returned in 2003 ("What Would They Think?", IUI 2004). PhD June 2006 (computing point of view).' },
    { name: 'Taya Leary', role: 'Staff', word: 'Admin & finance',
      spans: [['2009-01', '2014-02']],
      note: 'At the Media Lab from 2006 to 2014, first on behavioural-economics experiments for Dan Ariely\'s eRationality group, then as administrative and financial assistant to several groups, Fluid Interfaces among them (its contact in June to December 2009, still listed on her page in June 2010). When her time with Fluid Interfaces began and ended is not documented; 2009 to 2014 is the best estimate.' },

    { name: 'Sang-won Leigh', role: 'PhD', word: 'Robotic symbionts',
      spans: [['2013-09', '2018-08']],
      note: 'His CV: PhD with Pattie September 2013 to August 2018 (on the group page as a master\'s student in September 2013 and February 2014). Thesis 2018, Robotic symbionts. His MS was from KAIST.' },
    { name: 'Judith Amores', role: 'SM · PhD', word: 'Olfactory interfaces',
      spans: [['2014-01', '2014-09'], ['2014-09', '2016-06'], ['2016-06', '2020-09']],
      note: 'A visiting student on the group page in February 2014 (not yet in September 2013). SM 2016 (Essence), PhD September 2020 (olfactory interfaces), both with Pattie. Months of arrival and of the SM assumed.' },
    { name: 'Samantha Chan', role: 'Postdoc', word: 'Memory augmentation',
      spans: [['2022-10', '2024-12']],
      note: 'Postdoctoral fellow after a PhD at the University of Auckland\'s Augmented Human Lab. Her Media Lab profile is first archived in March 2023, so the autumn 2022 start is an estimate; she left to become an assistant professor at NTU in January 2025.' },
    { name: 'Nataliya Kosmyna', role: 'Postdoc · Scientist', word: 'Brain-computer interfaces',
      spans: [['2017-09', '2021-10'], ['2021-10', '2026-06']],
      note: 'Joined in 2017 after a postdoc at Inria (her profile; month assumed). A postdoctoral associate on her profile until at least September 2021, then a research scientist "from 2021 till 2026" (AttentivU, the cognitive cost of LLM chatbots); a research scientist still in April 2026.' },
    { name: 'Kye Shimizu', role: 'SM', word: 'Chemical interfaces',
      spans: [['2024-09', '2026-06']],
      note: 'A first-year master\'s student in autumn 2024 (his How to Make (Almost) Anything page); a graduate student on his profile until at least April 2026 and a former one by October 2026, so mid-2026 is assumed. Wearables that sense mood and modulate physiology.' },

    // Akshay Mohan: no record yet ties him to the group; waiting on Pattie's years.
  ],

  // People in the group now, who are on the themes page but not the timeline
  // (from the Fluid Interfaces members page, October 2026).
  current: [
    { name: 'Valdemar Danry', role: 'PhD student', word: 'Socratic AI' },
    { name: 'Wazeer Zulfikar', role: 'PhD student', word: 'Memoro' },
    { name: 'Auren Liu', role: 'PhD student', word: 'AI companions' },
    { name: 'Yasith Samaradivakara', role: 'Graduate student', word: 'Proactive wearables' },
    { name: 'Hyung Woon Lee', role: 'Graduate student', word: 'Wearable AI for learning' },
    { name: 'Manasi Vaidya', role: 'Graduate student', word: 'Agents for older adults' },
    { name: 'Nathan Whitmore', role: 'Research scientist', word: 'Sleep & memory' },
    { name: 'Cristina Velasquez Cobos', role: 'Graduate student', word: 'Slow-wave sleep' }
  ],

  // The themes page: threads that run through the group's work, each with
  // the four or five people whose work touched it, often decades apart.
  // Everyone is on one thread, people in the group now last; each is shown
  // with the word from their row unless the thread gives them another.
  themes: [
    { title: 'Agents that learn your taste',
      about: 'Recommenders and filters that learn what you like.',
      people: ['Max Metral', 'Upendra Shardanand', 'Henry Lieberman', 'Alexandros Moukas', 'Hugo Liu'] },
    { title: 'Agents you can trust',
      about: 'Matchmaking, reputation, decentralised agents, and agents that act for you.',
      people: ['Leonard Foner', 'Nelson Minar', 'Giorgos Zacharia', 'Manasi Vaidya'] },
    { title: 'Agents in the marketplace',
      about: 'Agents that shop, negotiate and set prices, and how people choose.',
      people: ['Robert Guttman', 'Daniele De Francesco', 'Joan Morris DiMicco', 'Jim Cruz-Youll',
               { name: 'Taya Leary', word: 'Behavioural economics' }] },
    { title: 'The traces people leave',
      about: 'What browsing, writing and everyday signals say about people.',
      people: ['Alan Wexelblat', 'Michael Best', 'Aaron Zinman', 'Yasith Samaradivakara'] },
    { title: 'Characters and companions',
      about: 'Synthetic creatures, AI characters and companions, and play at a distance.',
      people: ['Bruce Blumberg', 'Seth Hunter', 'Pat Pataranutaporn', 'Auren Liu'] },
    { title: 'Thinking with AI',
      about: 'Tools that help people learn, reason and stay curious.',
      people: ['Dhairya Dand', 'Caitlin Morris', 'Joanne Leong', 'Valdemar Danry', 'Hyung Woon Lee'] },
    { title: 'Objects, places and AR',
      about: 'Computing moved into objects, rooms, tools and data you can touch.',
      people: ['David Merrill', 'Anette von Kapri', 'Valentin Heun', 'Anirudh Sharma', 'Laura Perovich'] },
    { title: 'Bodies and new senses',
      about: 'Wearables that see, speak and move with the body, and plants that sense.',
      people: ['Suranga Nanayakkara', 'Sang-won Leigh', 'Harpreet Sareen', 'Arnav Kapur', 'Kye Shimizu'] },
    { title: 'Memory and the brain',
      about: 'Augmenting memory, and reading the brain.',
      people: ['Nataliya Kosmyna', 'Samantha Chan', 'Natasha Maniar', 'Wazeer Zulfikar', 'Nathan Whitmore'] },
    { title: 'Sleep and dreams',
      about: 'Shaping sleep and dreams, and listening to the body\u2019s own signals.',
      people: ['Judith Amores', 'Adam Haar Horowitz', 'Abhinandan Jain', 'Cristina Velasquez Cobos'] }
  ]
};
