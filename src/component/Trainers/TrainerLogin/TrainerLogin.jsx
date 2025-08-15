import React, { useState } from 'react'
import styles from './TrainerLogin.module.css'
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TrainerLogin = () => {
  const [formData, setFormData] = useState({
    empId: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate();
   const navigateDash = () => {
         navigate('/Tra-Dashboard');
   }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear message when user starts typing
    if (message) {
      setMessage('')
      setMessageType('')
    }
  }
console.log(formData)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const encryptdata = await encryptText(formData);
    console.log("Encrypted Data:", encryptdata);
    try{
          const response = await axios.post(`${baseurl}/trainer/login`,{
            body: encryptdata
          })
          const decryptResponse = await decryptText(response.data.data)
          // console.log("Response:", response.data.data);
          console.log("Decrypted Response:", decryptResponse);
          const token = decryptResponse.token;
          localStorage.setItem('token', token);
          navigateDash();

    }catch (error) {
      console.log("Login error:", error);
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}> Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="empId" className={styles.label}>
              empId
            </label>
            <input
              type="text"
              id="empId"
              name="empId"
              value={formData.empId}
              onChange={handleInputChange}
              placeholder="Enter your empId"
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <div className={messageType === 'error' ? styles.errorMessage : styles.successMessage}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default TrainerLogin;