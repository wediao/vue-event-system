<template>
  <div class="admin-user-management">
    <h1>用戶管理</h1>

    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜尋用戶..."
          @input="handleSearch"
        >
      </div>
      
      <div class="filter-box">
        <select v-model="filterStatus">
          <option value="">所有狀態</option>
          <option value="active">啟用</option>
          <option value="inactive">停用</option>
        </select>
      </div>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>電子郵件</th>
            <th>註冊日期</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.registrationDate }}</td>
            <td>
              <span :class="['status-badge', user.status]">
                {{ user.status === 'active' ? '啟用' : '停用' }}
              </span>
            </td>
            <td>
              <button 
                class="btn-action"
                @click="toggleUserStatus(user)"
              >
                {{ user.status === 'active' ? '停用' : '啟用' }}
              </button>
              <button 
                class="btn-action"
                @click="resetPassword(user)"
              >
                重設密碼
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一頁
      </button>
      <span>第 {{ currentPage }} 頁，共 {{ totalPages }} 頁</span>
      <button 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一頁
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminUserManagement",
  data() {
    return {
      users: [],
      searchQuery: "",
      filterStatus: "",
      currentPage: 1,
      totalPages: 1
    };
  },
  methods: {
    async loadUsers() {
      try {
        // TODO: 實作載入用戶列表的 API 呼叫
        console.log("載入用戶列表");
      } catch (error) {
        console.error("載入失敗", error);
      }
    },
    handleSearch() {
      // TODO: 實作搜尋功能
    },
    async toggleUserStatus(user) {
      try {
        // TODO: 實作切換用戶狀態的 API 呼叫
        console.log("切換用戶狀態", user);
      } catch (error) {
        console.error("操作失敗", error);
      }
    },
    async resetPassword(user) {
      try {
        // TODO: 實作重設密碼的 API 呼叫
        console.log("重設密碼", user);
      } catch (error) {
        console.error("重設失敗", error);
      }
    },
    changePage(page) {
      this.currentPage = page;
      this.loadUsers();
    }
  },
  mounted() {
    this.loadUsers();
  }
};
</script>

<style scoped>
.admin-user-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-box input,
.filter-box select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.status-badge.active {
  background-color: #4caf50;
  color: white;
}

.status-badge.inactive {
  background-color: #f44336;
  color: white;
}

.btn-action {
  background-color: #6200ee;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-action:hover {
  background-color: #5000c9;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .users-table {
    font-size: 14px;
  }
  
  .btn-action {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style> 