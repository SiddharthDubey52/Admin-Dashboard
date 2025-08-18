import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Filter, 
  Grid, 
  List, 
  ChevronDown,
  Eye,
  MoreVertical,
  Edit,
  X,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import AddTopic from './AddTopic';
import styles from './TopicTab.module.css';
import { baseurl, decryptText, encryptText } from '../../../utils/encryptdecrypt';
import axios from 'axios';
import { toast } from 'react-toastify';

const TopicTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [selectedBatchTopics, setSelectedBatchTopics] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  
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
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: { 
      y: -8,
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Fetch topics with enhanced loading
  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}/topics/trainer/my-topics`, {
        headers: {
          Authorization: token
        }
      });
      const decryptedData = await decryptText(response.data.data);
      console.log(`Fetched Topics:`, decryptedData);
      const topicArray = Array.isArray(decryptedData.topics) ? decryptedData.topics : [];
      setTopics(topicArray);
      setFilteredTopics(topicArray);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to fetch topics');
      setTopics([]);
      setFilteredTopics([]);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  // Fetch batches for dropdown
  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${baseurl}/batches/trainer/my-batches`, {
        headers: {
          Authorization: token
        }
      });
      const decryptedData = await decryptText(response.data.data);
      const batchArray = Array.isArray(decryptedData.batches) ? decryptedData.batches : [];
      setBatches(batchArray);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
      setBatches([]);
    }
  };

  // Fetch topics for specific batch (for view modal)
  const fetchBatchTopics = async (batchId) => {
    try {
      const response = await axios.get(`${baseurl}/topics/batch/${batchId}`, {
        headers: {
          Authorization: token
        }
      });
      const decryptedData = await decryptText(response.data.data);
      const topicArray = Array.isArray(decryptedData.topics) ? decryptedData.topics : [];
      // Sort topics in descending order by start date
      const sortedTopics = topicArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setSelectedBatchTopics(sortedTopics);
    } catch (error) {
      console.error('Error fetching batch topics:', error);
      toast.error('Failed to fetch batch topics');
      setSelectedBatchTopics([]);
    }
  };

  // Enhanced filtering and sorting
  useEffect(() => {
    let result = topics;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(topic =>
        topic.topicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.batchCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(topic => topic.status === filterStatus);
    }

    // Sort topics
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'oldest':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'name':
          return a.topicName.localeCompare(b.topicName);
        case 'batch':
          return a.batchCode.localeCompare(b.batchCode);
        default:
          return 0;
      }
    });

    setFilteredTopics(result);
  }, [topics, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    fetchTopics();
    fetchBatches();
  }, []);

  // Handle opening add topic modal
  const handleAddTopic = () => {
    setSelectedTopic(null);
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  // Handle opening update topic modal
  const handleUpdateTopic = (topic) => {
    setSelectedTopic(topic);
    setEditingTopic(topic);
    setShowUpdateModal(true);
    setOpenDropdown(null);
  };

  // Handle viewing batch topics
  const handleViewTopics = (topic) => {
    setSelectedTopic(topic);
    fetchBatchTopics(topic.batchId);
    setShowTopicDetails(true);
    setOpenDropdown(null);
  };

  // Handle dropdown toggle
  const toggleDropdown = (topicId) => {
    setOpenDropdown(openDropdown === topicId ? null : topicId);
  };

  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setShowUpdateModal(false);
    setShowTopicDetails(false);
    setSelectedTopic(null);
    setEditingTopic(null);
    setSelectedBatchTopics([]);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      ongoing: { color: '#f59e0b', bg: '#fef3c7', text: 'Ongoing' },
      completed: { color: '#10b981', bg: '#d1fae5', text: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.ongoing;

    return (
      <motion.span
        className={styles.statusBadge}
        style={{ color: config.color, backgroundColor: config.bg }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {status === 'ongoing' && <AlertCircle size={12} />}
        {status === 'completed' && <CheckCircle2 size={12} />}
        {config.text}
      </motion.span>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={styles.skeletonGrid}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.skeletonCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: i * 0.2 
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.content}>
        {/* Header Section */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div className={styles.titleSection}>
            <motion.div
              className={styles.titleWrapper}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpen className={styles.titleIcon} size={28} />
              <div>
                <h1 className={styles.title}>Topic Management</h1>
                <p className={styles.subtitle}>Manage training topics and track progress</p>
              </div>
            </motion.div>
          </div>

          <motion.button
            className={styles.addButton}
            onClick={handleAddTopic}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Plus size={20} />
            Add Topic
          </motion.button>
        </motion.div>

        {/* Controls Section */}
        <motion.div className={styles.controls} variants={itemVariants}>
          <div className={styles.searchSection}>
            <motion.div
              className={styles.searchContainer}
              style={{ scale: searchScale }}
              whileFocus={{ scale: 1.02 }}
            >
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search topics, batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </motion.div>
          </div>

          <div className={styles.filterSection}>
            <motion.div
              className={styles.filterGroup}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Filter size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </motion.div>

            <motion.div
              className={styles.sortGroup}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TrendingUp size={18} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">By Topic Name</option>
                <option value="batch">By Batch Code</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div className={styles.contentSection} variants={itemVariants}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredTopics.length === 0 ? (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BookOpen size={64} className={styles.emptyIcon} />
              <h3>No Topics Found</h3>
              <p>Start by adding your first training topic</p>
              <motion.button
                className={styles.emptyButton}
                onClick={handleAddTopic}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                Add First Topic
              </motion.button>
            </motion.div>
          ) : (
            <div className={styles.topicsGrid}>
              <AnimatePresence>
                {filteredTopics.map((topic, index) => (
                  <motion.div
                    key={topic._id}
                    className={styles.topicCard}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    layout
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <BookOpen size={20} />
                        <h3>{topic.topicName}</h3>
                      </div>
                      <div className={styles.cardActions}>
                        <motion.button
                          className={styles.actionButton}
                          onClick={() => handleViewTopics(topic)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Topics"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <div className={styles.dropdownContainer}>
                          <motion.button
                            className={styles.actionButton}
                            onClick={() => toggleDropdown(topic._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MoreVertical size={16} />
                          </motion.button>
                          <AnimatePresence>
                            {openDropdown === topic._id && (
                              <motion.div
                                className={styles.dropdown}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <button
                                  className={styles.dropdownItem}
                                  onClick={() => handleUpdateTopic(topic)}
                                >
                                  <Edit size={14} />
                                  Update Topic
                                </button>
                                <button
                                  className={styles.dropdownItem}
                                  onClick={() => handleAddTopic()}
                                >
                                  <Plus size={14} />
                                  Add Topic
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardInfo}>
                        <div className={styles.infoItem}>
                          <Users size={16} />
                          <span>{topic.batchCode}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <Clock size={16} />
                          <span>{topic.batchTiming}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <Calendar size={16} />
                          <span>{new Date(topic.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className={styles.cardFooter}>
                        <StatusBadge status={topic.status} />
                        {topic.endDate && (
                          <span className={styles.endDate}>
                            End: {new Date(topic.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Topic Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className={styles.modalClose} onClick={closeModal}>
                <X size={20} />
              </button>
              <AddTopic
                onClose={closeModal}
                onSuccess={fetchTopics}
                batches={batches}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Topic Modal */}
      <AnimatePresence>
        {showUpdateModal && editingTopic && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className={styles.modalClose} onClick={closeModal}>
                <X size={20} />
              </button>
              <UpdateTopic
                topic={editingTopic}
                onClose={closeModal}
                onSuccess={fetchTopics}
                batches={batches}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Topic Details Modal */}
      <AnimatePresence>
        {showTopicDetails && selectedTopic && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.detailModal}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className={styles.detailHeader}>
                <h2>Topics for {selectedTopic.batchCode}</h2>
                <button className={styles.modalClose} onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.detailContent}>
                {selectedBatchTopics.length === 0 ? (
                  <div className={styles.emptyTopics}>
                    <BookOpen size={48} />
                    <p>No topics found for this batch</p>
                  </div>
                ) : (
                  <div className={styles.topicsList}>
                    {selectedBatchTopics.map((topic, index) => (
                      <motion.div
                        key={topic._id}
                        className={styles.topicItem}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={styles.topicItemHeader}>
                          <h4>{topic.topicName}</h4>
                          <StatusBadge status={topic.status} />
                        </div>
                        <div className={styles.topicItemDates}>
                          <span>Start: {new Date(topic.startDate).toLocaleDateString()}</span>
                          {topic.endDate && (
                            <span>End: {new Date(topic.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Update Topic Component
const UpdateTopic = ({ topic, onClose, onSuccess, batches }) => {
  const [formData, setFormData] = useState({
    batchId: topic.batchId || '',
    topicName: topic.topicName || '',
    status: topic.status || 'ongoing',
    startDate: topic.startDate ? new Date(topic.startDate).toISOString().split('T')[0] : '',
    endDate: topic.endDate ? new Date(topic.endDate).toISOString().split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        endDate: formData.status === 'completed' ? formData.endDate : null
      };

      const encryptedData = await encryptText(updateData);
      const response = await axios.put(`${baseurl}/topics/${topic._id}`, {
        body: encryptedData
      }, {
        headers: {
          Authorization: token
        }
      });

      const decryptedResponse = await decryptText(response.data.data);
      console.log("Topic updated:", decryptedResponse);
      toast.success("Topic updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Update Topic</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Users size={16} />
              Batch
            </label>
            <select
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Select Batch</option>
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
              placeholder="Enter topic name"
              className={styles.formInput}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <CheckCircle2 size={16} />
              Status
            </label>
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
        </div>

        {formData.status === 'completed' && (
          <div className={styles.formRow}>
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
                required
              />
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Topic'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicTab;
