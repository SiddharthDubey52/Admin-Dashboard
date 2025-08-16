import React, { useState } from 'react'
import styles from './AdminLog.module.css'
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AdminLog = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate();
   const navigateDash = () => {
         navigate('/dashboard');
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
          const response = await axios.post(`${baseurl}/adlogin`,{
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
        <h2 className={styles.title}>Admin Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
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

export default AdminLog