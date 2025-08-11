import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AddTrainer.module.css';
import { baseurl, encryptText, decryptText } from '../../../../utils/encryptdecrypt';
import axios from 'axios';

const AddTrainer = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    phone: '',
    password: '',
    role: 'Trainer',
    // profileImg: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const encryptedData = await encryptText(formData);
      
      const response = await axios.post(`${baseurl}/trainers`, {
        body: encryptedData
      }, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedResponse = await decryptText(response.data.data);
      console.log("Trainer added:", decryptedResponse);
      
      toast.success('Trainer added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding trainer:', error);
      try {
        const decryptedError = await decryptText(error.response?.data?.data);
        toast.error(decryptedError?.error || 'Failed to add trainer');
      } catch {
        toast.error('Failed to add trainer');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <h2 className={styles.title}>Add New Trainer</h2>
        <p className={styles.subtitle}>Fill in the trainer information below</p>
      </motion.div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <motion.div className={styles.row} variants={itemVariants}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <User size={18} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <User size={18} />
              Employee ID
            </label>
            <input
              type="text"
              name="empId"
              value={formData.empId}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter employee ID"
              required
            />
          </div>
        </motion.div>

        <motion.div className={styles.row} variants={itemVariants}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Phone size={18} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter phone number"
              required
            />
          </div>
        </motion.div>

        <motion.div className={styles.row} variants={itemVariants}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="Trainer">Trainer</option>
              <option value="Senior Trainer">Senior Trainer</option>
              <option value="Lead Trainer">Lead Trainer</option>
              <option value="Technical Trainer">Technical Trainer</option>
            </select>
          </div>
        </motion.div>

        <motion.div className={styles.uploadSection} variants={itemVariants}>
          <label className={styles.uploadLabel}>
            <Upload size={20} />
            Profile Picture
            <span className={styles.optional}>(Optional)</span>
          </label>
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setFormData(prev => ({
                      ...prev,
                      profileImg: e.target?.result
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <div className={styles.uploadText}>
              <Upload size={24} />
              <span>Click to upload or drag and drop</span>
              <span className={styles.uploadHint}>PNG, JPG up to 10MB</span>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.actions} variants={itemVariants}>
          <motion.button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loading ? (
              <motion.div
                className={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              'Add Trainer'
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default AddTrainer;