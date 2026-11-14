import "./ProfilePage.css";

function ProfilePage({ currentUser }) {
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "MeetNova User";

  const email = currentUser?.email || "Email not available";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const accountCreated = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Not available";

  const lastSignIn = currentUser?.metadata?.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Not available";

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-page-header">
        <div>
    
          <h1>My Profile</h1>
          <p>View your personal information and account details.</p>
        </div>
      </div>

      {/* Profile Hero */}
      <div className="profile-hero-card">
        <div className="profile-hero-avatar">
          {initials}
        </div>

        <div className="profile-hero-info">
          <h2>{displayName}</h2>
          <p>{email}</p>

          <span className="profile-status">
            <span></span>
            Active Account
          </span>
        </div>

        <div className="profile-account-badge">
          MeetNova Member
        </div>
      </div>

      {/* Information */}
      <div className="profile-details-grid">
        <div className="profile-details-card">
          <div className="profile-card-heading">
            <span>♙</span>
            <h3>Personal Information</h3>
          </div>

          <div className="profile-detail-item">
            <span>Full Name</span>
            <strong>{displayName}</strong>
          </div>

          <div className="profile-detail-item">
            <span>Email Address</span>
            <strong>{email}</strong>
          </div>

          <div className="profile-detail-item">
            <span>Account ID</span>
            <strong className="profile-uid">
              {currentUser?.uid || "Not available"}
            </strong>
          </div>
        </div>

        <div className="profile-details-card">
          <div className="profile-card-heading">
            <span>◷</span>
            <h3>Account Activity</h3>
          </div>

          <div className="profile-detail-item">
            <span>Account Created</span>
            <strong>{accountCreated}</strong>
          </div>

          <div className="profile-detail-item">
            <span>Last Sign In</span>
            <strong>{lastSignIn}</strong>
          </div>

          <div className="profile-detail-item">
            <span>Email Verification</span>
            <strong
              className={
                currentUser?.emailVerified
                  ? "profile-verified"
                  : "profile-unverified"
              }
            >
              {currentUser?.emailVerified
                ? "Verified"
                : "Not Verified"}
            </strong>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="profile-security-card">
        <div className="profile-security-icon">✓</div>

        <div>
          <h3>Your account is protected</h3>
          <p>
            Your MeetNova account authentication is managed securely
            through Firebase Authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;