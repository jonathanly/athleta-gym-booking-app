---
name: Athleta
description: A calm operations desk for the gym's daily rhythm
colors:
  forest: "#192e27"
  forest-raised: "#30483c"
  forest-muted: "#bdcdc2"
  chalk: "#f6f6f2"
  white: "#ffffff"
  ink: "#202b27"
  secondary: "#5c6861"
  line: "#dce0d9"
  green: "#216b4a"
  green-dark: "#195237"
  green-light: "#eaf1ec"
  court-lime: "#d6e78a"
  amber: "#8a5c18"
  amber-light: "#fbf1de"
  red: "#a04439"
typography:
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "29px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.8px"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
rounded:
  control: "7px"
  badge: "5px"
  panel: "12px"
  dialog: "14px"
spacing:
  small: "8px"
  medium: "16px"
  panel: "20px"
  section: "24px"
  page: "36px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.green-dark}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  live-panel:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design system: Athleta

## Overview

**Creative North Star: “Calm operations”**

Staff use this workspace between classes and at the gym desk. It prioritises scanning the day, finding a member and recording an arrival. The user-approved compact operations prototype is the authority, not the incomplete legacy interface.

**Key Characteristics:** Calm, exact, welcoming. Brand sits in forest navigation and the live training panel; working surfaces stay chalk and white. The public sign-in screen shares that language without turning the application into a marketing site.

## Colors

Forest anchors navigation. Chalk is the working ground, white the data/form surface, ink the primary text and secondary green-grey the supporting text. Green means an actionable next step, particularly check-in. Court-lime is reserved for live activity inside the forest panel and active navigation icons. Amber marks capacity and cautions; red marks destructive actions and errors.

**The Live Activity Rule.** Use court-lime where a real current class or check-in count earns it; never scatter it across ordinary controls.

## Typography

Use the approved prototype's system UI stack. Page headings are 29px/600, section headings 16px/600, class names 14px/550 and metadata 11–12px. Mobile page headings are 27px. Forms remain at 13px with 12px labels; small metadata does not use negative tracking. Times, counts and dates use tabular numerals.

Use sentence case for labels and actions. Buttons name the operation: “Create class”, “Check in”, “Undo check-in”. Do not replace contextual headings with greeting headlines.

## Layout

Desktop has a 210px forest sidebar, a 60px topbar and fluid content with 36px horizontal padding. A single compact summary precedes the main class list. A 248px rail shows the current or next class and operational priorities. At 1230px the rail moves beneath the main list. At 1000px navigation narrows to 185px and class columns compact. At 760px navigation becomes a fixed bottom bar and content has bottom clearance. At 580px rows reflow into labelled groupings instead of shrinking desktop columns.

Forms use a two-column grid for closely related fields. Native modal dialogs protect consequential focused tasks, trap focus, support Escape and restore focus on close. Larger operations remain on their own pages. Use 8px within control groups, 16px between related blocks and 24–28px between sections.

## Elevation & Depth

Resting surfaces are flat, separated by quiet hairlines and tonal changes. Only modal dialogs use elevation: `0 16px 64px #12261c30`, with a translucent forest backdrop. No decorative gradients, glows or card hover motion.

## Shapes

Controls use 7px radii, panels 12px, dialogs 14px and status badges 5px. Avatars are circular initials, not fake portraits. Borders are 1px. Focus is a 3px green outline with 3px offset; on forest backgrounds it becomes court-lime.

## Components

- **Navigation:** Quiet forest rows, lighter forest active state and lime active icon. A roster belongs to Schedule. Admin and member routes expose separate navigation; session restoration precedes rendering protected content.
- **Class list:** Time, class/coach, booked places, textual status and explicit roster/edit actions. The live row uses a subtle green surface; capacity meters supplement numeric counts rather than replace them.
- **Live panel:** Forest with lime count/progress, pale primary roster link. Show only a real current or next class from the API.
- **Roster:** Initials, full name, email, textual attendance and direct reversible actions. Green check-in controls remain prominent. Upcoming and cancelled classes disable invalid actions. Started classes permit only name/description correction; scheduling fields are visibly locked.
- **Forms:** Persistent visible labels, native date/time and select controls, inline error recovery and disabled pending submit. Dropdown chevrons are inset exactly 12px from the right; reserve 36px right padding for text.
- **States:** Loading uses a small spinner plus text; errors use an alert and explicit retry; empty results explain the next useful action. Success uses a live status message. No fake-data fallback is shipped.
- **Time:** Display and edit classes in Australia/Melbourne, independent of browser timezone. Convert date filters to gym-local midnights, including 23/25-hour daylight-saving days. Reject nonexistent spring-forward wall times rather than silently shifting them.
- **Motion:** No entrance choreography. A small loading spinner is the only loop, disabled for reduced motion. State changes remain direct and do not move surrounding controls unnecessarily.

## Do's and Don'ts

- Do preserve compact density and readable row hierarchy.
- Do keep 12px dropdown-chevron insets consistent across all forms.
- Do present actual API counts and distinct permission-specific navigation.
- Do distinguish synthetic local demo seed records from real gym claims.
- Don't introduce gradients, decorative charts, fake avatars, emoji icons or all-caps labels.
- Don't ship fixtures, a role switch, browser token storage or fabricated fallback data.
- Don't reinterpret the approved design direction when adding a new workflow.

Design workflow uses the project-local Impeccable skill and Unslop by Damir Sokolovsky (@heydamir), CC BY 4.0. Their original licenses remain with the local skills.
