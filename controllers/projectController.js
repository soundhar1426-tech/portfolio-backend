const Project = require('../models/Project');

// Helper to parse tech stack array
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field.filter(item => item && item.trim().length > 0);
  if (typeof field === 'string') {
    return field
      .split(/[\n,]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  return [];
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ success: false, message: 'Unable to load projects' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving project' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Protected (Management Password required)
const createProject = async (req, res) => {
  try {
    const { projectName, shortDescription, techStack, keyFeatures, projectYear, githubUrl, liveWebsiteUrl } = req.body;

    if (!projectName || !shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Project Name and Short Description are required'
      });
    }

    const parsedTechStack = parseArrayField(techStack);
    if (parsedTechStack.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one technology is required for Tech Stack'
      });
    }

    const parsedKeyFeatures = parseArrayField(keyFeatures);

    const project = await Project.create({
      projectName: projectName.trim(),
      shortDescription: shortDescription.trim(),
      techStack: parsedTechStack,
      keyFeatures: parsedKeyFeatures,
      projectYear: projectYear ? projectYear.trim() : '',
      githubUrl: githubUrl ? githubUrl.trim() : '',
      liveWebsiteUrl: liveWebsiteUrl ? liveWebsiteUrl.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ success: false, message: 'Unable to add project: ' + error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Protected (Management Password required)
const updateProject = async (req, res) => {
  try {
    const { projectName, shortDescription, techStack, keyFeatures, projectYear, githubUrl, liveWebsiteUrl } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updateData = {};
    if (projectName) updateData.projectName = projectName.trim();
    if (shortDescription) updateData.shortDescription = shortDescription.trim();
    if (techStack !== undefined) updateData.techStack = parseArrayField(techStack);
    if (keyFeatures !== undefined) updateData.keyFeatures = parseArrayField(keyFeatures);
    if (projectYear !== undefined) updateData.projectYear = projectYear.trim();
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl.trim();
    if (liveWebsiteUrl !== undefined) updateData.liveWebsiteUrl = liveWebsiteUrl.trim();

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ success: false, message: 'Unable to update project: ' + error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Protected (Management Password required)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete project' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
