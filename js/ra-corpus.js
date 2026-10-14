/* The Remembrance Agent's memory for this exhibit.
   Everything here is invented: plausible mid-1990s lab e-mail and notes files,
   written so that whatever a visitor types has a fair chance of reminding the
   agent of something. s = subject (the one-line summary), f = from, d = date,
   b = body. */
window.RA_CORPUS = [
  { s: 'Boston local: Wearable Computing talk take 2', f: 'wearables@media.mit.edu', d: 'Tue, 12 Nov 96',
    b: 'The wearable computing talk is being given again for people around Boston who missed it the first time. Same room, same slides, a little more augmented reality and a longer demo of the remembrance agent running on the wearable.\n\nIf you want to try a wearable computer yourself, come early. We will have two rigs with head-mounted displays and chord keyboards, and the talk covers how a user collects a database of private knowledge over time, how a colleague or co-worker can send a query to it without interrupting the user, and how an engineer might transfer that knowledge to a replacement.' },

  { s: 'mobile Linux web page', f: 'wearables@media.mit.edu', d: 'Mon, 4 Nov 96',
    b: 'The mobile Linux web page is up. It collects what a community of people running Linux on laptops and wearables have learned the hard way: which PCMCIA cards work, power management, getting X running on a tiny display.\n\nQuestions should go to the whole collective of people on the list, not just to individuals, so the answers end up on the page where everyone can benefit from the experience.' },

  { s: 'rebooting workstations in the agents area', f: 'necsys@media.mit.edu', d: 'Thu, 17 Oct 96',
    b: 'Several people have asked how to reboot a Sun workstation in the agents area when it hangs. Please do not just power cycle it.\n\nTo reboot a Sun workstation: type L1-A (Stop-A) on the console to get the ok prompt, type sync, wait for the disks to settle, then type boot. If the workstation still will not reboot, send mail to necsys and leave a note on the monitor. The HP workstations are different; ask before you touch those.' },

  { s: 'Remembrance Agent talk/discussion', f: 'agents@media.mit.edu', d: 'Wed, 24 Jan 96',
    b: 'Next agents lunch will be a talk and discussion about the Remembrance Agent, a program that runs continuously inside Emacs and suggests old email and notes files related to whatever you are writing.\n\nThe interesting design question is how to make the suggestions unobtrusive: one line each at the bottom of the screen, easy to ignore, one keystroke to read in full. Bring your own ideas for what else it should remember.' },

  { s: 'Paper Call: PRESENCE Special Issue', f: 'wearables@media.mit.edu', d: 'Tue, 15 Aug 95',
    b: 'Call for papers: a special issue of the journal Presence on augmented reality. Topics include head-mounted displays, registration, wearable computing and applications of augmented reality outside the laboratory.\n\nThe wearables paper is a natural fit. We should plan a section on the remembrance agent and one on the camera work.' },

  { s: 'Presence submission deadline Oct 1', f: 'wearables@media.mit.edu', d: 'Fri, 1 Sep 95',
    b: 'Reminder that the submission deadline for the Presence paper is October 1. Six copies, double spaced, figures at the end.\n\nDrafts of each section are due to the group a week before the deadline so that there is time to merge them into one paper. Do not leave the references for the last night.' },

  { s: 'CHI 97 debate: direct manipulation vs. interface agents', f: 'agents@media.mit.edu', d: 'Mon, 10 Mar 97',
    b: 'The debate at CHI 97 in Atlanta is on direct manipulation versus interface agents. The same debate happened at IUI in January and people enjoyed it.\n\nThe argument from our side: agents are not a replacement for a well designed interface. They are a complement. You still need a good direct manipulation interface, and the user has to be able to understand and control what the agent does. Slides are in the group directory if you want to look.' },

  { s: 'IUI 97 travel: flights and hotel', f: 'agents@media.mit.edu', d: 'Mon, 9 Dec 96',
    b: 'For those going to the Intelligent User Interfaces conference in Orlando in January: the conference hotel rate ends this Friday, so book your room now. Flights from Boston are cheapest if you stay over Saturday night.\n\nKeep every receipt. Send your travel dates to the group so we can share a car from the airport.' },

  { s: 'scuba diving in Florida after the conference?', f: 'agents@media.mit.edu', d: 'Wed, 11 Dec 96',
    b: 'Since a few of us will already be in Florida for IUI, is anyone interested in going scuba diving for a day or two afterwards? The Keys are a few hours south and the diving is supposed to be good in January.\n\nYou need a certification card to rent gear. If two more people are interested we can share a boat.' },

  { s: 'AAAI Spring Symposium: camera-ready copy', f: 'agents@media.mit.edu', d: 'Mon, 22 Jan 96',
    b: 'Camera-ready copy for the AAAI Spring Symposium at Stanford is due in two weeks. The page limit is strict and the format is two column.\n\nBoth the Kasbah paper and the remembrance agent paper are going. Please have a draft ready a few days before the deadline so someone else can read it.' },

  { s: 'thesis proposal draft, comments welcome', f: 'mas-students@media.mit.edu', d: 'Thu, 14 Mar 96',
    b: 'I have put a draft of my thesis proposal in my home directory. Comments welcome, especially on the evaluation section, which my committee will ask about first.\n\nThe hard part of a thesis proposal turns out to be saying what you will not do. I still need a third reader and a title that fits on one line.' },

  { s: 'sponsor week: demo schedule', f: 'all-lab@media.mit.edu', d: 'Mon, 6 May 96',
    b: 'Sponsor meetings are next week. Every group should have its demos running by Monday night. Sponsors will tour in groups of ten, fifteen minutes per demo, starting at nine.\n\nPlease tidy your area, label your demo, and have a one-page handout. If your demo needs the network, test it on the day, not the night before.' },

  { s: 'Lab 10th anniversary: open house and party', f: 'all-lab@media.mit.edu', d: 'Wed, 20 Sep 95',
    b: 'The Lab turns ten on 10/10. There will be an anniversary symposium in the morning, an open house with demos all afternoon, and a party in the evening for everyone who has ever worked here.\n\nAlumni and former students are coming back from all over, so expect old friends at your door asking what you are building now. Demo sign-up sheet is on the third floor.' },

  { s: 'agents group meeting moved to Thursday', f: 'agents@media.mit.edu', d: 'Tue, 8 Oct 96',
    b: 'Pattie has a faculty meeting on Wednesday, so this week the agents group meeting is moved to Thursday at noon. Lunch will be provided.\n\nAgenda: project updates, who is going to which conference, and a short discussion of what to show sponsors in the fall.' },

  { s: 'Kasbah test on Friday: bring something to sell', f: 'agents@media.mit.edu', d: 'Tue, 22 Oct 96',
    b: 'We are running a test of the Kasbah marketplace on Friday afternoon. Everyone gets an account. Create a selling agent or a buying agent, tell it your price and your deadline, and let the agents negotiate with each other.\n\nBring a used book or a music CD you would actually sell. The point is to see whether people are comfortable letting an agent make a deal for them.' },

  { s: 'Firefly: it thinks I like Toad the Wet Sprocket', f: 'agents@media.mit.edu', d: 'Thu, 29 Feb 96',
    b: 'I rated about forty artists on Firefly last night and its music recommendations are getting eerily good. It suggested three bands I had never heard of and I like two of them.\n\nIt works by finding other people whose ratings are similar to yours and recommending the music they love. It also thinks I will like Toad the Wet Sprocket. We shall see.' },

  { s: 'Yenta: looking for a few brave testers', f: 'agents@media.mit.edu', d: 'Mon, 3 Feb 97',
    b: 'Yenta is a matchmaking agent. It looks at your mail and files, works out what you are interested in, and finds other people who share those interests so it can introduce you.\n\nNothing leaves your machine unencrypted and there is no central server, which is the whole point. I am looking for people willing to run an early version and tell me what breaks.' },

  { s: 'Letizia: an agent that browses ahead of you', f: 'agents@media.mit.edu', d: 'Fri, 12 Apr 96',
    b: 'If you have not seen Letizia yet, ask for a demo. While you read a web page in Netscape it follows the links ahead of you and recommends the pages it thinks you will be interested in, based on what you have been reading.\n\nIt never takes control of the browser. It just looks over your shoulder and makes suggestions. It is a very cool demo.' },

  { s: 'mail agent keeps suggesting I delete the ski trip messages', f: 'agents@media.mit.edu', d: 'Wed, 15 Dec 93',
    b: 'The mail agent has been watching me read email for a month and now predicts what I will do with each message. It is right about deleting every message in the annual ski trip thread.\n\nThe little face in the corner looks pleased with itself. I have set the do-it threshold high so that it only makes suggestions and does not delete anything on its own yet.' },

  { s: 'calendar agent: please stop accepting meetings for me', f: 'agents@media.mit.edu', d: 'Mon, 19 Oct 92',
    b: 'The calendar agent learned that I always accept meeting invitations from one particular person and has started predicting accept with high confidence.\n\nI would like it to learn that I never schedule a meeting before ten in the morning. Apparently it needs a few more examples.' },

  { s: 'news agents: filtering Usenet', f: 'agents@media.mit.edu', d: 'Tue, 22 Feb 94',
    b: 'NewT now has four news agents running for me: business, politics, sports and computers. You train each one with examples of articles you want and articles you do not, and it filters the news feed for you.\n\nIt only matches keywords so far, but it already saves me an hour of reading news every day.' },

  { s: 'Twiddler chord keyboard cheat sheet', f: 'wearables@media.mit.edu', d: 'Fri, 7 Jun 96',
    b: 'Notes on learning the Twiddler one-handed chord keyboard. It takes about a weekend to learn the alphabet and a few weeks to reach useful typing speed.\n\nPractice while walking. Most people get to thirty words a minute. The chords for punctuation are on the laminated card taped inside the lid. Practice sentence: the quick brown fox jumps over the lazy dog.' },

  { s: 'Private Eye display flickers when I walk', f: 'wearables@media.mit.edu', d: 'Mon, 18 Mar 96',
    b: 'If your Private Eye head-mounted display flickers when you walk, it is the cable where it enters the display, not the software. Strain-relieve it with a loop of tape on the glasses frame.\n\nThe display is 720 by 280, red on black. You get used to reading text with one eye in about a day.' },

  { s: 'battery life on the wearable', f: 'wearables@media.mit.edu', d: 'Wed, 3 Jul 96',
    b: 'I am getting about six hours of battery life from two camcorder batteries with the disk spun down. The display draws almost nothing; the hard disk is what eats the power.\n\nCarry a spare battery and swap one at a time so you do not have to shut the computer down.' },

  { s: 'face recognition demo with the hat camera', f: 'vismod@media.mit.edu', d: 'Thu, 5 Sep 96',
    b: 'The face recognition code now runs on video from the small camera mounted in the baseball cap. In good light it puts the right name next to a face about four times out of five.\n\nIdea: feed the name of the person you are talking to into the remembrance agent so it can remind you what you last discussed with them.' },

  { s: 'GPS receiver serial settings', f: 'wearables@media.mit.edu', d: 'Tue, 30 Jul 96',
    b: 'The GPS receiver talks 4800 baud, 8 bits, no parity. It needs a clear view of the sky and takes a couple of minutes to find its location after power on. It does not work indoors.\n\nWith location the wearable could remind you of notes you took the last time you were standing in the same place.' },

  { s: 'emacs: turning on auto-fill everywhere', f: 'hackers@media.mit.edu', d: 'Sun, 14 Apr 96',
    b: 'To get auto-fill in every text buffer put this in your .emacs file:\n\n(add-hook \'text-mode-hook \'turn-on-auto-fill)\n(setq fill-column 75)\n\nThen Emacs breaks lines for you as you type. M-q refills a paragraph you have edited. Elisp questions are welcome on this list.' },

  { s: 'printer in the garden is out of toner again', f: 'necsys@media.mit.edu', d: 'Mon, 16 Sep 96',
    b: 'The laser printer in the garden is out of toner. A new cartridge is on order. Until it arrives please print to the printer on the fourth floor.\n\nAnd please stop sending two hundred page PostScript files to the printer the night before a paper deadline. Everyone else has a deadline too.' },

  { s: 'disk quota: home directories are full', f: 'necsys@media.mit.edu', d: 'Fri, 25 Oct 96',
    b: 'The file server holding home directories is ninety-eight percent full. If you are over your disk quota you will get mail tonight. Please delete core files and old video.\n\nBackups run at two in the morning. If you delete something by accident we can usually restore the file from tape.' },

  { s: 'account and password for the new UROP', f: 'necsys@media.mit.edu', d: 'Wed, 11 Sep 96',
    b: 'An account has been created for the new undergraduate in your group. The initial password is on a slip of paper in your mailbox. They must change the password the first time they log in.\n\nDo not send passwords by email.' },

  { s: 'network outage Saturday morning', f: 'necsys@media.mit.edu', d: 'Thu, 21 Nov 96',
    b: 'The building network will be down Saturday from six to ten in the morning while we replace a router. Mail will queue and be delivered afterwards.\n\nIf you have a demo for visitors on Saturday morning that needs the network, tell us today.' },

  { s: 'free pizza in the third floor kitchen', f: 'all-lab@media.mit.edu', d: 'Tue, 1 Oct 96',
    b: 'There is leftover pizza from the sponsor lunch in the third floor kitchen. Four boxes, some of it vegetarian. Free food never lasts more than ten minutes, so run.' },

  { s: 'coffee machine fund', f: 'agents@media.mit.edu', d: 'Mon, 13 Jan 97',
    b: 'The espresso machine needs a new gasket and we are out of coffee beans. If you drink the coffee, please put five dollars in the cup on top of the machine.\n\nWhoever keeps leaving the milk out overnight: we know who you are.' },

  { s: 'Friday movie night: Blade Runner', f: 'mas-students@media.mit.edu', d: 'Wed, 16 Oct 96',
    b: 'Movie night this Friday at eight in the auditorium: Blade Runner, on laserdisc, on the big screen. Bring popcorn.\n\nSuggestions for next month are welcome. The rule is that the film has to have at least one robot, computer or artificial intelligence in it.' },

  { s: 'summer sublet in Cambridge', f: 'mas-students@media.mit.edu', d: 'Sat, 20 Apr 96',
    b: 'Subletting my room for the summer, June through August. It is in a three bedroom apartment near Central Square in Cambridge, ten minutes walk to the Lab. Rent is 380 a month including heat.\n\nTwo friendly roommates and one cat.' },

  { s: 'bike for sale', f: 'mas-students@media.mit.edu', d: 'Thu, 22 May 97',
    b: 'I am graduating and cannot take my bike with me after graduation. Twelve speed road bicycle, new tires, comes with a lock and a helmet. Asking 90 dollars or best offer.\n\nI need to sell it before the end of the month.' },

  { s: 'ski trip sign-up', f: 'mas-students@media.mit.edu', d: 'Mon, 6 Jan 97',
    b: 'The annual ski trip is the last weekend in January, in Vermont. We have a house that sleeps sixteen. Sign up on the sheet outside my office and say whether you can drive.\n\nBeginners welcome. Lift tickets are cheaper if we buy as a group.' },

  { s: 'snow emergency: the Institute is closed', f: 'all-lab@media.mit.edu', d: 'Tue, 1 Apr 97',
    b: 'Because of the snow storm the Institute is closed today. More than two feet of snow fell overnight and the T is barely running. Please do not come in.\n\nIf you are already in the building, there is food in the kitchen and the weather is supposed to clear by evening.' },

  { s: 'travel reimbursement: what to hand in', f: 'agents@media.mit.edu', d: 'Fri, 31 Jan 97',
    b: 'To be reimbursed for conference travel, hand in the original receipts for your flight, hotel and registration, plus the travel form signed by your advisor. Meals are reimbursed up to the daily limit.\n\nIt takes about four weeks to get a check.' },

  { s: 'reading group: The Society of Mind', f: 'mas-students@media.mit.edu', d: 'Tue, 17 Sep 96',
    b: 'The reading group starts again next week with The Society of Mind by Marvin Minsky. We will read four chapters at a time. The idea of the book is that intelligence comes from many small agents, none of which is intelligent by itself.\n\nWednesdays at five. Cookies provided.' },

  { s: 'will computers ever really learn?', f: 'mas-students@media.mit.edu', d: 'Sun, 9 Feb 97',
    b: 'Continuing the argument from dinner about AI, artificial intelligence, and whether it will ever work. My claim: machine learning from examples will go a lot further than hand-written rules, because nobody can write down everything a person knows.\n\nYour claim was that a computer that only finds patterns does not understand anything. I think that in thirty years we will be having the same argument, with much bigger computers.' },

  { s: 'talk: Things That Think', f: 'all-lab@media.mit.edu', d: 'Mon, 2 Oct 95',
    b: 'There will be a talk on the new Things That Think consortium on Thursday at four. The idea is to put sensing and computing into everyday objects such as shoes, doorknobs and coffee cups, instead of into boxes on desks.\n\nRefreshments afterwards.' },

  { s: 'chili recipe for the group potluck', f: 'agents@media.mit.edu', d: 'Thu, 7 Nov 96',
    b: 'By request, the chili recipe from the potluck dinner: two onions, three cloves of garlic, two cans of kidney beans, one can of tomatoes, cumin, and more chili powder than seems wise. Cook it slowly for at least two hours.\n\nIt is better the next day.' },

  { s: 'directions to the restaurant in Chinatown', f: 'agents@media.mit.edu', d: 'Fri, 13 Dec 96',
    b: 'Directions for the group dinner tonight: take the Red Line to Downtown Crossing, walk down Washington Street, and turn left on Beach Street. The restaurant is on the right, up one flight of stairs.\n\nDinner is at seven. We have a table for fourteen.' },

  { s: 'phone numbers for the group', f: 'agents@media.mit.edu', d: 'Mon, 9 Sep 96',
    b: 'Updated phone list for the group is taped by the door. The fax number has changed. If you want to call the demo room, dial the main office and ask to be transferred.\n\nPlease add your home number if you want to be called when your machine falls over at night.' },

  { s: 'do not forget: Mom\'s birthday', f: 'notes/personal', d: 'Sat, 3 May 97',
    b: 'Mom\'s birthday is May 18. Call her in the morning, before she goes out. Send the card by the 14th at the latest. She liked the book of crossword puzzles last year. This year: the gardening one she mentioned at Thanksgiving.' },

  { s: 'dentist appointment moved', f: 'notes/personal', d: 'Wed, 26 Feb 97',
    b: 'Dentist appointment moved from Tuesday to Friday at 2:30. The office is on the second floor of the medical building. Bring the insurance card this time.' },

  { s: 'test', f: 'hackers@media.mit.edu', d: 'Mon, 1 Jul 96',
    b: 'Hello, this is a test message to see whether the list works. If you can read this, hello. Please ignore.' },

  { s: 'group web page has a new URL', f: 'agents@media.mit.edu', d: 'Tue, 5 Mar 96',
    b: 'The group web page has moved. Please update the links on your own home page. Every project should have a page with a paragraph of description, a picture and a list of papers.\n\nIf you do not know HTML, copy somebody else\'s page and change the words.' },

  { s: 'Java class starts next week', f: 'hackers@media.mit.edu', d: 'Wed, 24 Jan 96',
    b: 'A few of us are teaching ourselves Java and writing applets. We meet Tuesday evenings. No experience needed beyond some programming in C or Lisp.\n\nFirst exercise: an applet that draws something that moves.' },

  { s: 'concert at the Middle East on Saturday', f: 'mas-students@media.mit.edu', d: 'Thu, 10 Oct 96',
    b: 'A band some of you like is playing at the Middle East in Central Square on Saturday night. Tickets are eight dollars at the door. A group of us are going after dinner.\n\nBring earplugs, the room is loud.' },

  { s: 'parking stickers and T passes', f: 'all-lab@media.mit.edu', d: 'Tue, 27 Aug 96',
    b: 'Parking stickers for the fall are available from the parking office. Student T passes for the subway can be ordered through the Institute at a discount; the order form is due by the fifteenth of the month.' },

  { s: 'demo script for visitors', f: 'notes/demos', d: 'Sun, 5 May 96',
    b: 'Demo script for visitors. One: explain that the agent runs all the time and nobody has to ask it anything. Two: start typing about any topic and wait a few seconds. Three: point at the bottom of the screen and let them read the suggestions. Four: open one.\n\nPeople understand it fastest when the suggestion is something they had forgotten they knew.' },

  { s: 'general exam study group', f: 'mas-students@media.mit.edu', d: 'Mon, 3 Mar 97',
    b: 'Anyone taking the general exam this spring: we are forming a study group. We will swap reading lists and practice answering questions out loud.\n\nThe written exam is a take-home. The oral exam is two hours with your committee.' },

  { s: 'video shoot Thursday: wear your computer', f: 'wearables@media.mit.edu', d: 'Mon, 21 Apr 97',
    b: 'A television crew is filming on Thursday. They would like video of people wearing their computers while doing ordinary things: walking, talking, buying coffee.\n\nCharge your batteries the night before and expect to answer the question about whether you wear it in the shower.' },

  { s: 'what do we mean by "agent"?', f: 'agents@media.mit.edu', d: 'Wed, 5 Feb 97',
    b: 'For the web page, a definition we can all live with: a software agent is software that is personalized, proactive, long-lived and adaptive. It knows the individual user\'s habits and interests, it can take initiative, it keeps running while you do other things, and it tracks your interests as they change.\n\nIt does not have to look like a person, talk, or be especially intelligent.' },

  { s: 'notes: remembering names', f: 'notes/ideas', d: 'Sat, 8 Jun 96',
    b: 'Idea. The memory problem I actually have is not remembering facts on demand, it is not remembering that I have something to remember. I forget names, I forget that I already met someone, I forget that I wrote a note about exactly this a year ago.\n\nA memory aid should not wait to be asked.' },

  { s: 'Autonomous Agents 97: registration', f: 'agents@media.mit.edu', d: 'Mon, 16 Dec 96',
    b: 'Early registration for the First International Conference on Autonomous Agents in Marina del Rey closes at the end of the month. The conference is in February. Student registration is much cheaper if you send proof that you are a student.\n\nSeveral of us have papers there, including the one on Yenta.' },

  { s: 'UROP poster session', f: 'all-lab@media.mit.edu', d: 'Fri, 2 May 97',
    b: 'The undergraduate research poster session is next Friday in the lobby. If you supervise an undergraduate, please come by and ask them a hard question about their project. They have worked on these posters all term.' },

  { s: 'where did the group\'s old projects go?', f: 'agents@media.mit.edu', d: 'Thu, 12 Jun 97',
    b: 'Someone visiting asked to see a project from a few years ago and nobody could get it to run. The machine it ran on is gone and so is the person who wrote it.\n\nProposal: when you graduate, leave behind a page that says what it did, a screenshot, and a video. Software does not keep. In thirty or forty years, somebody may want to know what these things were like to use.' }
];
