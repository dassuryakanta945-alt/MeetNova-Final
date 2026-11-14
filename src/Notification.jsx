import "./Notification.css";
function Notification({ type, message, onClose }) {
  return (
    <div className={`meetnova-notification ${type}`}>
      <div className="notification-icon">
  {type === "success" ? "✓" : type === "error" ? "!" : "i"}
</div>

<div className="notification-content">
  <strong>
    {type === "success" ? "Success" : type === "error" ? "Error" : "Notice"}
  </strong>
  <p>{message}</p>
</div>

<button
  type="button"
  className="notification-close"
  onClick={onClose}
>
  ×
</button>
    </div>
  );
}

export default Notification;