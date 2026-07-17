import { useEffect, useState } from "react";
import api from "../Api/api";

export const useBlogs = () => {
  const [Blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/blogs?admin=true");
      setBlogs(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const createBlogs = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlogs = async (id, formData) => {
    setLoading(true);
    try {
      const response = await api.put(`/blogs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogs = async (id) => {
    try {
      const res = await api.delete(`/blogs/${id}`);
      await fetchBlogs();
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const createBlogCategory = async (data) => {
    setLoading(true);
    try {
      const response = await api.post("/Categories/blog", data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/blog");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  return {
    Blogs,
    setBlogs,
    fetchBlogs,
    fetchCategories,
    createBlogs,
    updateBlogs,
    categories,
    createBlogCategory,
    deleteBlogs,
    loading,
    error,
  };
};
