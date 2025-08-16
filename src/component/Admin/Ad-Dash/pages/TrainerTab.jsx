import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, MoreVertical, Edit, Trash2, Plus, User, Mail, Phone, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './TrainerTab.module.css';
import AddTrainer from './AddTrainer';
import { baseurl, decryptText, encryptText } from '../../../../utils/encryptdecrypt';
import axios from 'axios';

const TrainerTab = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showEditTrainer, setShowEditTrainer] = useState(false);
  const [editTrainerData, setEditTrainerData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUltraSmall, setIsUltraSmall] = useState(false);

  // Mobile detection hook with ultra-small screen support
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 575);
      setIsUltraSmall(width <= 320);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleStatus = async (id) => {
    const trainer = trainers.find(t => t._id === id);
    if (!trainer) return;

    const updatedStatus = !trainer.status;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const updateData = { status: updatedStatus };
      const encryptedData = await encryptText(updateData);
      
      const response = await axios.put(`${baseurl}trainers/${id}`, {
        body: encryptedData
      }, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedResponse = await decryptText(response.data.data);
      console.log("Status updated:", decryptedResponse);
      
      setTrainers((prev) =>
        prev.map((trainer) =>
          trainer._id === id ? { ...trainer, status: updatedStatus } : trainer
        )
      );
      
      toast.success(`Trainer ${updatedStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!trainerToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${baseurl}/trainers/${trainerToDelete._id}`, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedResponse = await decryptText(response.data.data);
      console.log("Trainer deleted:", decryptedResponse);
      
      setTrainers(prev => prev.filter(trainer => trainer._id !== trainerToDelete._id));

      toast.success("Trainer deleted successfully!");
      closeDeleteConfirm();
    } catch (error) {
      console.error("Error deleting trainer:", error);
      toast.error("Failed to delete trainer");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (trainerId) => {
    setOpenDropdown(openDropdown === trainerId ? null : trainerId);
  };

  const openDetails = (trainer) => setSelectedTrainer(trainer);
  const closeDetails = () => setSelectedTrainer(null);
  const openAddTrainer = () => setShowAddTrainer(true);
  const closeAddTrainer = () => setShowAddTrainer(false);
  
  const openEditTrainer = (trainer) => {
    setEditTrainerData(trainer);
    setShowEditTrainer(true);
    setOpenDropdown(null);
  };
  
  const closeEditTrainer = () => {
    setShowEditTrainer(false);
    setEditTrainerData(null);
  };

  const openDeleteConfirm = (trainer) => {
    setTrainerToDelete(trainer);
    setShowDeleteConfirm(true);
    setOpenDropdown(null);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setTrainerToDelete(null);
  };

  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseurl}/trainers`, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedData = await decryptText(response.data.data);
      console.log("Decrypted Trainers Data:", decryptedData);
      setTrainers(decryptedData.trainers || []);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast.error("Failed to fetch trainers");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && 
          !event.target.closest(`.${styles.dropdownContainer}`) &&
          !event.target.closest(`.${styles.mobileDropdownContainer}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

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
            <h1 className={styles.title}>Team Management</h1>
            <p className={styles.subtitle}>Manage your training team and their assignments</p>
          </div>
          <motion.button
            className={styles.createBtn}
            onClick={openAddTrainer}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Plus size={18} />
            {isUltraSmall ? "Add Trainer" : "Add New Trainer"}
          </motion.button>
        </motion.div>

        {/* Table */}
        <motion.div className={styles.tableContainer} variants={itemVariants}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Trainer</th>
                  <th>Employee ID</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className={styles.actionsHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {trainers.map((trainer, index) => (
                    <motion.tr
                      key={trainer._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={styles.tableRow}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                    >
                      <td className={styles.trainerCell}>
                        <div className={styles.trainerInfo}>
                          <motion.img
                            src={trainer.profileImg || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
                            alt={trainer.name}
                            className={styles.avatar}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                          <div>
                            <div className={styles.trainerName}>{trainer.name}</div>
                            <div className={styles.trainerEmail}>{trainer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.empId}>{trainer.empId}</td>
                      <td>
                        <span className={styles.roleTag}>{trainer.role}</span>
                      </td>
                      <td>
                        <motion.label 
                          className={styles.switch}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <input
                            type="checkbox"
                            checked={trainer.status}
                            onChange={() => toggleStatus(trainer._id)}
                            disabled={loading}
                          />
                          <motion.span 
                            className={styles.slider}
                            layout
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        </motion.label>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <motion.button
                            className={styles.actionBtn}
                            onClick={() => openDetails(trainer)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Eye size={18} />
                          </motion.button>
                          
                          <div className={styles.dropdownContainer}>
                            <motion.button
                              className={styles.actionBtn}
                              onClick={() => toggleDropdown(trainer._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <MoreVertical size={18} />
                            </motion.button>
                            
                            <AnimatePresence>
                              {openDropdown === trainer._id && (
                                <motion.div
                                  className={styles.dropdown}
                                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <motion.button
                                    className={styles.dropdownItem}
                                    onClick={() => openEditTrainer(trainer)}
                                    whileHover={{ backgroundColor: '#f8fafc', x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Edit size={16} />
                                    Edit
                                  </motion.button>
                                  <motion.button
                                    className={`${styles.dropdownItem} ${styles.deleteItem}`}
                                    onClick={() => openDeleteConfirm(trainer)}
                                    whileHover={{ backgroundColor: '#fef2f2', x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Card View for very small screens */}
        {isMobile && (
          <motion.div className={styles.mobileCardView} variants={itemVariants}>
            <AnimatePresence>
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={styles.mobileCard}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.mobileTrainerInfo}>
                      <img
                        src={trainer.profileImg || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
                        alt={trainer.name}
                        className={styles.mobileAvatar}
                      />
                      <div>
                        <div className={styles.mobileTrainerName}>
                          {isUltraSmall ? trainer.name.split(' ')[0] : trainer.name}
                        </div>
                        {!isUltraSmall && (
                          <div className={styles.mobileTrainerEmail}>{trainer.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.mobileActions}>
                      <motion.button
                        className={styles.mobileActionBtn}
                        onClick={() => openDetails(trainer)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye size={18} />
                      </motion.button>
                      
                      <div className={styles.mobileDropdownContainer}>
                        <motion.button
                          className={styles.mobileActionBtn}
                          onClick={() => toggleDropdown(trainer._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MoreVertical size={18} />
                        </motion.button>
                        
                        <AnimatePresence>
                          {openDropdown === trainer._id && (
                            <motion.div
                              className={styles.mobileDropdown}
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.button
                                className={styles.mobileDropdownItem}
                                onClick={() => openEditTrainer(trainer)}
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit size={16} />
                                Edit
                              </motion.button>
                              <motion.button
                                className={`${styles.mobileDropdownItem} ${styles.deleteMobileItem}`}
                                onClick={() => openDeleteConfirm(trainer)}
                                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={16} />
                                Delete
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileInfoRow}>
                      <span className={styles.mobileLabel}>ID:</span>
                      <span className={styles.mobileValue}>{trainer.empId}</span>
                    </div>
                    
                    {!isUltraSmall && (
                      <div className={styles.mobileInfoRow}>
                        <span className={styles.mobileLabel}>Email:</span>
                        <span className={styles.mobileValue}>{trainer.email}</span>
                      </div>
                    )}
                    
                    <div className={styles.mobileInfoRow}>
                      <span className={styles.mobileLabel}>Role:</span>
                      <span className={styles.mobileRoleTag}>{trainer.role}</span>
                    </div>
                    
                    <div className={styles.mobileInfoRow}>
                      <span className={styles.mobileLabel}>Status:</span>
                      <label className={styles.mobileSwitch}>
                        <input
                          type="checkbox"
                          checked={trainer.status}
                          onChange={() => toggleStatus(trainer._id)}
                        />
                        <span className={styles.mobileSlider}></span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Trainer Details Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetails}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className={styles.closeBtn}
                onClick={closeDetails}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <X size={20} />
              </motion.button>

              <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className={styles.modalTitle}>Trainer Profile</h2>

                <div className={styles.profileSection}>
                  <motion.img
                    src={selectedTrainer.profileImg || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={selectedTrainer.name}
                    className={styles.profileImage}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <div className={styles.profileDetails}>
                    <h3 className={styles.profileName}>{selectedTrainer.name}</h3>
                    <p className={styles.profileRole}>{selectedTrainer.role}</p>
                    
                    <div className={styles.contactInfo}>
                      <div className={styles.contactItem}>
                        <User size={16} />
                        <span>{selectedTrainer.empId}</span>
                      </div>
                      <div className={styles.contactItem}>
                        <Mail size={16} />
                        <span>{selectedTrainer.email}</span>
                      </div>
                      <div className={styles.contactItem}>
                        <Phone size={16} />
                        <span>{selectedTrainer.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.batchesSection}>
                  <h4 className={styles.sectionTitle}>
                    <Users size={20} />
                    Current Batches
                  </h4>
                  <div className={styles.batchGrid}>
                    {selectedTrainer.batches?.map((batch, idx) => (
                      <motion.div
                        key={idx}
                        className={styles.batchCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      >
                        <div className={styles.batchHeader}>
                          <h5 className={styles.batchCode}>{batch.code}</h5>
                          <span className={styles.studentCount}>{batch.students} students</span>
                        </div>
                        <div className={styles.batchInfo}>
                          <div className={styles.batchTiming}>
                            <Calendar size={14} />
                            {batch.timing}
                          </div>
                          <div className={styles.batchDuration}>
                            {batch.start} - {batch.end}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showAddTrainer && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddTrainer}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className={styles.closeBtn}
                onClick={closeAddTrainer}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              <AddTrainer onClose={closeAddTrainer} onSuccess={fetchTrainers} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Trainer Modal */}
      <AnimatePresence>
        {showEditTrainer && editTrainerData && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditTrainer}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className={styles.closeBtn}
                onClick={closeEditTrainer}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              <EditTrainer 
                trainer={editTrainerData} 
                onClose={closeEditTrainer} 
                onSuccess={fetchTrainers}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && trainerToDelete && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDeleteConfirm}
          >
            <motion.div
              className={styles.deleteModal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className={styles.deleteIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <Trash2 size={24} />
              </motion.div>
              
              <h3 className={styles.deleteTitle}>Delete Trainer</h3>
              <p className={styles.deleteMessage}>
                Are you sure you want to delete <strong>{trainerToDelete.name}</strong>? 
                This action cannot be undone and will remove all associated data.
              </p>
              
              <div className={styles.deleteActions}>
                <motion.button
                  className={styles.cancelBtn}
                  onClick={closeDeleteConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={styles.deleteBtn}
                  onClick={handleDelete}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// EditTrainer Component
const EditTrainer = ({ trainer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: trainer.name || "",
    empId: trainer.empId || "",
    email: trainer.email || "",
    phone: trainer.phone || "",
    password: "",
    role: trainer.role || "Trainer"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      const updateData = {
        name: formData.name,
        empId: formData.empId,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };
      
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      
      const encryptedData = await encryptText(updateData);
      
      const response = await axios.put(`${baseurl}trainers/${trainer._id}`, {
        body: encryptedData
      }, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedData = await decryptText(response.data.data);
      console.log("Trainer updated:", decryptedData);
      
      toast.success("Trainer updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating trainer:", error);
      try {
        const decryptedError = await decryptText(error.response?.data?.data);
        toast.error(decryptedError?.error || "Failed to update trainer");
      } catch {
        toast.error("Failed to update trainer");
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
      className={styles.editContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.editHeader} variants={itemVariants}>
        <h2 className={styles.editTitle}>Edit Trainer</h2>
        <p className={styles.editSubtitle}>Update trainer information</p>
      </motion.div>

      <form onSubmit={handleSubmit} className={styles.editForm}>
        <motion.div className={styles.editRow} variants={itemVariants}>
          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              <User size={18} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              <User size={18} />
              Employee ID
            </label>
            <input
              type="text"
              name="empId"
              value={formData.empId}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Enter employee ID"
              required
            />
          </div>
        </motion.div>

        <motion.div className={styles.editRow} variants={itemVariants}>
          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              <Phone size={18} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Enter phone number"
              required
            />
          </div>
        </motion.div>

        <motion.div className={styles.editRow} variants={itemVariants}>
          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.editSelect}
              required
            >
              <option value="Trainer">Trainer</option>
              <option value="Senior Trainer">Senior Trainer</option>
              <option value="Lead Trainer">Lead Trainer</option>
              <option value="Technical Trainer">Technical Trainer</option>
            </select>
          </div>

          <div className={styles.editInputGroup}>
            <label className={styles.editLabel}>
              Password (Optional)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Leave empty to keep current"
            />
          </div>
        </motion.div>

        <motion.div className={styles.editActions} variants={itemVariants}>
          <motion.button
            type="button"
            className={styles.editCancelBtn}
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className={styles.editSubmitBtn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loading ? (
              <motion.div
                className={styles.editSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              'Update Trainer'
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default TrainerTab;