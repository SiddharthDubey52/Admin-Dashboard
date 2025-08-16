import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Upload, Edit3, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './Profile.module.css';
import axios from 'axios';
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    dateOfJoining: '',
    profileImg: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch from API first
      try {
        const response = await axios.get(`${baseurl}profile`, {
          headers: {
            Authorization: token
          }
        });
        console.log("API response:", response.data);
        const decryptedData = await decryptText(response.data);
        console.log("Profile data:", decryptedData);
        
        setProfileData({
          name: decryptedData.trainer?.name || '',
          email: decryptedData.trainer?.email || '',
          phone: decryptedData.trainer?.phone || '',
          empId: decryptedData.trainer?.empId || '',
          dateOfJoining: decryptedData.trainer?.dateOfJoining ? new Date(decryptedData.trainer.dateOfJoining).toISOString().split('T')[0] : '',
          profileImg: decryptedData.trainer?.profileImg || ''
        });
        
        if (decryptedData.trainer?.profileImg) {
          setImagePreview(decryptedData.trainer.profileImg);
        }
      } catch (apiError) {
        console.error('Error fetching profile:', apiError);
        toast.error('Failed to load profile data');
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImageUploading(true);
        // Show loading state while uploading
        const token = localStorage.getItem('token');
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profileImage', file);
        
        toast.info('Uploading image...');
        
        // Upload image to API
        const response = await axios.post(`${baseurl}upload/profile-image`, formData, {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Decrypt the response to get the image URL
        const decryptedResponse = await decryptText(response.data.data);
        console.log('Image upload response:', decryptedResponse);
        const imageUrl = decryptedResponse.imageUrl;
        
        // Set the image preview and update profile data with the URL
        setImagePreview(imageUrl);
        setProfileData(prev => ({
          ...prev,
          profileImg: imageUrl
        }));
        
        toast.success('Image uploaded successfully!');
        
      } catch (error) {
        console.error('Error uploading image:', error);
        try {
          const decryptedError = await decryptText(error.response?.data?.data);
          toast.error(decryptedError?.message || 'Failed to upload image');
        } catch {
          toast.error('Failed to upload image');
        }
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      try {
        // Prepare data in the exact format you specified
        const profileDataToSend = {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          empId: profileData.empId,
          dateOfJoining: profileData.dateOfJoining,
          profileImg: profileData.profileImg // Plain URL as requested
        };
        
        console.log('Sending profile data:', profileDataToSend);
        const encryptedData = await encryptText(profileDataToSend);
        console.log('Encrypted data:', encryptedData);
        
        await axios.put(`${baseurl}profile`, {
          body: encryptedData
        }, {
          headers: {
            Authorization: token
          }
        });
        
        toast.success('Profile updated successfully!');
      } catch (apiError) {
        console.error('Error updating profile:', apiError);
        try {
          const decryptedError = await decryptText(apiError.response?.data?.data);
          toast.error(decryptedError?.message || 'Failed to update profile');
        } catch {
          toast.error('Failed to update profile');
        }
      }
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data without refetching
    fetchProfile();
    setImagePreview(profileData.profileImg);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.card} variants={itemVariants}>
        {/* Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Profile</h1>
            <p className={styles.subtitle}>Manage your profile information</p>
          </div>
          <div className={styles.headerActions}>
            {!isEditing ? (
              <motion.button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit3 size={18} />
                Edit Profile
              </motion.button>
            ) : (
              <div className={styles.editActions}>
                <motion.button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={18} />
                  Cancel
                </motion.button>
                <motion.button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div className={styles.profileContent} variants={itemVariants}>
          {/* Profile Image Section */}
          <motion.div className={styles.imageSection} variants={itemVariants}>
            <div className={styles.imageContainer}>
              {imagePreview || profileData.profileImg ? (
                <img
                  src={imagePreview || profileData.profileImg}
                  alt="Profile"
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <User size={48} />
                </div>
              )}
              {isEditing && (
                <div className={styles.imageOverlay}>
                  <label className={`${styles.uploadButton} ${imageUploading ? styles.uploading : ''}`}>
                    {imageUploading ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <Upload size={20} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.hiddenInput}
                      disabled={imageUploading}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className={styles.imageInfo}>
              <h3>{profileData.name || 'User Name'}</h3>
              <p>{profileData.empId || 'Employee ID'}</p>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div className={styles.formSection} variants={itemVariants}>
            <div className={styles.form}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <User size={18} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className={styles.displayValue}>
                      {profileData.name || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <Mail size={18} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className={styles.displayValue}>
                      {profileData.email || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <Phone size={18} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className={styles.displayValue}>
                      {profileData.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <User size={18} />
                    Employee ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="empId"
                      value={profileData.empId}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter employee ID"
                    />
                  ) : (
                    <div className={styles.displayValue}>
                      {profileData.empId || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <Calendar size={18} />
                    Date of Joining
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={profileData.dateOfJoining}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  ) : (
                    <div className={styles.displayValue}>
                      {profileData.dateOfJoining 
                        ? new Date(profileData.dateOfJoining).toLocaleDateString()
                        : 'Not provided'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Profile Stats */}
        <motion.div className={styles.statsSection} variants={itemVariants}>
          <h3 className={styles.statsTitle}>Profile Completion</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <User size={24} />
              </div>
              <div className={styles.statContent}>
                <h4>Profile Info</h4>
                <p>{Object.values(profileData).filter(val => val && typeof val === 'string' && val.trim() !== '').length}/6 fields completed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
