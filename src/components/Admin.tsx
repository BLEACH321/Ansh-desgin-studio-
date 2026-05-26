import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image as ImageIcon, Save, Trash2, Layout, ArrowLeft, Layers, MapPin, Calendar, Maximize, Ruler, RotateCcw, RefreshCw, Edit } from 'lucide-react';
import { useProjects, type Project } from '../hooks/useProjects';
import { useTeam, type TeamMember } from '../hooks/useTeam';
import { useHero } from '../hooks/useHero';
import { API_BASE_URL } from '../config';
import Footer from './Footer';
import { ImageEnhancer } from './ImageEnhancer';
import './Admin.css';

const Admin = ({ onExit }: { onExit: () => void }) => {
  const { projects, deletedProjects, addProject, deleteProject, restoreProject, updateProject, permanentlyDeleteProject } = useProjects();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [filter, setFilter] = useState<'all' | 'interior' | 'graphics' | 'architecture'>('all');
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'team' | 'hero'>('portfolio');

  // Image Quality Enhancer State
  const [enhancerSrc, setEnhancerSrc] = useState<string | null>(null);
  const [onEnhancerSave, setOnEnhancerSave] = useState<((url: string) => void) | null>(null);

  const readRawFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Team Management State
  const { members, deletedMembers, addMember, updateMember, deleteMember, restoreMember, permanentlyDeleteMember, restoreDefaultTeam } = useTeam();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    socials: ['INSTAGRAM']
  });

  // Hero Management State
  const { slides, updateSlide, addSlide, deleteSlide, restoreDefaultSlides } = useHero();
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [newSlide, setNewSlide] = useState<any>({});

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    show: boolean,
    title: string,
    message: string,
    onConfirm?: () => void,
    type: 'confirm' | 'alert'
  }>({
    show: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const [toast, setToast] = useState<{
    show: boolean,
    message: string,
    lastDeleted?: Project,
    lastDeletedMember?: TeamMember
  }>({
    show: false,
    message: ''
  });

  const [newProject, setNewProject] = useState<Partial<Project>>({
    type: 'interior',
    category: 'RESIDENTIAL',
    gallery: [],
    size: 'item-medium'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '#Jupiter@301275#') { // Simple but secure-feeling mock password
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const showAlert = (title: string, message: string) => {
    setModalConfig({ show: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ show: true, title, message, onConfirm, type: 'confirm' });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setNewProject(project);
    setIsAdding(true);
  };

  const uploadImage = async (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension 800px for safe payload size on restricted servers
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Aggressive compression (40%) to ensure successful upload on shared hosting
          resolve(canvas.toDataURL('image/jpeg', 0.4));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (isGallery) {
        const filesArray = Array.from(files);
        let index = 0;
        
        const processNext = async () => {
          if (index >= filesArray.length) return;
          const rawUrl = await readRawFile(filesArray[index]);
          setEnhancerSrc(rawUrl);
          setOnEnhancerSave(() => (enhancedUrl: string) => {
            setNewProject(prev => ({
              ...prev,
              gallery: [...(prev.gallery || []), enhancedUrl]
            }));
            index++;
            if (index < filesArray.length) {
              processNext();
            } else {
              setEnhancerSrc(null);
            }
          });
        };
        await processNext();
      } else {
        const rawUrl = await readRawFile(files[0]);
        setEnhancerSrc(rawUrl);
        setOnEnhancerSave(() => (enhancedUrl: string) => {
          setNewProject(prev => ({
            ...prev,
            image: enhancedUrl
          }));
          setEnhancerSrc(null);
        });
      }
    } catch (err) {
      showAlert("IMAGE ERROR", "Failed to process image.");
    }
  };

  const handleReplaceGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawUrl = await readRawFile(file);
      setEnhancerSrc(rawUrl);
      setOnEnhancerSave(() => (enhancedUrl: string) => {
        setNewProject(prev => {
          const newGallery = [...(prev.gallery || [])];
          newGallery[index] = enhancedUrl;
          return { ...prev, gallery: newGallery };
        });
        setEnhancerSrc(null);
      });
    } catch (err) {
      showAlert("IMAGE ERROR", "Failed to replace image.");
    }
  };

  const handleSlidePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawUrl = await readRawFile(file);
      setEnhancerSrc(rawUrl);
      setOnEnhancerSave(() => (enhancedUrl: string) => {
        setNewSlide((prev: any) => ({
          ...prev,
          image: enhancedUrl
        }));
        setEnhancerSrc(null);
      });
    } catch (err) {
      showAlert("IMAGE ERROR", "Failed to upload homepage slide.");
    }
  };

  const handleSaveSlide = async () => {
    if (!newSlide.image) {
      showAlert('MISSING PHOTO', 'Please upload a photo for the homepage.');
      return;
    }

    try {
      // Provide default values for unused fields
      const slideData = {
        title: 'Home Slide',
        category: 'Interior',
        description: '',
        ...newSlide
      };

      if (editingSlide) {
        await updateSlide(editingSlide.id, slideData);
        setToast({ show: true, message: `Updated Home Image` });
      } else {
        await addSlide(slideData);
        setToast({ show: true, message: `Added New Home Image` });
      }
      setIsAddingSlide(false);
      setEditingSlide(null);
      setNewSlide({});
    } catch (e: any) {
      console.error("Hero Save Error:", e);
      const errorMsg = e.response?.data?.error || e.message || "Check your Database/SSL";
      showAlert("SAVE ERROR", `Failed to save slide.\n\nServer says: ${errorMsg}`);
    }

    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawUrl = await readRawFile(file);
      setEnhancerSrc(rawUrl);
      setOnEnhancerSave(() => (enhancedUrl: string) => {
        setNewMember(prev => ({
          ...prev,
          image: enhancedUrl
        }));
        setEnhancerSrc(null);
      });
    } catch (err) {
      showAlert("IMAGE ERROR", "Failed to upload member photo.");
    }
  };

  const handleResetData = () => {
    showConfirm(
      'RESTORE SAMPLES',
      'This will reset your portfolio and team to the original samples. Proceed?',
      () => {
        localStorage.clear();
        window.location.reload();
      }
    );
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.image) {
      showAlert('MISSING INFORMATION', 'Please provide at least a Title and Cover Image.');
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, newProject as Project);
        setToast({
          show: true,
          message: `Changes saved for "${newProject.title}".`
        });
        setEditingProject(null);
      } else {
        const projectData = {
          title: newProject.title || '',
          category: newProject.category || 'RESIDENTIAL',
          type: (newProject.type as any) || 'interior',
          image: newProject.image || '',
          gallery: newProject.gallery || [],
          desc: newProject.desc || '',
          location: newProject.location || '',
          year: newProject.year || '2024',
          area: newProject.area || '',
          size: newProject.size || 'item-medium',
        };
        await addProject(projectData);
        setToast({
          show: true,
          message: `Project "${projectData.title}" published successfully!`
        });
      }

      setIsAdding(false);
      setNewProject({
        type: 'interior',
        category: 'RESIDENTIAL',
        gallery: [],
        size: 'item-medium'
      });

      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    } catch (e: any) {
      console.error("Project Save Error:", e);
      const errorMsg = e.response?.data?.error || e.message || "Check your Database/SSL";
      showAlert('SAVE ERROR', `Failed to save project.\n\nServer says: ${errorMsg}`);
    }
  };

  const handleSaveMember = async () => {
    if (!newMember.name || !newMember.image) {
      showAlert('MISSING INFO', 'Name and Photo are required.');
      return;
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, newMember);
        setToast({ show: true, message: `Updated ${newMember.name}` });
      } else {
        await addMember(newMember as Omit<TeamMember, 'id'>);
        setToast({ show: true, message: `Added ${newMember.name}` });
      }
      setIsAddingMember(false);
      setEditingMember(null);
      setNewMember({ socials: ['INSTAGRAM'] });
    } catch (e: any) {
      console.error("Member Save Error:", e);
      const errorMsg = e.response?.data?.error || e.message || "Check your Database/SSL";
      showAlert('SAVE ERROR', `Failed to save member.\n\nServer says: ${errorMsg}`);
    }

    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleDelete = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return;

    showConfirm(
      'DELETE PROJECT',
      `Are you sure you want to delete "${projectToDelete.title}"? This can be undone for a few seconds.`,
      () => {
        deleteProject(id);
        setToast({
          show: true,
          message: `Project "${projectToDelete.title}" deleted.`,
          lastDeleted: projectToDelete
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
      }
    );
  };

  const handleMemberDelete = (id: string) => {
    showConfirm(
      "REMOVE MEMBER?",
      "This member will be moved to the recycle bin and removed from the public team page.",
      () => deleteMember(id)
    );
  };

  const handleSlideDelete = (id: number) => {
    showConfirm(
      "REMOVE HOME IMAGE?",
      "This image will be permanently removed from the homepage carousel.",
      () => deleteSlide(id)
    );
  };

  const handleRestoreSlides = () => {
    showConfirm(
      "RESTORE DEFAULT IMAGES?",
      "This will reset your home carousel to the original studio showcase. Current images will be replaced.",
      () => restoreDefaultSlides()
    );
  };

  const handleUndo = () => {
    if (toast.lastDeleted) {
      addProject(toast.lastDeleted);
    } else if (toast.lastDeletedMember) {
      restoreMember(toast.lastDeletedMember.id);
    }
    setToast({ show: false, message: '' });
  };

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.type === filter);

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="login-screen"
      >
        <div className="login-bg-image" />
        <div className="login-overlay" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="login-card"
        >
          <div className="login-header">
            <div className="login-logo">
              ANSH<span>STUDIO</span>
            </div>
            <p>AUTHORIZED ACCESS ONLY</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className={`password-input-group ${loginError ? 'error' : ''}`}>
              <label>STUDIO KEY</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {loginError && <span className="error-msg">INVALID ACCESS KEY</span>}
            </div>
            <button type="submit" className="login-btn">
              <span>UNLOCK STUDIO MANAGER</span>
            </button>
          </form>

          <button onClick={onExit} className="login-exit">
            <ArrowLeft size={14} /> BACK TO PORTFOLIO
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`admin-panel ${adminTheme}`}
    >
      <div className="dashboard-layout">
        <nav className="dashboard-navbar">
          <div className="dash-nav-top">
            <div className="dash-nav-left">
              <div className="admin-logo-container">
                <img src="/logo.png" alt="Ansh Design Studio" className="admin-logo-img" />
              </div>
            </div>

            <div className="dash-nav-right">
              <button
                onClick={handleResetData}
                className="reset-data-btn"
                title="Restore Sample Projects"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setShowTrash(true)}
                className={`trash-toggle-btn ${(deletedProjects.length + deletedMembers.length) > 0 ? 'has-items' : ''}`}
                title="Trash Bin"
              >
                <Trash2 size={18} />
                {(deletedProjects.length + deletedMembers.length) > 0 && (
                  <span className="trash-count">{deletedProjects.length + deletedMembers.length}</span>
                )}
              </button>
              <button onClick={() => setAdminTheme(adminTheme === 'dark' ? 'light' : 'dark')} className="theme-toggle-btn">
                {adminTheme === 'dark' ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
              </button>
              <button onClick={() => setIsAdding(true)} className="add-btn-compact">
                <Plus size={18} />
              </button>
              <button onClick={onExit} className="exit-btn-circle">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="dash-nav-center">
            <div className="admin-main-tabs">
              <button
                className={activeTab === 'portfolio' ? 'active' : ''}
                onClick={() => setActiveTab('portfolio')}
              >
                PORTFOLIO
              </button>
              <button
                className={activeTab === 'team' ? 'active' : ''}
                onClick={() => setActiveTab('team')}
              >
                OUR TEAM
              </button>
              <button
                className={activeTab === 'hero' ? 'active' : ''}
                onClick={() => setActiveTab('hero')}
              >
                HOME
              </button>
            </div>

            {activeTab === 'portfolio' && (
              <div className="filter-pills">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                  <Layout size={14} />
                  <span>ALL</span>
                </button>
                <button className={filter === 'interior' ? 'active' : ''} onClick={() => setFilter('interior')}>
                  <Layers size={14} />
                  <span>INTERIOR</span>
                </button>
                <button className={filter === 'graphics' ? 'active' : ''} onClick={() => setFilter('graphics')}>
                  <Layers size={14} />
                  <span>GRAPHICS</span>
                </button>
                <button className={filter === 'architecture' ? 'active' : ''} onClick={() => setFilter('architecture')}>
                  <Layers size={14} />
                  <span>ARCHITECTURE</span>
                </button>
              </div>
            )}

            {activeTab === 'team' && (
              <button onClick={() => setIsAddingMember(true)} className="add-member-top-btn">
                <Plus size={14} /> ADD MEMBER
              </button>
            )}
          </div>
        </nav>

        <div className="dashboard-content">
          <header className="content-header">
            <div className="header-text">
              <h1>
                {activeTab === 'portfolio' ? 'Studio Portfolio' :
                  activeTab === 'team' ? 'Creative Team' : 'Home Images'}
              </h1>
              <p>
                {activeTab === 'portfolio' ? 'Manage your luxury portfolio and project exhibits' :
                  activeTab === 'team' ? 'Update staff profiles and creative bios' : 'Manage your homepage visual slides'}
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-pill storage-pill">
                <span className="pill-label">STUDIO STORAGE</span>
                <span className="pill-val unlimited">UNLIMITED</span>
              </div>

              {activeTab === 'portfolio' ? (
                <>
                  <div className="stat-pill">
                    <span className="pill-label">INTERIOR</span>
                    <span className="pill-val">{projects.filter(p => p.type === 'interior').length}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="pill-label">GRAPHICS</span>
                    <span className="pill-val">{projects.filter(p => p.type === 'graphics').length}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="pill-label">ARCHITECTURE</span>
                    <span className="pill-val">{projects.filter(p => p.type === 'architecture').length}</span>
                  </div>
                </>
              ) : activeTab === 'team' ? (
                <div className="stat-pill">
                  <span className="pill-label">TOTAL MEMBERS</span>
                  <span className="pill-val">{members.length}</span>
                </div>
              ) : (
                <div className="stat-pill">
                  <span className="pill-label">HOME IMAGES</span>
                  <span className="pill-val">{slides.length}</span>
                </div>
              )}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'portfolio' ? (
              <motion.div
                key="portfolio-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="advanced-project-grid"
              >
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    key={project.id}
                    className="advanced-card"
                  >
                    <div className="card-image-wrap">
                      <img src={project.image} alt="" />
                      <div className="card-badge">{project.type}</div>
                      <div className="card-actions-hover">
                        <div className="card-actions-inner">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(project); }} className="action-btn edit" title="Edit Content">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                            className="action-btn delete"
                            title="Move to Trash"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-details">
                      <span className="card-tag">{project.category}</span>
                      <h3>{project.title}</h3>
                      <div className="card-meta">
                        <span>{project.location || 'N/A'}</span>
                        <span className="dot">•</span>
                        <span>{project.year || '2024'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setIsAdding(true)}
                  className="add-project-placeholder"
                >
                  <div className="placeholder-content">
                    <div className="plus-icon"><Plus size={32} /></div>
                    <h3>Add New Work</h3>
                    <p>Click to expand your exhibit</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : activeTab === 'team' ? (
              <motion.div
                key="team-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="team-management-grid"
              >
                {members.map((member) => (
                  <div key={member.id} className="admin-team-card">
                    <div className="admin-team-img">
                      <img src={member.image} alt={member.name} />
                      <div className="card-actions-overlay">
                        <button onClick={() => {
                          setEditingMember(member);
                          setNewMember(member);
                          setIsAddingMember(true);
                        }} className="action-circle-btn edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleMemberDelete(member.id)} className="action-circle-btn delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="admin-team-info">
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsAddingMember(true)} className="add-member-large-card">
                  <Plus size={32} />
                  <span>ADD NEW MEMBER</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="hero-management"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="hero-management-grid"
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="admin-hero-card">
                    <div className="admin-hero-img">
                      <img src={slide.image} alt={slide.title} />
                      <div className="card-actions-overlay">
                        <button onClick={() => {
                          setEditingSlide(slide);
                          setNewSlide(slide);
                          setIsAddingSlide(true);
                        }} className="action-circle-btn edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleSlideDelete(slide.id)} className="action-circle-btn delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="admin-hero-info">
                      <span className="slide-cat">SLIDE {slides.indexOf(slide) + 1}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsAddingSlide(true)} className="add-hero-card">
                  <Plus size={32} />
                  <span>ADD NEW IMAGE</span>
                </button>
                <button onClick={handleRestoreSlides} className="restore-hero-card">
                  <RotateCcw size={32} />
                  <span>RESTORE DEFAULTS</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Modal */}
      <AnimatePresence>
        {modalConfig.show && (
          <div className="modal-wrapper centered">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalConfig({ ...modalConfig, show: false })}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="custom-modal"
            >
              <div className="modal-icon-box">
                {modalConfig.type === 'confirm' ? <Trash2 size={32} /> : <ImageIcon size={32} />}
              </div>
              <h3>{modalConfig.title}</h3>
              <p>{modalConfig.message}</p>
              <div className="modal-actions">
                {modalConfig.type === 'confirm' ? (
                  <>
                    <button className="modal-btn secondary" onClick={() => setModalConfig({ ...modalConfig, show: false })}>CANCEL</button>
                    <button className="modal-btn danger" onClick={() => {
                      modalConfig.onConfirm?.();
                      setModalConfig({ ...modalConfig, show: false });
                    }}>DELETE</button>
                  </>
                ) : (
                  <button className="modal-btn primary" onClick={() => setModalConfig({ ...modalConfig, show: false })}>UNDERSTOOD</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="modal-panel-advanced"
            >
              <div className="modal-header-advanced">
                <div className="header-title">
                  <span className="subtitle">{editingProject ? 'EDITORIAL MANAGER' : 'EXHIBIT MANAGER'}</span>
                  <h2>{editingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}</h2>
                </div>
                <button onClick={() => {
                  setIsAdding(false);
                  setEditingProject(null);
                  setNewProject({ type: 'interior', category: 'RESIDENTIAL', gallery: [], size: 'item-medium' });
                }} className="close-btn-circle"><X /></button>
              </div>

              <div className="modal-scroll-advanced">
                <div className="form-group-wrap">
                  <div className="form-section-advanced">
                    <label className="section-label">PROJECT TYPE</label>
                    <div className="luxury-type-selector">
                      <button
                        className={newProject.type === 'interior' ? 'active' : ''}
                        onClick={() => setNewProject({ ...newProject, type: 'interior' })}
                      >
                        <Layers size={18} />
                        <span>INTERIOR DESIGN</span>
                      </button>
                      <button
                        className={newProject.type === 'graphics' ? 'active' : ''}
                        onClick={() => setNewProject({ ...newProject, type: 'graphics' })}
                      >
                        <ImageIcon size={18} />
                        <span>GRAPHICS & EXHIBITS</span>
                      </button>
                      <button
                        className={newProject.type === 'architecture' ? 'active' : ''}
                        onClick={() => setNewProject({ ...newProject, type: 'architecture' })}
                      >
                        <Layout size={18} />
                        <span>ARCHITECTURE</span>
                      </button>
                    </div>
                  </div>

                  <div className="input-field full">
                    <label>PROJECT TITLE</label>
                    <input
                      type="text"
                      placeholder="Name of the masterpiece"
                      value={newProject.title || ''}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    />
                  </div>

                  <div className="input-field full">
                    <label>CATEGORY</label>
                    <input
                      type="text"
                      placeholder="RESIDENTIAL, COMMERCIAL, HOSPITALITY..."
                      value={newProject.category}
                      onChange={e => setNewProject({ ...newProject, category: e.target.value.toUpperCase() })}
                    />
                    <div className="role-suggestions">
                      {['RESIDENTIAL', 'COMMERCIAL', 'HOSPITALITY', 'RETAIL', 'EXHIBIT'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`suggestion-pill ${newProject.category === cat ? 'active' : ''}`}
                          onClick={() => setNewProject({ ...newProject, category: cat })}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(newProject.type === 'interior' || newProject.type === 'architecture') && (
                    <div className="form-section-advanced">
                      <label className="section-label">EDITORIAL GRID SIZE</label>
                      <div className="grid-selector">
                        {['item-medium', 'item-wide', 'item-tall', 'item-large'].map(size => (
                          <button
                            key={size}
                            className={newProject.size === size ? 'active' : ''}
                            onClick={() => setNewProject({ ...newProject, size })}
                          >
                            {size.replace('item-', '').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="input-field full">
                    <label>THE STORY (DESCRIPTION)</label>
                    <textarea
                      rows={5}
                      placeholder="Describe the architectural vision..."
                      value={newProject.desc || ''}
                      onChange={e => setNewProject({ ...newProject, desc: e.target.value })}
                    />
                  </div>

                  <div className="form-grid-3">
                    <div className="input-field">
                      <label><MapPin size={12} /> LOCATION</label>
                      <input
                        type="text"
                        placeholder="Mumbai, IN"
                        value={newProject.location || ''}
                        onChange={e => setNewProject({ ...newProject, location: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label><Calendar size={12} /> YEAR</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={newProject.year || ''}
                        onChange={e => setNewProject({ ...newProject, year: e.target.value })}
                      />
                    </div>
                    <div className="input-field">
                      <label><Maximize size={12} /> AREA</label>
                      <input
                        type="text"
                        placeholder="5000 SQFT"
                        value={newProject.area || ''}
                        onChange={e => setNewProject({ ...newProject, area: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-section-advanced">
                    <label className="section-label">VISUAL ASSETS</label>
                    <div className="asset-upload-container">
                      <div className="main-upload">
                        <label>COVER IMAGE</label>
                        <div className="luxury-upload-box">
                          {newProject.image ? (
                            <div className="preview-wrap">
                              <img src={newProject.image} alt="" />
                              <div className="asset-actions">
                                <label className="asset-action-btn edit" title="Replace Image">
                                  <RefreshCw size={14} />
                                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                                </label>
                                <button className="asset-action-btn delete" onClick={() => setNewProject({ ...newProject, image: '' })} title="Remove Image">
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="luxury-upload-label">
                              <div className="upload-icon-pulse"><Plus /></div>
                              <span>SELECT COVER PHOTO</span>
                              <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="gallery-upload">
                        <label>GALLERY COLLECTIONS</label>
                        <div className="luxury-gallery-grid">
                          {(newProject.gallery || []).map((img, i) => (
                            <div key={i} className="preview-wrap-small">
                              <img src={img} alt="" />
                              <div className="asset-actions-small">
                                <label className="asset-action-btn-small edit" title="Replace">
                                  <RefreshCw size={10} />
                                  <input type="file" accept="image/*" hidden onChange={(e) => handleReplaceGalleryImage(e, i)} />
                                </label>
                                <button className="asset-action-btn-small delete" onClick={() => setNewProject({ ...newProject, gallery: newProject.gallery?.filter((_, idx) => idx !== i) })} title="Remove">
                                  <X size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <label className="luxury-upload-label small">
                            <Plus size={20} />
                            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFileUpload(e, true)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-advanced">
                <button onClick={() => {
                  setIsAdding(false);
                  setEditingProject(null);
                  setNewProject({ type: 'interior', category: 'RESIDENTIAL', gallery: [], size: 'item-medium' });
                }} className="footer-cancel">CANCEL</button>
                <button onClick={handleAddProject} className="footer-save">
                  <span>{editingProject ? 'SAVE CHANGES' : 'PUBLISH PROJECT'}</span>
                  <Save size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trash Bin Modal */}
      <AnimatePresence>
        {showTrash && (
          <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowTrash(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="modal-panel-advanced trash-panel"
            >
              <div className="modal-header-advanced">
                <div className="header-title">
                  <span className="subtitle">RECYCLE BIN</span>
                  <h2>TRASHED PROJECTS</h2>
                </div>
                <button onClick={() => setShowTrash(false)} className="close-btn-circle"><X /></button>
              </div>

              <div className="modal-scroll-advanced">
                {(deletedProjects.length === 0 && deletedMembers.length === 0) ? (
                  <div className="empty-trash-state">
                    <div className="empty-icon"><RefreshCw size={48} /></div>
                    <h3>Trash is empty</h3>
                    <p>Deleted items will appear here for recovery.</p>
                  </div>
                ) : (
                  <div className="trash-grid">
                    {/* Render Deleted Projects */}
                    {deletedProjects.map(project => (
                      <div key={project.id} className="trash-item">
                        <img src={project.image} alt="" className="trash-thumb" />
                        <div className="trash-info">
                          <h4>{project.title}</h4>
                          <span>PROJECT</span>
                        </div>
                        <div className="trash-actions">
                          <button
                            onClick={() => restoreProject(project.id)}
                            className="restore-btn"
                            title="Restore Project"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => {
                              showConfirm(
                                'PERMANENT DELETE',
                                `Are you sure you want to permanently erase "${project.title}"?`,
                                () => permanentlyDeleteProject(project.id)
                              );
                            }}
                            className="perm-delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Render Deleted Members */}
                    {deletedMembers.map(member => (
                      <div key={member.id} className="trash-item">
                        <img src={member.image} alt="" className="trash-thumb" />
                        <div className="trash-info">
                          <h4>{member.name}</h4>
                          <span>TEAM MEMBER</span>
                        </div>
                        <div className="trash-actions">
                          <button
                            onClick={() => restoreMember(member.id)}
                            className="restore-btn"
                            title="Restore Member"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => {
                              showConfirm(
                                'PERMANENT DELETE',
                                `Are you sure you want to permanently erase "${member.name}"?`,
                                () => permanentlyDeleteMember(member.id)
                              );
                            }}
                            className="perm-delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Team Member Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => { setIsAddingMember(false); setEditingMember(null); }}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="modal-panel-advanced"
            >
              <div className="modal-header-advanced">
                <div className="header-title">
                  <span className="subtitle">TEAM MANAGER</span>
                  <h2>{editingMember ? 'EDIT MEMBER' : 'NEW CREATIVE'}</h2>
                </div>
                <button onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="close-btn-circle"><X /></button>
              </div>

              <div className="modal-scroll-advanced">
                <div className="form-group-wrap">
                  <div className="input-field">
                    <label>MEMBER NAME</label>
                    <input
                      type="text"
                      placeholder="e.g., Nayan Parmar"
                      value={newMember.name || ''}
                      onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div className="input-field">
                    <label>ROLE</label>
                    <input
                      type="text"
                      placeholder="e.g., Principal Designer"
                      value={newMember.role || ''}
                      onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                    />
                    <div className="role-suggestions">
                      {['Principal Designer', 'Architect', 'Senior Designer', 'Interior Designer', 'Project Manager', '3D Artist'].map(role => (
                        <button
                          key={role}
                          type="button"
                          className={`suggestion-pill ${newMember.role === role ? 'active' : ''}`}
                          onClick={() => setNewMember({ ...newMember, role })}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-section-advanced">
                    <label className="section-label">MEMBER PHOTO</label>
                    <div className="admin-image-upload">
                      {newMember.image ? (
                        <div className="upload-preview-container">
                          <img src={newMember.image} alt="Preview" className="upload-preview-main" />
                          <button
                            className="remove-img-btn"
                            onClick={() => setNewMember({ ...newMember, image: '' })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-trigger-large">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMemberPhotoUpload}
                            hidden
                          />
                          <ImageIcon size={32} />
                          <span>UPLOAD PROFILE PHOTO</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-advanced">
                <button onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="cancel-btn">CANCEL</button>
                <button onClick={handleSaveMember} className="save-btn-advanced">
                  <Save size={18} />
                  <span>{editingMember ? 'UPDATE CREATIVE' : 'PUBLISH MEMBER'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Slide Modal */}
      <AnimatePresence>
        {isAddingSlide && (
          <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => { setIsAddingSlide(false); setEditingSlide(null); setNewSlide({}); }}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="modal-panel-advanced"
            >
              <div className="modal-header-advanced">
                <div className="header-title">
                  <span className="subtitle">HOME MANAGER</span>
                  <h2>{editingSlide ? 'EDIT IMAGE' : 'NEW HOME IMAGE'}</h2>
                </div>
                <button onClick={() => { setIsAddingSlide(false); setEditingSlide(null); setNewSlide({}); }} className="close-btn-circle"><X /></button>
              </div>

              <div className="modal-scroll-advanced">
                <div className="form-group-wrap">
                  <div className="form-section-advanced">
                    <label className="section-label">UPLOAD IMAGE</label>
                    <p className="upload-tip">Upload a high-resolution image for the homepage hero section.</p>
                    <div className="admin-image-upload">
                      {newSlide.image ? (
                        <div className="upload-preview-container">
                          <img src={newSlide.image} alt="Preview" className="upload-preview-main" />
                          <button
                            className="remove-img-btn"
                            onClick={() => setNewSlide({ ...newSlide, image: '' })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-trigger-large">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSlidePhotoUpload}
                            hidden
                          />
                          <ImageIcon size={32} />
                          <span>CHOOSE IMAGE</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-advanced">
                <button onClick={() => { setIsAddingSlide(false); setEditingSlide(null); setNewSlide({}); }} className="cancel-btn">CANCEL</button>
                <button onClick={handleSaveSlide} className="save-btn-advanced">
                  <Save size={18} />
                  <span>{editingSlide ? 'UPDATE IMAGE' : 'PUBLISH IMAGE'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deletion Toast / Undo Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="admin-toast"
          >
            <div className="toast-content">
              <span>{toast.message}</span>
              <button onClick={handleUndo} className="undo-btn">UNDO</button>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="toast-close">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart HD Image Enhancer Modal */}
      {enhancerSrc && onEnhancerSave && (
        <ImageEnhancer
          imageSrc={enhancerSrc}
          onSave={onEnhancerSave}
          onClose={() => {
            setEnhancerSrc(null);
            setOnEnhancerSave(null);
          }}
        />
      )}

      <Footer onAdminClick={() => { }} />
    </motion.div>
  );
};

export default Admin;
