# A `.wav` existing on disk isn't proof XP played it by default

Windows lets Control Panel → Sounds and Audio Devices assign any `.wav` to any event, but a real out-of-the-box XP install leaves several plausible-sounding events on **"(None)"** — silent, even though a matching, correctly-named file exists on disk. `Windows XP Minimize.wav`, `Windows XP Menu Command.wav`, and `Windows XP Restore.wav` are exactly this trap, confirmed against the [ReactOS wiki's documented registry defaults](https://reactos.org/wiki/User:Petr-akhlamov/ReactOS_sound_schemes) (ReactOS reimplements Windows and records its exact default sound-scheme assignments) — real files, never actually assigned to anything in any XP/2003 release. Wiring a sound to an event just because the file is sitting right there would be less faithful to real XP, not more.

So most Desktop XP shell interactions — opening/closing/minimizing/maximizing/restoring a window, opening the Start menu — correspond to either a permanently-silent default or no real XP event at all, and stay unwired on purpose.

Start Windows/Logon is the one exception so far (see `AGENTS.md` for the ongoing check that keeps this list current as new interactions get added): clicking the account tile on the login screen plays `Windows XP Startup.mp3` on the Welcome screen before landing on the Desktop.
