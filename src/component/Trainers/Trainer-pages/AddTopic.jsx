import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle2,
  Save,
  AlertCircle
} from 'lucide-react';
import { baseurl, encryptText, decryptText } from '../../../utils/encryptdecrypt';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './TopicTab.module.css';

const AddTopic = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    topicName: '',
    status: 'ongoing',
    startDate: '',
    endDate: ''
  });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const token = localStorage.getItem('token');
  const fetchBatches = async () => {
    try {
      setBatchesLoading(true);
      const response = await axios.get(`${baseurl}batches`, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedData = await decryptText(response.data);
      setBatches(decryptedData.batches || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to fetch batches");
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - only include endDate if status is completed
      const submitData = {
        ...formData,
        endDate: formData.status === 'completed' ? formData.endDate : null
      };

      const encryptedData = await encryptText(submitData);
      const response = await axios.post(`${baseurl}topics`, {
        body: encryptedData
      }, {
        headers: {
          Authorization: token
        }
      });

      const decryptedResponse = await decryptText(response.data.data);
      console.log("Topic created:", decryptedResponse);
      toast.success("Topic added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding topic:", error);
      try {
        const decryptedError = await decryptText(error.response?.data?.data);
        toast.error(decryptedError?.message || "Failed to add topic");
      } catch {
        toast.error("Failed to add topic");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear endDate when status changes to ongoing
      ...(name === 'status' && value === 'ongoing' && { endDate: '' })
    }));
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
      className={styles.formContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.formHeader} variants={itemVariants}>
        <div className={styles.formTitleWrapper}>
          <BookOpen size={24} className={styles.formIcon} />
          <div>
            <h2 className={styles.formTitle}>Add New Topic</h2>
            <p className={styles.formSubtitle}>Create a new training topic for your batch</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <motion.div className={styles.formRow} variants={itemVariants}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Users size={16} />
              Select Batch
            </label>
            <select
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              className={styles.formSelect}
              required
              disabled={batchesLoading}
            >
              <option value="">
                {batchesLoading ? "Loading batches..." : "Choose a batch..."}
              </option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchCode} - {batch.batchTiming}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <BookOpen size={16} />
              Topic Name
            </label>
            <input
              type="text"
              name="topicName"
              value={formData.topicName}
              onChange={handleChange}
              placeholder="Enter topic name (e.g., React Fundamentals)"
              className={styles.formInput}
              required
            />
          </div>
        </motion.div>

        <motion.div className={styles.formRow} variants={itemVariants}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <CheckCircle2 size={16} />
              Status
            </label>
            <div className={styles.statusContainer}>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              <div className={styles.statusHelper}>
                {formData.status === 'ongoing' ? (
                  <span className={styles.helperText}>
                    <AlertCircle size={14} />
                    Topic is currently in progress
                  </span>
                ) : (
                  <span className={styles.helperText}>
                    <CheckCircle2 size={14} />
                    Topic has been completed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Calendar size={16} />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>
        </motion.div>

        {formData.status === 'completed' && (
          <motion.div 
            className={styles.formRow}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={styles.formInput}
                min={formData.startDate} // End date cannot be before start date
                required
              />
              <span className={styles.helperText}>
                Required for completed topics
              </span>
            </div>
          </motion.div>
        )}

        <motion.div className={styles.formActions} variants={itemVariants}>
          <motion.button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !formData.batchId || !formData.topicName || !formData.startDate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loading ? (
              <motion.div
                className={styles.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <Save size={18} />
                Add Topic
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div className={styles.formFooter} variants={itemVariants}>
        <div className={styles.formHint}>
          <AlertCircle size={16} />
          <p>
            Select "Ongoing" for topics currently being taught, or "Completed" for finished topics.
            End date is required only for completed topics.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddTopic;
