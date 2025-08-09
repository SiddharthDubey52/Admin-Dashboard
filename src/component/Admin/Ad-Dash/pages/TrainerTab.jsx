import React, { useState } from "react";
import styles from "./TrainerTab.module.css";
import { Eye, X } from "lucide-react";

const TrainerTab = () => {
  const [trainers, setTrainers] = useState([
    {
      id: "EMP001",
      name: "John Doe",
      role: "Senior Trainer",
      status: true,
      email: "john.doe@example.com",
      phone: "+1 234 567 890",
      profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
      batches: [
        {
          code: "BATCH001",
          timing: "Mon, Wed 10:00 AM",
          students: 15,
          start: "2024-01-01",
          end: "2024-06-30",
        },
      ],
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      role: "Junior Trainer",
      status: true,
      email: "jane.smith@example.com",
      phone: "+1 987 654 321",
      profileImg: "https://randomuser.me/api/portraits/women/44.jpg",
      batches: [
        {
          code: "BATCH002",
          timing: "Tue, Thu 2:00 PM",
          students: 20,
          start: "2024-02-01",
          end: "2024-07-30",
        },
      ],
    },
  ]);

  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const toggleStatus = (id) => {
    setTrainers((prev) =>
      prev.map((trainer) =>
        trainer.id === id ? { ...trainer, status: !trainer.status } : trainer
      )
    );
  };

  const openDetails = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const closeDetails = () => {
    setSelectedTrainer(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.subHeader}>
          <h2 className={styles.subTitle}>Role Management</h2>
          <button className={styles.createBtn}>Create New Role</button>
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
                  <td>{trainer.id}</td>
                  <td>{trainer.role}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={trainer.status}
                        onChange={() => toggleStatus(trainer.id)}
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
                <p>Employee ID: {selectedTrainer.id}</p>
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
                {selectedTrainer.batches.map((batch, idx) => (
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
    </div>
  );
};

export default TrainerTab;
