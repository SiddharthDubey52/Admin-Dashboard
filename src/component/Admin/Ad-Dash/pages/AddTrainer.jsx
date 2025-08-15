import React, { useState } from "react";
import styles from "./AddTrainer.module.css";
import { baseurl, decryptText, encryptText } from "../../../../utils/encryptdecrypt";
import axios from "axios";
import { toast } from "react-toastify";

const AddTrainer = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  console.log("Form Data:", formData);
  const token = localStorage.getItem("token");
  const handleSubmit = async(e) => {
    // e.preventDefault();

    // console.log("Trainer Data:", formData);

    // setFormData({
    //   name: "",
    //   empId: "",
    //   email: "",
    //   phone: "",
    //   password: "",
    // });

    // alert("Trainer added successfully!");
    
    // Close the modal after successful submission
    e.preventDefault();
    const encryptedData = await encryptText(formData);
    
    try {
      const response = await axios.post(`${baseurl}/trainers`,{
        body: encryptedData
      },{
        headers:{
          Authorization: token
        }
      })
      const decryptedData = await decryptText(response.data);
      console.log("Decrypted Response Data:", decryptedData);
    } catch (error) {
      const decryptederror = await decryptText(error.response.data.data)
   toast.error(decryptederror.error)
      console.log("Error adding trainer:", decryptederror);


    }
    if (onClose) {
      onClose();
    }
  };
     
  return (
    <div className={styles.modalContent}>
      <div className={styles.box}>
        <h2 className={styles.title}>Add Trainer</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
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

          <div className={styles.row}>
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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className={styles.button}>
            Add Trainer
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTrainer;
