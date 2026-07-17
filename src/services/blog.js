import api from "../Api/api";

// Get all blogs
export const getAllBlogs = async () => {
  try {
    const response = await api.get("/blogs?admin=true");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create a new blog
export const createBlog = async (blogData) => {
  try {
    const response = await api.post("/blogs", blogData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a blog
export const updateBlog = async (id, blogData) => {
  try {
    const response = await api.put(`/blogs/${id}`, blogData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a blog
export const deleteBlog = async (id) => {
  try {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blog by ID
export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/blogs/${id}?admin=true`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
