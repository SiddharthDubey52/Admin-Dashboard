import React, { useEffect, useState } from "react";
import styles from "./TrainerTab.module.css";
import addTrainerStyles from "./AddTrainer.module.css";
import { Eye, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import AddTrainer from "./AddTrainer";
import { baseurl, decryptText, encryptText } from "../../../../utils/encryptdecrypt";
import axios from "axios";
import { toast } from "react-toastify";

const TrainerTab = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showEditTrainer, setShowEditTrainer] = useState(false);
  const [editTrainerData, setEditTrainerData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleStatus = async (id) => {
    const trainer = trainers.find(t => t._id === id);
    const updatedStatus = !trainer.status;
    
    try {
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
      
      // Update local state
      setTrainers((prev) =>
        prev.map((trainer) =>
          trainer._id === id ? { ...trainer, status: updatedStatus } : trainer
        )
      );
      
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const openDetails = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const closeDetails = () => {
    setSelectedTrainer(null);
  };

  const openAddTrainer = () => {
    setShowAddTrainer(true);
  };

  const closeAddTrainer = () => {
    setShowAddTrainer(false);
  };

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

  const handleDelete = async () => {
    if (!trainerToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${baseurl}/trainers/${trainerToDelete._id}`, {
        headers: {
          Authorization: token
        }
      });
      
      const decryptedResponse = await decryptText(response.data.data);
      console.log("Trainer deleted:", decryptedResponse);
      
      // Update local state
      setTrainers(prev => prev.filter(trainer => trainer._id !== trainerToDelete._id));
      
      toast.success("Trainer deleted successfully!");
      closeDeleteConfirm();
    } catch (error) {
      console.error("Error deleting trainer:", error);
      toast.error("Failed to delete trainer");
    }
  };

  const toggleDropdown = (trainerId) => {
    setOpenDropdown(openDropdown === trainerId ? null : trainerId);
  };
  const token = localStorage.getItem('token');
  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${baseurl}/trainers`, {
        headers: {
          Authorization: token
        }
      })
      // console.log("Trainers Data:", response.data);
      const decryptedData = await decryptText(response.data.data);
      console.log("Decrypted Trainers Data:", decryptedData);
      setTrainers(decryptedData.trainers)
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  }

  useEffect(() => {
    fetchTrainers();
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(`.${styles.dropdownContainer}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.subHeader}>
          <h2 className={styles.subTitle}>Role Management</h2>
          <button className={styles.createBtn} onClick={openAddTrainer}>Create New Role</button>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Role</th>
                <th>Status</th>
                <th className={styles.actionsCol}>Action</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td>{trainer.name}</td>
                  <td>{trainer.empId}</td>
                  <td>{trainer.role}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={trainer.status}
                        onChange={() => toggleStatus(trainer._id)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td className={styles.actions}>
                    <Eye
                      className={styles.iconButton}
                      size={20}
                      onClick={() => openDetails(trainer)}
                    />
                    <div className={styles.dropdownContainer}>
                      <MoreVertical
                        className={styles.iconButton}
                        size={20}
                        onClick={() => toggleDropdown(trainer._id)}
                      />
                      {openDropdown === trainer._id && (
                        <div className={styles.dropdown}>
                          <div 
                            className={styles.dropdownItem} 
                            onClick={() => openEditTrainer(trainer)}
                          >
                            <Edit size={16} />
                            Edit
                          </div>
                          <div 
                            className={styles.dropdownItem} 
                            onClick={() => openDeleteConfirm(trainer)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedTrainer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeDetails}>
              <X size={20} />
            </button>

            <h3 className={styles.modalTitle}>Trainer Details</h3>

            <div className={styles.trainerInfo}>
              <img
                src={selectedTrainer.profileImg}
                alt={selectedTrainer.name}
                className={styles.profileImg}
              />
              <div>
                <h4>{selectedTrainer.name}</h4>
                <p>Employee ID: {selectedTrainer.empId}</p>
                <p>Email: {selectedTrainer.email}</p>
                <p>Phone: {selectedTrainer.phone}</p>
              </div>
            </div>

            <h4 className={styles.batchTitle}>Current Batches</h4>
            <table className={styles.batchTable}>
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Timing</th>
                  <th>Students</th>
                  <th>Start Date</th>
                  <th>Est. End Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedTrainer?.batches?.map((batch, idx) => (
                  <tr key={idx}>
                    <td>{batch.code}</td>
                    <td>{batch.timing}</td>
                    <td>{batch.students}</td>
                    <td>{batch.start}</td>
                    <td>{batch.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AddTrainer Modal */}
      {showAddTrainer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeAddTrainer}>
              <X size={20} />
            </button>
            <AddTrainer onClose={closeAddTrainer} onSuccess={fetchTrainers} />
          </div>
        </div>
      )}

      {/* EditTrainer Modal */}
      {showEditTrainer && editTrainerData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeEditTrainer}>
              <X size={20} />
            </button>
            <EditTrainer 
              trainer={editTrainerData} 
              onClose={closeEditTrainer} 
              onSuccess={fetchTrainers}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && trainerToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3 className={styles.deleteTitle}>Confirm Delete</h3>
            <p className={styles.deleteMessage}>
              Are you sure you want to delete trainer "{trainerToDelete.name}"? 
              This action cannot be undone.
            </p>
            <div className={styles.deleteActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteBtn} 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// EditTrainer Component
const EditTrainer = ({ trainer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: trainer.name || "",
    empId: trainer.empId || "",
    email: trainer.email || "",
    phone: trainer.phone || "",
    password: "", // Add password field for editing
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data to send - only include password if it's provided
      const updateData = {
        name: formData.name,
        empId: formData.empId,
        email: formData.email,
        phone: formData.phone,
      };
      
      // Only include password if user entered one
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
      onSuccess(); // Refresh the trainers list
      onClose();
    } catch (error) {
      console.error("Error updating trainer:", error);
      const decryptedError = await decryptText(error.response?.data?.data);
      toast.error(decryptedError?.error || "Failed to update trainer");
    }
  };

  return (
    <div className={addTrainerStyles.modalContent}>
      <div className={addTrainerStyles.box}>
        <h2 className={addTrainerStyles.title}>Edit Trainer</h2>
        <form onSubmit={handleSubmit} className={addTrainerStyles.form}>
          <div className={addTrainerStyles.row}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="empId"
              placeholder="Employee ID"
              value={formData.empId}
              onChange={handleChange}
              required
            />
          </div>

          <div className={addTrainerStyles.row}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password (leave empty to keep current password)"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" className={addTrainerStyles.button}>
            Update Trainer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainerTab;
