import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Hash, CheckCircle, X, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './AddBatch.module.css';
import axios from 'axios';
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt';

const AddBatch = ({ onClose, onSuccess, editingBatch }) => {
  const [formData, setFormData] = useState({
    batchCode: editingBatch?.batchCode || '',
    batchTiming: editingBatch?.batchTiming || '',
    startDate: editingBatch?.startDate ? new Date(editingBatch.startDate).toISOString().split('T')[0] : '',
    expectedEndDate: editingBatch?.expectedEndDate ? new Date(editingBatch.expectedEndDate).toISOString().split('T')[0] : '',
    status: editingBatch?.status || 'Ongoing',
    numberOfStudents: editingBatch?.numberOfStudents || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Form validation
  const validateField = (name, value) => {
    switch (name) {
      case 'batchCode':
        return !value ? 'Batch code is required' : 
               value.length < 3 ? 'Batch code must be at least 3 characters' : '';
      case 'batchTiming':
        return !value ? 'Batch timing is required' : '';
      case 'startDate':
        return !value ? 'Start date is required' : '';
      case 'expectedEndDate':
        if (!value) return 'End date is required';
        if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
          return 'End date must be after start date';
        }
        return '';
      case 'numberOfStudents':
        return !value ? 'Number of students is required' :
               parseInt(value) < 1 ? 'Must be at least 1 student' : '';
      default:
        return '';
    }
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (touched[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0 && Object.keys(touched).length > 0);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const finalErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) finalErrors[key] = error;
    });
    
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const encryptedData = await encryptText(formData);
      
      let response;
      if (editingBatch) {
        response = await axios.put(`${baseurl}/api/v1/batches/${editingBatch.id}`, {
          body: encryptedData
        }, {
          headers: {
            Authorization: token
          }
        });
      } else {
        response = await axios.post(`${baseurl}/api/v1/batches`, {
          body: encryptedData
        }, {
          headers: {
            Authorization: token
          }
        });
      }
      
      const decryptedResponse = await decryptText(response.data.data);
      console.log("Batch saved:", decryptedResponse);
      
      toast.success(editingBatch ? 'Batch updated successfully!' : 'Batch added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving batch:', error);
      try {
        const decryptedError = await decryptText(error.response?.data?.data);
        toast.error(decryptedError?.message || 'Failed to save batch');
      } catch {
        toast.error('Failed to save batch');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    blur: { 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const steps = [
    { title: 'Basic Info', fields: ['batchCode', 'batchTiming'] },
    { title: 'Schedule', fields: ['startDate', 'expectedEndDate'] },
    { title: 'Details', fields: ['status', 'numberOfStudents'] }
  ];

  const currentStepFields = steps[step]?.fields || [];
  const canProceed = currentStepFields.every(field => 
    formData[field] && !errors[field]
  );

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header */}
      <motion.div className={styles.header} variants={itemVariants}>
        <motion.div className={styles.headerContent}>
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {editingBatch ? 'Edit Batch' : 'Add New Batch'}
          </motion.h2>
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {editingBatch ? 'Update batch information' : 'Create a new training batch'}
          </motion.p>
        </motion.div>
        
        <motion.button
          className={styles.closeBtn}
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          variants={itemVariants}
        >
          <X size={20} />
        </motion.button>
      </motion.div>

      {/* Progress Steps */}
      <motion.div className={styles.progressContainer} variants={itemVariants}>
        <div className={styles.progressBar}>
          <motion.div 
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <div className={styles.steps}>
          {steps.map((stepInfo, index) => (
            <motion.div
              key={index}
              className={`${styles.stepItem} ${index <= step ? styles.active : ''} ${index < step ? styles.completed : ''}`}
              whileHover={{ scale: 1.05 }}
              onClick={() => index < step && setStep(index)}
              style={{ cursor: index < step ? 'pointer' : 'default' }}
            >
              <motion.div 
                className={styles.stepNumber}
                animate={{
                  scale: index === step ? 1.2 : 1,
                  backgroundColor: index < step ? '#10b981' : index === step ? '#3b82f6' : '#e5e7eb'
                }}
                transition={{ duration: 0.3 }}
              >
                {index < step ? <Check size={14} /> : index + 1}
              </motion.div>
              <span className={styles.stepTitle}>{stepInfo.title}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className={styles.stepContent}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className={styles.stepFields}>
                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <Hash size={18} />
                    Batch Code
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.div className={styles.inputWrapper}>
                    <motion.input
                      type="text"
                      name="batchCode"
                      value={formData.batchCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.batchCode ? styles.error : touched.batchCode && !errors.batchCode ? styles.success : ''}`}
                      placeholder="Enter batch code (e.g., BATCH001)"
                      variants={inputVariants}
                      whileFocus="focus"
                      required
                    />
                    <AnimatePresence>
                      {touched.batchCode && !errors.batchCode && (
                        <motion.div
                          className={styles.successIcon}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.batchCode && (
                      <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle size={14} />
                        {errors.batchCode}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <Clock size={18} />
                    Batch Timing
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.div className={styles.inputWrapper}>
                    <motion.input
                      type="text"
                      name="batchTiming"
                      value={formData.batchTiming}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.batchTiming ? styles.error : touched.batchTiming && !errors.batchTiming ? styles.success : ''}`}
                      placeholder="Enter timing (e.g., 9:00 AM - 12:00 PM)"
                      variants={inputVariants}
                      whileFocus="focus"
                      required
                    />
                    <AnimatePresence>
                      {touched.batchTiming && !errors.batchTiming && (
                        <motion.div
                          className={styles.successIcon}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.batchTiming && (
                      <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle size={14} />
                        {errors.batchTiming}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Step 1: Schedule */}
            {step === 1 && (
              <div className={styles.stepFields}>
                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <Calendar size={18} />
                    Start Date
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.div className={styles.inputWrapper}>
                    <motion.input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.startDate ? styles.error : touched.startDate && !errors.startDate ? styles.success : ''}`}
                      variants={inputVariants}
                      whileFocus="focus"
                      required
                    />
                    <AnimatePresence>
                      {touched.startDate && !errors.startDate && (
                        <motion.div
                          className={styles.successIcon}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.startDate && (
                      <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle size={14} />
                        {errors.startDate}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <Calendar size={18} />
                    Expected End Date
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.div className={styles.inputWrapper}>
                    <motion.input
                      type="date"
                      name="expectedEndDate"
                      value={formData.expectedEndDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.expectedEndDate ? styles.error : touched.expectedEndDate && !errors.expectedEndDate ? styles.success : ''}`}
                      variants={inputVariants}
                      whileFocus="focus"
                      required
                    />
                    <AnimatePresence>
                      {touched.expectedEndDate && !errors.expectedEndDate && (
                        <motion.div
                          className={styles.successIcon}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.expectedEndDate && (
                      <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle size={14} />
                        {errors.expectedEndDate}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className={styles.stepFields}>
                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <CheckCircle size={18} />
                    Status
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.select}
                    variants={inputVariants}
                    whileFocus="focus"
                    required
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </motion.select>
                </motion.div>

                <motion.div className={styles.inputGroup} variants={itemVariants}>
                  <label className={styles.label}>
                    <Users size={18} />
                    Number of Students
                    <span className={styles.required}>*</span>
                  </label>
                  <motion.div className={styles.inputWrapper}>
                    <motion.input
                      type="number"
                      name="numberOfStudents"
                      value={formData.numberOfStudents}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.numberOfStudents ? styles.error : touched.numberOfStudents && !errors.numberOfStudents ? styles.success : ''}`}
                      placeholder="Enter number of students"
                      min="1"
                      variants={inputVariants}
                      whileFocus="focus"
                      required
                    />
                    <AnimatePresence>
                      {touched.numberOfStudents && !errors.numberOfStudents && (
                        <motion.div
                          className={styles.successIcon}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.numberOfStudents && (
                      <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle size={14} />
                        {errors.numberOfStudents}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Actions */}
        <motion.div className={styles.actions} variants={itemVariants}>
          {step > 0 && (
            <motion.button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(step - 1)}
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              ← Back
            </motion.button>
          )}
          
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

          {step < steps.length - 1 ? (
            <motion.button
              type="button"
              className={`${styles.nextBtn} ${!canProceed ? styles.disabled : ''}`}
              onClick={() => canProceed && setStep(step + 1)}
              whileHover={{ scale: canProceed ? 1.02 : 1, x: canProceed ? 2 : 0 }}
              whileTap={{ scale: canProceed ? 0.98 : 1 }}
              disabled={!canProceed}
            >
              Next →
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              className={`${styles.submitBtn} ${!isValid ? styles.disabled : ''}`}
              disabled={loading || !isValid}
              whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: isValid && !loading ? 0.98 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {loading ? (
                <motion.div className={styles.loadingContainer}>
                  <motion.div
                    className={styles.spinner}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Saving...</span>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    ✓
                  </motion.div>
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default AddBatch;