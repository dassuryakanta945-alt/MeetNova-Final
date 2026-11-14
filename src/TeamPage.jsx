import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import "./TeamPage.css";

function TeamPage() {
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [memberDepartment, setMemberDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [members, setMembers] = useState([]);
  const [adminUid, setAdminUid] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setAdminUid(null);
      setMembers([]);
      return;
    }

    setAdminUid(user.uid);

    try {
      const membersRef = collection(
       db,
       "users",
        user.uid,
       "teamMembers"
      );

      const snapshot = await getDocs(membersRef);

      const loadedMembers = snapshot.docs.map((memberDoc) => ({
        ...memberDoc.data(),
        id: memberDoc.id,
      }));

      setMembers(loadedMembers);
    } catch (error) {
      console.error("Error loading team members:", error);
      setNotification({
        title: "Loading Failed",
        message: "Unable to load team members from the database.",
        type: "error",
      });
    }
  });

  return () => unsubscribe();
}, []);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [notification, setNotification] = useState(null);

  const showNotification = (title, message, type = "error") => {
  setNotification({ title, message, type });

  setTimeout(() => {
    setNotification(null);
  }, 3500);
};

const handleEditMember = (member) => {
  const predefinedRoles = [
    "Owner",
    "Co-Founder",
    "CEO",
    "CTO",
    "COO",
    "Director",
    "Admin",
    "General Manager",
    "Project Manager",
    "Product Manager",
    "Team Lead",
    "Department Head",
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer",
    "UI Designer",
    "UX Designer",
    "UI/UX Designer",
    "Graphic Designer",
    "Product Designer",
    "QA Engineer",
    "Software Tester",
    "Cyber Security Analyst",
    "Security Engineer",
    "IT Manager",
    "System Administrator",
    "Network Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Business Analyst",
    "Accountant",
    "Finance Manager",
    "Operations Manager",
    "HR Manager",
    "HR Executive",
    "Marketing Manager",
    "Digital Marketing Executive",
    "Sales Executive",
    "Customer Support",
    "Technical Support",
    "IT Support",
    "Intern",
    "Trainee",
    "Consultant",
    "Freelancer",
  ];

  const isPredefinedRole = predefinedRoles.includes(member.role);

  setEditingMemberId(member.id);
  setMemberName(member.name);
  setMemberEmail(member.email);
  setMemberRole(isPredefinedRole ? member.role : "Other");
  setCustomRole(isPredefinedRole ? "" : member.role);
  setMemberDepartment(member.department);
  setEmploymentType(member.employmentType);

  setSelectedMember(null);
  setShowAddMember(true);
};

  const handleAddMember = async (e) => {
  e.preventDefault();

  const name = memberName.trim();
  const email = memberEmail.trim().toLowerCase();

  const finalRole =
    memberRole === "Other" ? customRole.trim() : memberRole.trim();

  const department = memberDepartment.trim();
  const type = employmentType.trim();

  if (!name || !email || !finalRole || !department || !type) {
    showNotification("Missing Details", "Please fill in all member details.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotification("Invalid Email", "Please enter a valid email address.");
    return;
  }

  if (!adminUid) {
    showNotification("Authentication Required", "Please sign in again.");
    return;
  }

  const emailExists = members.some(
    (member) =>
      member.email.trim().toLowerCase() === email &&
      member.id !== editingMemberId
  );

  if (emailExists) {
    showNotification(
      "Member Already Added",
      "This email address is already registered as a team member."
    );
    return;
  }

  try {
    const membersRef = collection(db, "users", adminUid, "teamMembers");

    if (editingMemberId !== null) {
      const memberRef = doc(membersRef, editingMemberId);

      await updateDoc(memberRef, {
        name,
        email,
        role: finalRole,
        department,
        employmentType: type,
        updatedAt: serverTimestamp(),
      });

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === editingMemberId
            ? { ...member, name, email, role: finalRole, department, employmentType: type }
            : member
        )
      );

      showNotification(
        "Member Updated Successfully",
        `${name}'s details have been updated.`,
        "success"
      );
    } else {
      const newMember = {
        name,
        email,
        role: finalRole,
        department,
        employmentType: type,
        status: "Offline",
        joinedAt: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      };

      const newMemberRef = await addDoc(membersRef, newMember);

      setMembers((prevMembers) => [
        ...prevMembers,
        { ...newMember, id: newMemberRef.id },
      ]);

      showNotification(
        "Member Added Successfully",
        `${name} has been added to your MeetNova team.`,
        "success"
      );
    }

    setMemberName("");
    setMemberEmail("");
    setMemberRole("");
    setCustomRole("");
    setMemberDepartment("");
    setEmploymentType("");
    setEditingMemberId(null);
    setShowAddMember(false);
  } catch (error) {
    console.error("Error saving team member:", error);
    showNotification(
      "Save Failed",
      "Unable to save member details. Please try again."
    );
  }
};

  const closeAddMember = () => {
  setShowAddMember(false);
  setMemberName("");
  setMemberEmail("");
  setMemberRole("");
  setCustomRole("");
  setMemberDepartment("");
  setEmploymentType("");
  setEditingMemberId(null);
};

