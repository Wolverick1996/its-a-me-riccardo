"use client";

export default function TurnOffDialog({
  onStandBy,
  onTurnOff,
  onCancel,
}: {
  onStandBy: () => void;
  onTurnOff: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="turn-off-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Turn off computer"
    >
      <div className="turn-off-dialog-title">
        <span className="turn-off-dialog-title-text">Turn off computer</span>
        <div className="turn-off-dialog-title-flag-wrap">
          <img src="/icon.svg" alt="" className="turn-off-dialog-title-flag" />
          <span className="turn-off-dialog-title-tm" aria-hidden="true">
            &trade;
          </span>
        </div>
      </div>
      <div className="turn-off-dialog-divider" />
      <div className="turn-off-dialog-options">
        <button
          type="button"
          className="turn-off-dialog-option"
          onClick={onStandBy}
        >
          <img
            src="/icons/desktop/Standby.png"
            alt=""
            draggable={false}
            className="turn-off-dialog-option-icon"
          />
          <span>Stand By</span>
        </button>
        <button
          type="button"
          className="turn-off-dialog-option"
          onClick={onTurnOff}
        >
          <img
            src="/icons/desktop/Power.png"
            alt=""
            draggable={false}
            className="turn-off-dialog-option-icon"
          />
          <span>Turn Off</span>
        </button>
      </div>
      <div className="turn-off-dialog-footer">
        <button
          type="button"
          className="turn-off-dialog-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
