import React, { useEffect, useState } from "react";
import styles from "./TrainerTab.module.css";
import { Eye, X } from "lucide-react";
import AddTrainer from "./AddTrainer";
import { baseurl, decryptText } from "../../../../utils/encryptdecrypt";
import axios from "axios";

const TrainerTab = () => {
  const [trainers, setTrainers] = useState([]);

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAddTrainer, setShowAddTrainer] = useState(false);

  const toggleStatus = (id) => {
    setTrainers((prev) =>
      prev.map((trainer) =>
        trainer._id === id ? { ...trainer, status: !trainer.status } : trainer
      )
    );
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
  const token = localStorage.getItem('token');
   const fetchTrainers = async () => {
        try {
          const response = await axios.get(`${baseurl}/trainers`,{
            headers : {
              Authorization:token
            }
          })
          // console.log("Trainers Data:", response.data);
          const decryptedData = await decryptText(response.data.data);
          console.log("Decrypted Trainers Data:", decryptedData);
          setTrainers(decryptedData.trainers)
        } catch (error) {
          
        }
      }
     useEffect(() => {
      fetchTrainers();
     },[])
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
            <AddTrainer onClose={closeAddTrainer} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerTab;
