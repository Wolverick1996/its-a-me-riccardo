type XpLogoProps = {
  /** BEM-style root class shared by every part of the lockup below it (`${prefix}-flag-wrap`, `${prefix}-text`, etc.) — e.g. "startup-screen-logo" or "login-screen-logo", each already styled in its own screen's CSS file. */
  prefix: string;
  /** Extra class appended to the text row, for ShutdownScreen's own positioning override. */
  textClassName?: string;
  /** Extra wrapper class around the "®xp" pair, for ShutdownScreen's fade/slide animation. */
  xpWrapperClassName?: string;
};

/** The flag+™+"Rick®xp" lockup shared by StartupScreen, LoginScreen, and ShutdownScreen — same markup shape, sized and positioned differently per screen through `prefix`. */
export default function XpLogo({
  prefix,
  textClassName,
  xpWrapperClassName,
}: XpLogoProps) {
  const xp = (
    <>
      <span className={`${prefix}-r-mark`} aria-hidden="true">
        &reg;
      </span>
      <span className={`${prefix}-xp`}>xp</span>
    </>
  );

  return (
    <div className={prefix}>
      <div className={`${prefix}-flag-wrap`}>
        <img src="/icon.svg" alt="" className={`${prefix}-flag`} />
        <span className={`${prefix}-tm`} aria-hidden="true">
          &trade;
        </span>
      </div>
      <div
        className={
          textClassName ? `${prefix}-text ${textClassName}` : `${prefix}-text`
        }
      >
        <span className={`${prefix}-rick`}>Rick</span>
        {xpWrapperClassName ? (
          <span className={xpWrapperClassName}>{xp}</span>
        ) : (
          xp
        )}
      </div>
    </div>
  );
}
