import axios from 'axios'

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// ─── Token Helpers ─────────────────────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('eduverse_access_token')
const getRefreshToken = () => localStorage.getItem('eduverse_refresh_token')
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('eduverse_access_token', accessToken)
  if (refreshToken) localStorage.setItem('eduverse_refresh_token', refreshToken)
}
const clearTokens = () => {
  localStorage.removeItem('eduverse_access_token')
  localStorage.removeItem('eduverse_refresh_token')
  localStorage.removeItem('eduverse_user')
}

// ─── Refresh State (prevents multiple simultaneous refresh calls) ───────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ─── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        // Queue this request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        isRefreshing = false
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data
        setTokens(accessToken, newRefreshToken)

        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        clearTokens()

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    // Handle specific error cases
    if (error.response?.status === 403) {
      console.warn('EduVerse API: Access forbidden')
    }

    if (error.response?.status >= 500) {
      console.error('EduVerse API: Server error', error.response?.data)
    }

    // Network error
    if (!error.response) {
      console.error('EduVerse API: Network error - check your connection')
    }

    return Promise.reject(error)
  }
)

// ─── Convenience Methods ───────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  googleLogin: () => (window.location.href = '/api/auth/google'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),
  getTrending: () => api.get('/search/trending'),
  getHistory: () => api.get('/search/history'),
  clearHistory: () => api.delete('/search/history'),
}

export const videoAPI = {
  getVideo: (id) => api.get(`/videos/${id}`),
  getRelated: (id, params) => api.get(`/videos/${id}/related`, { params }),
  trackProgress: (id, data) => api.post(`/videos/${id}/progress`, data),
  getProgress: (id) => api.get(`/videos/${id}/progress`),
  rate: (id, data) => api.post(`/videos/${id}/rate`, data),
  addComment: (id, data) => api.post(`/videos/${id}/comments`, data),
  getComments: (id, params) => api.get(`/videos/${id}/comments`, { params }),
}

export const playlistAPI = {
  getAll: (params) => api.get('/playlists', { params }),
  getOne: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addVideo: (id, videoId) => api.post(`/playlists/${id}/videos`, { videoId }),
  removeVideo: (id, videoId) => api.delete(`/playlists/${id}/videos/${videoId}`),
  reorder: (id, data) => api.put(`/playlists/${id}/reorder`, data),
}

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  search: (query) => api.get('/notes/search', { params: { q: query } }),
  export: (id, format) => api.get(`/notes/${id}/export`, { params: { format }, responseType: 'blob' }),
}

export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  getAll: (params) => api.get('/quiz', { params }),
  getOne: (id) => api.get(`/quiz/${id}`),
  submit: (id, data) => api.post(`/quiz/${id}/submit`, data),
  getResults: (id) => api.get(`/quiz/${id}/results`),
  getLeaderboard: (id) => api.get(`/quiz/${id}/leaderboard`),
}

export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  getPost: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  updatePost: (id, data) => api.put(`/community/posts/${id}`, data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  likePost: (id) => api.post(`/community/posts/${id}/like`),
  addReply: (id, data) => api.post(`/community/posts/${id}/replies`, data),
  getReplies: (id, params) => api.get(`/community/posts/${id}/replies`, { params }),
}

export const roadmapAPI = {
  getAll: () => api.get('/roadmaps'),
  getOne: (id) => api.get(`/roadmaps/${id}`),
  getUserRoadmap: () => api.get('/roadmaps/user'),
  updateProgress: (id, data) => api.put(`/roadmaps/${id}/progress`, data),
  generate: (data) => api.post('/roadmaps/generate', data),
}

export const careerAPI = {
  getJobs: (params) => api.get('/career/jobs', { params }),
  getAnalysis: () => api.get('/career/analysis'),
  updateSkills: (data) => api.put('/career/skills', data),
  getRecommendations: () => api.get('/career/recommendations'),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getContent: (params) => api.get('/admin/content', { params }),
  approveContent: (id) => api.put(`/admin/content/${id}/approve`),
  rejectContent: (id, data) => api.put(`/admin/content/${id}/reject`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),
}

// ─── Token Helpers Export ──────────────────────────────────────────────────────
export { setTokens, clearTokens, getAccessToken, getRefreshToken }

export default api
