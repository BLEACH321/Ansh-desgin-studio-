import { useState, useEffect } from 'react';
import { initialProjects } from '../data/initialProjects';

export interface Project {
  id: string;
  title: string;
  category: string;
  type: 'interior' | 'graphics' | 'architecture';
  image: string;
  gallery: string[];
  desc: string;
  location?: string;
  year?: string;
  area?: string;
  size?: string;

}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deletedProjects, setDeletedProjects] = useState<Project[]>([]);

  const loadProjects = () => {
    // Load active projects
    const saved = localStorage.getItem('ads_projects');
    if (saved) {
      const current = JSON.parse(saved);
      
      // Auto-sync: If user has old data but is missing the new architecture projects, merge them
      const hasArchitecture = current.some((p: any) => p.type === 'architecture');
      if (!hasArchitecture) {
        const newArchProjects = initialProjects.filter(p => p.type === 'architecture');
        const merged = [...current, ...newArchProjects];
        localStorage.setItem('ads_projects', JSON.stringify(merged));
        setProjects(merged);
      } else {
        setProjects(current);
      }
    } else {
      setProjects(initialProjects as Project[]);
      localStorage.setItem('ads_projects', JSON.stringify(initialProjects));
    }

    // Load trash
    const savedTrash = localStorage.getItem('ads_projects_trash');
    if (savedTrash) {
      setDeletedProjects(JSON.parse(savedTrash));
    }
  };

  useEffect(() => {
    loadProjects();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ads_projects' || e.key === 'ads_projects_trash') {
        loadProjects();
      }
    };

    const handleLocalUpdate = () => loadProjects();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectsUpdated', handleLocalUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectsUpdated', handleLocalUpdate);
    };
  }, []);

  const notifyUpdate = () => {
    window.dispatchEvent(new Event('projectsUpdated'));
  };

  const addProject = (project: Project) => {
    try {
      const saved = localStorage.getItem('ads_projects');
      const current = saved ? JSON.parse(saved) : initialProjects;
      const updated = [project, ...current];
      localStorage.setItem('ads_projects', JSON.stringify(updated));
      setProjects(updated);
      notifyUpdate();
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        // Auto-optimize: Clear trash to make space
        localStorage.removeItem('ads_projects_trash');
        setDeletedProjects([]);
        
        // Retry
        try {
          const saved = localStorage.getItem('ads_projects');
          const current = saved ? JSON.parse(saved) : initialProjects;
          const updated = [project, ...current];
          localStorage.setItem('ads_projects', JSON.stringify(updated));
          setProjects(updated);
          notifyUpdate();
          return;
        } catch (retryError) {
          throw new Error('STORAGE_FULL');
        }
      }
      throw e;
    }
  };

  const deleteProject = (id: string) => {
    const saved = localStorage.getItem('ads_projects');
    const current = saved ? JSON.parse(saved) : initialProjects;
    const projectToDelete = current.find((p: Project) => p.id === id);
    
    if (projectToDelete) {
      try {
        // Move to trash
        const savedTrash = localStorage.getItem('ads_projects_trash');
        const currentTrash = savedTrash ? JSON.parse(savedTrash) : [];
        const updatedTrash = [projectToDelete, ...currentTrash];
        localStorage.setItem('ads_projects_trash', JSON.stringify(updatedTrash));
        setDeletedProjects(updatedTrash);

        // Remove from active
        const updated = current.filter((p: Project) => p.id !== id);
        localStorage.setItem('ads_projects', JSON.stringify(updated));
        setProjects(updated);
        notifyUpdate();
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          // If trash is full, we might need to permanently delete something 
          // or just clear the whole trash.
          localStorage.removeItem('ads_projects_trash');
          setDeletedProjects([]);
          // Retry
          try {
            const updatedTrash = [projectToDelete];
            localStorage.setItem('ads_projects_trash', JSON.stringify(updatedTrash));
            setDeletedProjects(updatedTrash);
            
            const updated = current.filter((p: Project) => p.id !== id);
            localStorage.setItem('ads_projects', JSON.stringify(updated));
            setProjects(updated);
            notifyUpdate();
            return;
          } catch (retryError) {
            throw new Error('STORAGE_FULL');
          }
        }
        throw e;
      }
    }
  };

  const restoreProject = (id: string) => {
    const savedTrash = localStorage.getItem('ads_projects_trash');
    if (!savedTrash) return;
    
    try {
      const currentTrash = JSON.parse(savedTrash);
      const projectToRestore = currentTrash.find((p: Project) => p.id === id);
      
      if (projectToRestore) {
        // Remove from trash
        const updatedTrash = currentTrash.filter((p: Project) => p.id !== id);
        localStorage.setItem('ads_projects_trash', JSON.stringify(updatedTrash));
        setDeletedProjects(updatedTrash);

        // Add to active
        const saved = localStorage.getItem('ads_projects');
        const current = saved ? JSON.parse(saved) : [];
        const updated = [projectToRestore, ...current];
        localStorage.setItem('ads_projects', JSON.stringify(updated));
        setProjects(updated);
        notifyUpdate();
      }
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') throw new Error('STORAGE_FULL');
      throw e;
    }
  };

  const permanentlyDeleteProject = (id: string) => {
    const savedTrash = localStorage.getItem('ads_projects_trash');
    if (!savedTrash) return;
    
    const currentTrash = JSON.parse(savedTrash);
    const updatedTrash = currentTrash.filter((p: Project) => p.id !== id);
    localStorage.setItem('ads_projects_trash', JSON.stringify(updatedTrash));
    setDeletedProjects(updatedTrash);
    notifyUpdate();
  };

  const updateProject = (updatedProject: Project) => {
    try {
      const saved = localStorage.getItem('ads_projects');
      const current = saved ? JSON.parse(saved) : initialProjects;
      const updated = current.map((p: Project) => p.id === updatedProject.id ? updatedProject : p);
      localStorage.setItem('ads_projects', JSON.stringify(updated));
      setProjects(updated);
      notifyUpdate();
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        // Auto-optimize: Clear trash to make space
        localStorage.removeItem('ads_projects_trash');
        setDeletedProjects([]);
        
        // Retry once after clearing trash
        try {
          const savedRetry = localStorage.getItem('ads_projects');
          const current = savedRetry ? JSON.parse(savedRetry) : initialProjects;
          const updated = current.map((p: Project) => p.id === updatedProject.id ? updatedProject : p);
          localStorage.setItem('ads_projects', JSON.stringify(updated));
          setProjects(updated);
          notifyUpdate();
          return;
        } catch (retryError) {
          throw new Error('STORAGE_FULL');
        }
      }
      throw e;
    }
  };

  const saveProjects = (updated: Project[]) => {
    localStorage.setItem('ads_projects', JSON.stringify(updated));
    setProjects(updated);
    notifyUpdate();
  };

  return { 
    projects, 
    deletedProjects,
    addProject, 
    deleteProject, 
    restoreProject,
    updateProject,
    permanentlyDeleteProject,
    setProjects: saveProjects 
  };
};
