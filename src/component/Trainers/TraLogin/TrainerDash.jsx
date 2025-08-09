import React, { useState } from "react";
import styles from "./TrainerDash.module.css";

const TrainerDash = () => {
  const [profile, setProfile] = useState({
    name: "",
    empId: "",
    email: "",
    phone: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, photo: URL.createObjectURL(file) });
    }
  };

  const handleUpdate = () => {
    console.log("Updated Profile:", profile);
    alert("Profile updated successfully!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Title */}
        <h2 className={styles.title}>Profile Setup</h2>

        {/* Top section with profile photo on right */}
        <div className={styles.topSection}>
          {/* Info Section */}
          <div className={styles.infoSection}>
            <label>Name</label>
            <input
              placeholder="Enter your name"
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />

            <label>Employee ID</label>
            <input
              placeholder="Employee ID"
              type="text"
              name="empId"
              value={profile.empId}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              placeholder="Email"
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />

            <label>Phone Number</label>
            <input
                placeholder="phone number"
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>

          {/* Profile Photo Section */}
          <div className={styles.photoWrapper}>
            <img
              src={
                profile.photo ||
                "https://via.placeholder.com/150?text=Profile+Photo"
              }
              alt=""
              className={styles.profilePhoto}
            />
            <label className={styles.uploadBtn}>
              Change
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>
        </div>

        {/* Update Button */}
        <button className={styles.updateBtn} onClick={handleUpdate}>
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default TrainerDash;