const handleDeleteMember = async () => {
  if (!memberToDelete || !adminUid) return;

  const deletedMemberName = memberToDelete.name;

  try {
    const memberRef = doc(
      db,
      "users",
      adminUid,
      "teamMembers",
      memberToDelete.id
    );

    await deleteDoc(memberRef);

    setMembers((prevMembers) =>
      prevMembers.filter(
        (member) => member.id !== memberToDelete.id
      )
    );

    setMemberToDelete(null);

    showNotification(
      "Member Deleted Successfully",
      `${deletedMemberName} has been removed from your team.`,
      "success"
    );
  } catch (error) {
    console.error("Error deleting team member:", error);

    showNotification(
      "Delete Failed",
      "Unable to delete this member. Please try again."
    );
  }
};

const filteredMembers = members.filter((member) => {
  const query = searchQuery.trim().toLowerCase();

  const matchesSearch =
    member.name.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query);

  const matchesDepartment =
    !filterDepartment || member.department === filterDepartment;

  const matchesRole =
    !filterRole || member.role === filterRole;

  const matchesStatus =
    !filterStatus || member.status === filterStatus;

  return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
});

  return (
    <div className="team-page">

      {notification && (
        <div
          className={`team-notification ${notification.type}`}
          role="alert"
        >
          <div className="team-notification-icon">
            {notification.type === "success" ? "✓" : "!"}
          </div>

          <div className="team-notification-content">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
      {/* Team Header */}
      <div className="team-header">
        <div>
          
          <h1>My Team</h1>
          <p>Connect, manage and collaborate with your team.</p>
        </div>

        <button
          className="team-add-button"
          type="button"
          onClick={() => setShowAddMember(true)}
        >
          ＋ Add Member
        </button>
      </div>

      {/* Overview Cards */}
      <div className="team-overview-grid">
        <div className="team-overview-card">
          <span>Total Members</span>
          <strong>{members.length}</strong>
          <small>People in your team</small>
        </div>

        <div className="team-overview-card">
          <span>Online Members</span>
          <strong>
            {members.filter((member) => member.status === "Online").length}
          </strong>
          <small>Currently active</small>
        </div>

        <div className="team-overview-card">
          <span>Offline Members</span>
          <strong>
            {members.filter((member) => member.status === "Offline").length}
          </strong>
          <small>Currently offline</small>
        </div>

        <div className="team-overview-card">
          <span>Meetings Together</span>
          <strong>0</strong>
          <small>Shared meetings</small>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="team-members-section">
        <div className="team-members-heading">
          <div>
            <h2>Team Members</h2>
            <p>Manage and connect with your team members.</p>
          </div>

          <span className="team-member-count">
            {members.length}{" "}
            {members.length === 1 ? "Member" : "Members"}
          </span>
        </div>

                {members.length > 0 && (
          <div className="team-search-box">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search team members by name or email"
            />
          </div>
        )}

        {members.length > 0 && (
  <div className="team-filter-box">
    <select
      value={filterDepartment}
      onChange={(e) => setFilterDepartment(e.target.value)}
      aria-label="Filter members by department"
    >
      <option value="">All Departments</option>
      <option value="Management">Management</option>
      <option value="Development">Development</option>
      <option value="Design">Design</option>
      <option value="Quality Assurance">Quality Assurance</option>
      <option value="Cyber Security">Cyber Security</option>
      <option value="IT & Operations">IT & Operations</option>
      <option value="Business & Finance">Business & Finance</option>
      <option value="Human Resources">Human Resources</option>
      <option value="Marketing & Sales">Marketing & Sales</option>
      <option value="Customer Support">Customer Support</option>
      <option value="Other">Other</option>
    </select>
  </div>
)}

{members.length > 0 && (
  <div className="team-role-filter">
    <select
      value={filterRole}
      onChange={(e) => setFilterRole(e.target.value)}
      aria-label="Filter members by role"
    >
      <option value="">All Roles</option>
      <option value="Owner">Owner</option>
      <option value="Co-Founder">Co-Founder</option>
      <option value="CEO">CEO</option>
      <option value="CTO">CTO</option>
      <option value="COO">COO</option>
      <option value="Director">Director</option>
      <option value="Admin">Admin</option>
      <option value="General Manager">General Manager</option>
      <option value="Project Manager">Project Manager</option>
      <option value="Product Manager">Product Manager</option>
      <option value="Team Lead">Team Lead</option>
      <option value="Department Head">Department Head</option>
      <option value="Software Developer">Software Developer</option>
      <option value="Frontend Developer">Frontend Developer</option>
      <option value="Backend Developer">Backend Developer</option>
      <option value="Full Stack Developer">Full Stack Developer</option>
      <option value="Mobile App Developer">Mobile App Developer</option>
      <option value="UI Designer">UI Designer</option>
      <option value="UX Designer">UX Designer</option>
      <option value="UI/UX Designer">UI/UX Designer</option>
      <option value="Graphic Designer">Graphic Designer</option>
      <option value="Product Designer">Product Designer</option>
      <option value="QA Engineer">QA Engineer</option>
      <option value="Software Tester">Software Tester</option>
      <option value="Cyber Security Analyst">Cyber Security Analyst</option>
      <option value="Security Engineer">Security Engineer</option>
      <option value="IT Manager">IT Manager</option>
      <option value="System Administrator">System Administrator</option>
      <option value="Network Engineer">Network Engineer</option>
      <option value="DevOps Engineer">DevOps Engineer</option>
      <option value="Cloud Engineer">Cloud Engineer</option>
      <option value="Business Analyst">Business Analyst</option>
      <option value="Accountant">Accountant</option>
      <option value="Finance Manager">Finance Manager</option>
      <option value="Operations Manager">Operations Manager</option>
      <option value="HR Manager">HR Manager</option>
      <option value="HR Executive">HR Executive</option>
      <option value="Marketing Manager">Marketing Manager</option>
      <option value="Digital Marketing Executive">Digital Marketing Executive</option>
      <option value="Sales Executive">Sales Executive</option>
      <option value="Customer Support">Customer Support</option>
      <option value="Technical Support">Technical Support</option>
      <option value="IT Support">IT Support</option>
      <option value="Intern">Intern</option>
      <option value="Trainee">Trainee</option>
      <option value="Consultant">Consultant</option>
      <option value="Freelancer">Freelancer</option>
      <option value="Other">Other</option>
    </select>
  </div>
)}

{members.length > 0 && (
  <div className="team-status-filter">
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      aria-label="Filter members by status"
    >
      <option value="">All Status</option>
      <option value="Online">Online</option>
      <option value="Offline">Offline</option>
    </select>
  </div>
)}

        {members.length === 0 ? (
          <div className="team-empty-state">
            <div className="team-empty-icon">♧</div>

            <h3>Your team starts here</h3>

            <p>
              Add members to collaborate and meet together.
            </p>

            <button
              className="team-add-button"
              type="button"
              onClick={() => setShowAddMember(true)}
            >
              ＋ Add Your First Member
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="team-empty-state">
            <div className="team-empty-icon">⌕</div>

            <h3>No members found</h3>

            <p>
              No team members match "{searchQuery}".
              Try searching with another name or email.
            </p>
          </div>
        ) : (
          <div className="team-members-list">
            {filteredMembers.map((member) => (
  <div className="team-member-card" key={member.id}>
    <div className="team-member-info">
      <h3>{member.name}</h3>

      <p>{member.email}</p>

      <p>
        <strong>Role:</strong> {member.role}
      </p>

      <p>
        <strong>Department:</strong> {member.department}
      </p>

      <p>
        <strong>Employment:</strong> {member.employmentType}
      </p>

      <span>{member.status}</span>

      <small>Joined: {member.joinedAt}</small>
         </div>

          <div className="team-member-actions">
        <button
           type="button"
           className="member-profile-button"
          onClick={() => setSelectedMember(member)}
        >
          Profile Details
       </button>

       <button
          type="button"
          className="member-edit-button"
          onClick={() => handleEditMember(member)}
        >
          Edit Member ✎
      </button>
      <button
         type="button"
         className="member-delete-button"
         onClick={() => setMemberToDelete(member)}
      >
         Delete
       </button>
    </div>
  </div>
))}
          </div>
        )}
      </div>

      {/* Member Profile Details */}
{selectedMember && (
  <div
    className="team-modal-overlay"
    onClick={() => setSelectedMember(null)}
  >
    <div
      className="team-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-profile-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="team-modal-header">
        <div>
          <h2 id="member-profile-title">Member Profile</h2>
          <p>Team member information and details.</p>
        </div>

        <button
          type="button"
          className="team-modal-close"
          onClick={() => setSelectedMember(null)}
          aria-label="Close member profile"
        >
          ×
        </button>
      </div>

      <div className="member-profile-details">
        <h3>{selectedMember.name}</h3>

        <p>{selectedMember.email}</p>

        <div>
          <strong>Role:</strong>
          <span>{selectedMember.role}</span>
        </div>

        <div>
          <strong>Department:</strong>
          <span>{selectedMember.department}</span>
        </div>

        <div>
          <strong>Employment:</strong>
          <span>{selectedMember.employmentType}</span>
        </div>

        <div>
          <strong>Status:</strong>
          <span>{selectedMember.status}</span>
        </div>

        <div>
          <strong>Joined:</strong>
          <span>{selectedMember.joinedAt}</span>
        </div>
      </div>
    </div>
  </div>
)}

{/* Delete Member Confirmation Modal */}
{memberToDelete && (
  <div
    className="team-modal-overlay"
    onClick={() => setMemberToDelete(null)}
  >
    <div
      className="team-modal delete-confirmation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-member-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="team-modal-header">
        <div>
          <h2 id="delete-member-title">Delete Team Member?</h2>
          <p>This action cannot be undone.</p>
        </div>

        <button
          type="button"
          className="team-modal-close"
          onClick={() => setMemberToDelete(null)}
          aria-label="Close confirmation"
        >
          ×
        </button>
      </div>

      <p className="delete-confirmation-message">
        Are you sure you want to remove{" "}
        <strong>{memberToDelete.name}</strong> from your team?
      </p>

      <div className="team-modal-actions">
        <button
          type="button"
          className="team-cancel-button"
          onClick={() => setMemberToDelete(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="member-delete-button"
          onClick={handleDeleteMember}
        >
          Delete Member
        </button>
      </div>
    </div>
  </div>
)}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="team-modal-overlay">
          <div
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
          >
            <div className="team-modal-header">
              <div>
                <h2 id="team-modal-title">
                  {editingMemberId !== null ? "Edit Team Member" : "Add Team Member"}
                </h2>

              <p>
               {editingMemberId !== null
                 ? "Update the member's details below."
                 : "Enter the member's details below."}
              </p>
              </div>

              <button
                className="team-modal-close"
                type="button"
                aria-label="Close modal"
                onClick={closeAddMember}
              >
                ×
              </button>
            </div>

            <form
              className="team-member-form"
              onSubmit={handleAddMember}
              noValidate
            >
              <div className="team-form-group">
                <label htmlFor="team-member-name">Full Name</label>

                <input
                  id="team-member-name"
                  type="text"
                  placeholder="Enter full name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
              </div>

              <div className="team-form-group">
                <label htmlFor="team-member-email">Email Address</label>

                <input
                  id="team-member-email"
                  type="email"
                  placeholder="Enter email address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
              </div>

              <div className="team-form-group">
  <label htmlFor="team-member-role">Role / Designation</label>

  <select
    id="team-member-role"
    value={memberRole}
    onChange={(e) => {
      setMemberRole(e.target.value);
      setCustomRole("");
    }}
  >
    <option value="">Select a role</option>

    <optgroup label="Leadership">
      <option value="Owner">Owner</option>
      <option value="Co-Founder">Co-Founder</option>
      <option value="CEO">CEO</option>
      <option value="CTO">CTO</option>
      <option value="COO">COO</option>
      <option value="Director">Director</option>
    </optgroup>

    <optgroup label="Management">
      <option value="Admin">Admin</option>
      <option value="General Manager">General Manager</option>
      <option value="Project Manager">Project Manager</option>
      <option value="Product Manager">Product Manager</option>
      <option value="Team Lead">Team Lead</option>
      <option value="Department Head">Department Head</option>
    </optgroup>

    <optgroup label="Development">
      <option value="Software Developer">Software Developer</option>
      <option value="Frontend Developer">Frontend Developer</option>
      <option value="Backend Developer">Backend Developer</option>
      <option value="Full Stack Developer">Full Stack Developer</option>
      <option value="Mobile App Developer">Mobile App Developer</option>
    </optgroup>

    <optgroup label="Design">
      <option value="UI Designer">UI Designer</option>
      <option value="UX Designer">UX Designer</option>
      <option value="UI/UX Designer">UI/UX Designer</option>
      <option value="Graphic Designer">Graphic Designer</option>
      <option value="Product Designer">Product Designer</option>
    </optgroup>

    <optgroup label="Quality & Security">
      <option value="QA Engineer">QA Engineer</option>
      <option value="Software Tester">Software Tester</option>
      <option value="Cyber Security Analyst">Cyber Security Analyst</option>
      <option value="Security Engineer">Security Engineer</option>
    </optgroup>

    <optgroup label="IT & Operations">
      <option value="IT Manager">IT Manager</option>
      <option value="System Administrator">System Administrator</option>
      <option value="Network Engineer">Network Engineer</option>
      <option value="DevOps Engineer">DevOps Engineer</option>
      <option value="Cloud Engineer">Cloud Engineer</option>
    </optgroup>

    <optgroup label="Business & Finance">
      <option value="Business Analyst">Business Analyst</option>
      <option value="Accountant">Accountant</option>
      <option value="Finance Manager">Finance Manager</option>
      <option value="Operations Manager">Operations Manager</option>
    </optgroup>

    <optgroup label="HR & Marketing">
      <option value="HR Manager">HR Manager</option>
      <option value="HR Executive">HR Executive</option>
      <option value="Marketing Manager">Marketing Manager</option>
      <option value="Digital Marketing Executive">Digital Marketing Executive</option>
      <option value="Sales Executive">Sales Executive</option>
    </optgroup>

    <optgroup label="Support & Other">
      <option value="Customer Support">Customer Support</option>
      <option value="Technical Support">Technical Support</option>
      <option value="IT Support">IT Support</option>
      <option value="Intern">Intern</option>
      <option value="Trainee">Trainee</option>
      <option value="Consultant">Consultant</option>
      <option value="Freelancer">Freelancer</option>
      <option value="Other">Other</option>
    </optgroup>
  </select>

  {memberRole === "Other" && (
    <input
      type="text"
      placeholder="Enter custom role"
      value={customRole}
      onChange={(e) => setCustomRole(e.target.value)}
    />
  )}
</div>
<div className="team-form-group">
  <label htmlFor="team-member-department">Department</label>

  <select
    id="team-member-department"
    value={memberDepartment}
    onChange={(e) => setMemberDepartment(e.target.value)}
  >
    <option value="">Select a department</option>
    <option value="Management">Management</option>
    <option value="Development">Development</option>
    <option value="Design">Design</option>
    <option value="Quality Assurance">Quality Assurance</option>
    <option value="Cyber Security">Cyber Security</option>
    <option value="IT & Operations">IT & Operations</option>
    <option value="Business & Finance">Business & Finance</option>
    <option value="Human Resources">Human Resources</option>
    <option value="Marketing & Sales">Marketing & Sales</option>
    <option value="Customer Support">Customer Support</option>
    <option value="Other">Other</option>
  </select>
</div>

<div className="team-form-group">
  <label htmlFor="team-member-employment">Employment Type</label>

  <select
    id="team-member-employment"
    value={employmentType}
    onChange={(e) => setEmploymentType(e.target.value)}
  >
    <option value="">Select employment type</option>
    <option value="Full-time">Full-time</option>
    <option value="Part-time">Part-time</option>
    <option value="Contract">Contract</option>
    <option value="Intern">Intern</option>
    <option value="Freelancer">Freelancer</option>
    <option value="Temporary">Temporary</option>
    <option value="Consultant">Consultant</option>
  </select>
</div>

              <div className="team-modal-actions">
                <button
                  type="button"
                  className="team-cancel-button"
                  onClick={closeAddMember}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="team-add-button"
                >
                   {editingMemberId !== null ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamPage;