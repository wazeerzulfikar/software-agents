# The Original Agents

Four software agents from Pattie Maes's Software Agents Group at the MIT Media Lab (1994–1999), recreated as working prototypes you can use in a browser. It was made as a keyboard-and-mouse exhibit for an MIT Media Lab alumni event.

Each prototype is drawn to match the original interface as it appears in the published figures, mainly those in Shneiderman and Maes's 1997 *interactions* debate, "Direct Manipulation vs. Interface Agents". Behind each screen is a small working version of the idea, so visitors can do a few real things with each agent instead of only looking at a picture of it.

| | Prototype | Original work | What a visitor can do |
|---|---|---|---|
| 1 | **HOMR** | Upendra Shardanand, Max Metral & Pattie Maes, 1994–1996 | Rate artists on the Firefly-era page and watch the recommendations change. HOMR finds the simulated members whose taste is closest to yours (constrained Pearson correlation on a 1–7 scale, as in Ringo) and predicts what you will like from theirs. |
| 2 | **Remembrance Agent** | Bradley Rhodes & Thad Starner, 1996 | Type in an Emacs 19 window and watch the bottom three lines suggest old e-mail and notes related to what you are writing. `C-c` then `1`, `2` or `3` opens a suggestion. |
| 3 | **Yenta** | Leonard Foner, 1995–1999 | Use Yenta 0.7.0's own pages: let it find your interests, read the messages its clusters carry, and reply to them. |
| 4 | **Kasbah** | Anthony Chavez & Pattie Maes, 1996 | Create a selling agent in Netscape and watch it bargain with buying agents. Its asking price falls from your start price toward your minimum by the deadline, in the linear, quadratic or cubic way the paper describes. |

## Running it

There is no build step and no server. Everything is plain HTML, CSS and JavaScript.

- **On a Mac, for the exhibit:** double-click `start.command`. It opens the start page full-screen in Google Chrome's kiosk mode, using a separate throwaway Chrome profile. Press Command-Q to leave.
- **Anywhere else:** open `index.html` in a browser.

Every page is laid out on a 1920×1080 stage that scales to fit the window, so it looks the same on a laptop screen or an external monitor.

### Controls

- On the start page, click a prototype or press `1`–`4`.
- Inside a prototype, the link at the top left goes back to the start page, and the controls at the bottom right move to the previous or next prototype or start the current one over.
- A prototype left untouched for 2.5 minutes shows a 15-second notice and then returns to the start page. The start page reloads itself after 15 minutes untouched, to refresh its live previews.

### URL parameters

| Parameter | Effect |
|---|---|
| `?noidle` | Turns off the return to the start page, which is useful while working on a prototype. |
| `?idle=30` | Sets the idle timeout in seconds (minimum 20), for testing it. |
| `?thumb` | Renders a prototype as the live preview used on the start page. |

## How it is made

- **Fidelity.** Layouts, colours and type are measured from the original figures and screenshots, not reconstructed from memory. Where the original artwork survives in a figure (the Firefly banner, Yenta's collage, Kasbah's welcome image), it is cut out and reused. Everything else is rebuilt in HTML and CSS at the original screen size and enlarged.
- **The Remembrance Agent** is drawn pixel by pixel on a canvas using the original X11 `misc-fixed` bitmap fonts. The text buffer is a small working editor, and the agent is a small working retrieval engine that searches three scopes around the cursor, as the paper describes.
- **The content is invented.** The music ratings, the Remembrance Agent's e-mail and notes, Yenta's messages and Kasbah's buyers are made up for the exhibit, written to be plausible for the mid-1990s. Anything presented as a quotation or a historical fact has been checked against the papers in `references/`.
- **Every visitor sees the same world.** Simulated members and buyers come from a seeded random number generator.

## Layout

```
index.html          start page
homr.html           prototype 1
remembrance.html    prototype 2
yenta.html          prototype 3
kasbah.html         prototype 4
start.command       opens the exhibit in Chrome kiosk mode (macOS)
css/                shell.css (shared) and one stylesheet per prototype
js/                 shell.js (scaling, navigation, idle reset) and one script per prototype
                    ra-corpus.js   the Remembrance Agent's e-mail and notes
                    xfonts.js      X11 misc-fixed bitmap fonts
assets/             images cut from the original figures, and the period fonts
references/         the papers the prototypes are based on
```

## References

These papers are included in [`references/`](references/).

- Ben Shneiderman and Pattie Maes. "Direct Manipulation vs. Interface Agents." *interactions* 4(6), November–December 1997. [`interface_agents.pdf`](references/interface_agents.pdf). The main source for all four screens.
- Pattie Maes. "Agents that Reduce Work and Information Overload." *Communications of the ACM* 37(7), July 1994. [`information_overload.pdf`](references/information_overload.pdf)
- Upendra Shardanand and Pattie Maes. "Social Information Filtering: Algorithms for Automating 'Word of Mouth'." *CHI '95*. [`word_of_mouth.pdf`](references/word_of_mouth.pdf). Ringo, which became HOMR and then Firefly.
- Beerud Sheth and Pattie Maes. "Evolving Agents for Personalized Information Filtering." *Proceedings of the Ninth IEEE Conference on Artificial Intelligence for Applications*, 1993. [`Evolving_agents_for_personalized_information_filtering.pdf`](references/Evolving_agents_for_personalized_information_filtering.pdf)
- Bradley J. Rhodes and Thad Starner. "Remembrance Agent: A Continuously Running Automated Information Retrieval System." AAAI Technical Report SS-96-02, 1996. [`remembrance_agent.pdf`](references/remembrance_agent.pdf)
- Bradley J. Rhodes and Pattie Maes. "Just-in-time Information Retrieval Agents." *IBM Systems Journal* 39(3–4), 2000. [`Just-in-time_information_retrieval_agents.pdf`](references/Just-in-time_information_retrieval_agents.pdf)

Also drawn on, but not included here:

- Leonard N. Foner. *Political Artifacts and Personal Privacy: The Yenta Multi-Agent Distributed Matchmaking System.* PhD dissertation, MIT, 1999. The source for Yenta 0.7.0's pages.
- Anthony Chavez and Pattie Maes. "Kasbah: An Agent Marketplace for Buying and Selling Goods." *PAAM '96*. The source for Kasbah's selling agents and their price strategies.

The papers and the artwork taken from their figures belong to their authors and publishers. They are included here for reference.
