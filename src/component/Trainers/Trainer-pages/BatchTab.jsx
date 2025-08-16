import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Search, Plus, Calendar, Clock, Users, BookOpen, TrendingUp, Filter, Grid, List, ChevronDown } from 'lucide-react';
import AddBatch from './AddBatch';
import styles from './BatchTab.module.css';
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt';
import axios from 'axios';
import { toast } from 'react-toastify';

const BatchTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const token = localStorage.getItem('token');
  // Spring animations for smooth interactions
  const searchSpring = useSpring(searchTerm ? 1 : 0, { stiffness: 400, damping: 25 });
  const searchScale = useTransform(searchSpring, [0, 1], [1, 1.02]);
  const searchShadow = useTransform(searchSpring, [0, 1], [0, 1]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 5,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const statsVariants = {
    hidden: { scale: 0, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.8
      }
    },
    hover: {
      scale: 1.05,
      rotate: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Skeleton loading component
  const SkeletonCard = ({ index }) => (
    <motion.div
      className={styles.skeletonCard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        className={styles.skeletonHeader}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      <div className={styles.skeletonContent}>
        <motion.div className={styles.skeletonLine} />
        <motion.div className={styles.skeletonLine} />
        <motion.div className={styles.skeletonLineShort} />
      </div>
    </motion.div>
  );

  // Fetch batches with enhanced loading
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}batches/trainer/my-batches`,{
        headers:{
          Authorization: token
        }
      });
      const decryptedData = await decryptText(response.data);
      console.log(`Fetched Batches:`, decryptedData);
      const batchArray = Array.isArray(decryptedData.batches) ? decryptedData.batches : [];
      setBatches(batchArray);
      setFilteredBatches(batchArray);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
      setBatches([]);
      setFilteredBatches([]);
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  // Enhanced filtering and sorting
  useEffect(() => {
    let result = batches;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(batch =>
        batch.batchCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batchTiming?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(batch => batch.status === filterStatus);
    }

    // Sort batches
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'oldest':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'students':
          return parseInt(b.numberOfStudents) - parseInt(a.numberOfStudents);
        case 'name':
          return a.batchCode.localeCompare(b.batchCode);
        default:
          return 0;
      }
    });

    setFilteredBatches(result);
  }, [batches, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    fetchBatches();
  }, []);

  // Delete batch with confirmation animation
  const deleteBatch = async (id) => {
    const result = await new Promise((resolve) => {
      const confirmModal = document.createElement('div');
      confirmModal.innerHTML = `
        <div class="${styles.confirmOverlay}">
          <div class="${styles.confirmModal}">
            <div class="${styles.confirmIcon}">⚠️</div>
            <h3>Delete Batch?</h3>
            <p>This action cannot be undone.</p>
            <div class="${styles.confirmActions}">
              <button class="${styles.confirmCancel}">Cancel</button>
              <button class="${styles.confirmDelete}">Delete</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(confirmModal);
      
      confirmModal.querySelector(`.${styles.confirmCancel}`).onclick = () => {
        document.body.removeChild(confirmModal);
        resolve(false);
      };
      
      confirmModal.querySelector(`.${styles.confirmDelete}`).onclick = () => {
        document.body.removeChild(confirmModal);
        resolve(true);
      };
    });

    if (!result) return;
    
    try {
      await axios.delete(`${baseurl}/api/v1/batches/${id}`);
      toast.success('Batch deleted successfully');
      fetchBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  // Toggle batch status with animation
  const toggleBatchStatus = async (batch) => {
    try {
      const newStatus = batch.status === 'Ongoing' ? 'Completed' : 'Ongoing';
      const updatedData = { ...batch, status: newStatus };
      const encryptedData = await encryptText(updatedData);
      
      await axios.put(`${baseurl}/api/v1/batches/${batch.id}`, {
        body: encryptedData
      });
      
      toast.success('Batch status updated successfully');
      fetchBatches();
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
    }
  };

  const handleAddBatch = () => {
    setEditingBatch(null);
    setIsModalOpen(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
    fetchBatches();
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Ongoing' ? styles.statusOngoing : styles.statusCompleted;
  };

  // Calculate stats
  const stats = {
    total: batches.length,
    ongoing: batches.filter(b => b.status === 'Ongoing').length,
    completed: batches.filter(b => b.status === 'Completed').length,
    totalStudents: batches.reduce((sum, batch) => sum + (parseInt(batch.numberOfStudents) || 0), 0)
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <motion.div
                className={styles.skeletonTitle}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                  duration: 2,
                  ease: 'linear',
                  repeat: Infinity,
                }}
              />
              <motion.div
                className={styles.skeletonSubtitle}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                  duration: 2,
                  ease: 'linear',
                  repeat: Infinity,
                  delay: 0.2,
                }}
              />
            </div>
          </div>
          
          <div className={styles.statsGrid}>
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                className={styles.skeletonStat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>

          <div className={styles.batchGrid}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.card} variants={itemVariants}>
        {/* Enhanced Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div className={styles.headerContent}>
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              Batch Management
            </motion.h1>
            <motion.p 
              className={styles.subtitle}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              Manage your training batches with ease
            </motion.p>
          </div>
          <motion.button
            className={styles.createBtn}
            onClick={handleAddBatch}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            }}
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Plus size={20} />
            </motion.div>
            Add New Batch
          </motion.button>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div className={styles.controlsContainer} variants={itemVariants}>
          <motion.div 
            className={styles.searchContainer}
            style={{ scale: searchScale }}
          >
            <motion.div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search batches by code, timing, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    className={styles.clearSearch}
                    onClick={() => setSearchTerm('')}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.div className={styles.controlsRight}>
            <motion.button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={18} />
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </motion.button>

            <motion.div className={styles.viewToggle}>
              <motion.button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid size={18} />
              </motion.button>
              <motion.button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={18} />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className={styles.filtersPanel}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={styles.filterGroup}>
                <label>Status:</label>
                <motion.select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="all">All</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </motion.select>
              </div>
              <div className={styles.filterGroup}>
                <label>Sort by:</label>
                <motion.select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="students">Most Students</option>
                  <option value="name">Batch Code</option>
                </motion.select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Stats Cards */}
        <motion.div className={styles.statsGrid} variants={itemVariants}>
          {[
            { icon: BookOpen, label: 'Total Batches', value: stats.total, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
            { icon: TrendingUp, label: 'Ongoing', value: stats.ongoing, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            { icon: Calendar, label: 'Completed', value: stats.completed, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
            { icon: Users, label: 'Total Students', value: stats.totalStudents, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              variants={statsVariants}
              whileHover="hover"
              style={{
                background: `linear-gradient(135deg, ${stat.bgColor} 0%, rgba(255, 255, 255, 0.8) 100%)`
              }}
            >
              <motion.div 
                className={styles.statIcon}
                style={{ color: stat.color }}
                whileHover={{ 
                  rotate: 360,
                  scale: 1.2
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <stat.icon size={24} />
              </motion.div>
              <div className={styles.statContent}>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {stat.label}
                </motion.h3>
                <motion.p
                  className={styles.statNumber}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: index * 0.1 + 0.2
                  }}
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Batch Grid */}
        <motion.div 
          className={`${styles.batchGrid} ${viewMode === 'list' ? styles.listView : ''}`}
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                className={styles.batchCard}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
                whileTap="tap"
                layout
                transition={{
                  layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <motion.div className={styles.cardGlow} />
                
                <div className={styles.cardHeader}>
                  <motion.h3 
                    className={styles.batchCode}
                    whileHover={{ scale: 1.05 }}
                  >
                    {batch.batchCode}
                  </motion.h3>
                  <motion.span
                    className={`${styles.statusBadge} ${getStatusBadgeClass(batch.status)}`}
                    onClick={() => toggleBatchStatus(batch)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ cursor: 'pointer' }}
                  >
                    {batch.status}
                  </motion.span>
                </div>

                <div className={styles.cardContent}>
                  <motion.div className={styles.cardInfo}>
                    <div className={styles.infoItem}>
                      <Clock size={16} />
                      <span>{batch.batchTiming}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <span>{new Date(batch.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <Users size={16} />
                      <span>{batch.numberOfStudents} students</span>
                    </div>
                  </motion.div>
                </div>

                <motion.div className={styles.cardActions}>
                  <motion.button
                    onClick={() => handleEditBatch(batch)}
                    className={styles.editButton}
                    whileHover={{ scale: 1.05, backgroundColor: '#3b82f6' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => deleteBatch(batch.id)}
                    className={styles.deleteButton}
                    whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Empty State */}
        {filteredBatches.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.emptyState}
          >
            <motion.div
              className={styles.emptyIcon}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              📚
            </motion.div>
            <h3>No batches found</h3>
            <p>
              {searchTerm
                ? `No batches match your search "${searchTerm}"`
                : 'Get started by adding your first batch'}
            </p>
            {!searchTerm && (
              <motion.button 
                onClick={handleAddBatch} 
                className={styles.emptyStateButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Add First Batch
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleModalClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <AddBatch
                onClose={handleModalClose}
                editingBatch={editingBatch}
                onSuccess={() => {
                  fetchBatches();
                  setIsModalOpen(false);
                  setEditingBatch(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BatchTab;